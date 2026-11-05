import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { UserAssignmentState, UserProfile } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with Database ID if specified
export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

export type AccountCategory = 'member' | 'overseer';

export interface FirebaseUserData {
  uid: string;
  email: string;
  fullName: string;
  accountType: AccountCategory;
  country: string;
  stateChapter: string;
  zoneRegion: string;
  lgaDistrict?: string;
  branchFellowship?: string;
  state?: UserAssignmentState;
  overseerNote?: string;
  createdAt?: string;
  lastLogin?: string;
}

/**
 * Register new user with Firebase Auth and initialize profile in Firestore
 */
export async function registerUserWithFirebase(
  email: string, 
  pass: string, 
  fullName: string, 
  accountType: AccountCategory,
  country: string,
  stateChapter: string,
  zoneRegion: string,
  lgaDistrict: string,
  branchFellowship: string,
  initialState: UserAssignmentState
): Promise<{ user: FirebaseUser; userData: FirebaseUserData }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  const profile: UserProfile = {
    ...initialState.profile,
    fullName: fullName || initialState.profile.fullName,
    country: country || initialState.profile.country || 'Nigeria',
    stateChapter: stateChapter || initialState.profile.stateChapter,
    zoneRegion: zoneRegion || initialState.profile.zoneRegion,
    lgaDistrict: lgaDistrict || initialState.profile.lgaDistrict || '',
    branchFellowship: branchFellowship || initialState.profile.branchFellowship || '',
  };

  const updatedState: UserAssignmentState = {
    ...initialState,
    profile,
  };

  const userData: FirebaseUserData = {
    uid: user.uid,
    email: user.email || email,
    fullName: fullName || 'HOREMOW Member',
    accountType,
    country: country || 'Nigeria',
    stateChapter: stateChapter || 'National Headquarter',
    zoneRegion: zoneRegion || 'Central Region',
    lgaDistrict: lgaDistrict || '',
    branchFellowship: branchFellowship || '',
    state: updatedState,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  // Save to Firestore
  await setDoc(doc(db, 'users', user.uid), userData);

  return { user, userData };
}

/**
 * Sign in existing user with Firebase Auth
 */
export async function loginUserWithFirebase(email: string, pass: string): Promise<{ user: FirebaseUser; userData: FirebaseUserData | null }> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  const userDocRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userDocRef);

  let userData: FirebaseUserData | null = null;
  if (userSnap.exists()) {
    userData = userSnap.data() as FirebaseUserData;
    // update last login timestamp
    await updateDoc(userDocRef, { lastLogin: new Date().toISOString() });
  }

  return { user, userData };
}

/**
 * Save current user assignment state to Firestore
 */
export async function syncStateToFirestore(uid: string, state: UserAssignmentState) {
  if (!uid || uid === 'guest') return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      uid,
      email: state.profile.fullName ? `${state.profile.fullName.toLowerCase().replace(/\s+/g, '')}@horemow.org` : '',
      fullName: state.profile.fullName,
      country: state.profile.country || 'Nigeria',
      stateChapter: state.profile.stateChapter,
      zoneRegion: state.profile.zoneRegion,
      lgaDistrict: state.profile.lgaDistrict || '',
      branchFellowship: state.profile.branchFellowship || '',
      state,
      lastLogin: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error syncing to Firestore:', err);
  }
}

/**
 * Fetch user data from Firestore
 */
export async function fetchUserDataFromFirestore(uid: string): Promise<FirebaseUserData | null> {
  if (!uid || uid === 'guest') return null;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirebaseUserData;
    }
  } catch (err) {
    console.error('Error fetching user data from Firestore:', err);
  }
  return null;
}

/**
 * Overseer feature: Fetch all members under oversight
 */
export async function fetchAllMembersForOverseer(): Promise<FirebaseUserData[]> {
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    const members: FirebaseUserData[] = [];
    snap.forEach((d) => {
      members.push(d.data() as FirebaseUserData);
    });
    return members;
  } catch (err) {
    console.error('Error fetching members for overseer:', err);
    throw err;
  }
}

/**
 * Overseer feature: Send an encouragement note / assignment directive to a member
 */
export async function sendOverseerNoteToMember(memberUid: string, note: string) {
  try {
    const userDocRef = doc(db, 'users', memberUid);
    await updateDoc(userDocRef, { overseerNote: note });
  } catch (err) {
    console.error('Error sending overseer note:', err);
    throw err;
  }
}

/**
 * Sign out
 */
export async function logoutUserFromFirebase() {
  await firebaseSignOut(auth);
}
