import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
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
  updateDoc
} from 'firebase/firestore/lite';
import firebaseConfigData from '../../firebase-applet-config.json';
import { UserAssignmentState } from '../types';
import { createInitialMemberState } from '../data/initialData';
import { shouldShowGettingStarted } from './onboarding';
export { shouldShowGettingStarted } from './onboarding';

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
export { onAuthStateChanged };

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
  onboardingCompleted?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface FirebaseAuthContext {
  userData: FirebaseUserData | null;
  isOverseer: boolean;
}

const authContextPromises = new Map<string, Promise<FirebaseAuthContext>>();

/**
 * Register new user with Firebase Auth and initialize profile in Firestore
 */
export async function registerUserWithFirebase(
  email: string, 
  pass: string, 
  fullName: string, 
  country: string,
  stateChapter: string,
  zoneRegion: string,
  lgaDistrict: string,
  branchFellowship: string
): Promise<{ user: FirebaseUser; userData: FirebaseUserData }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  const state = createInitialMemberState({
    fullName,
    country: country || 'Nigeria',
    stateChapter: stateChapter || 'National Headquarter',
    zoneRegion: zoneRegion || 'Central Region',
    lgaDistrict,
    branchFellowship,
  });

  const userData: FirebaseUserData = {
    uid: user.uid,
    email: user.email || email,
    fullName: fullName || 'HOREMOW Member',
    accountType: 'member',
    country: state.profile.country,
    stateChapter: state.profile.stateChapter,
    zoneRegion: state.profile.zoneRegion,
    lgaDistrict: lgaDistrict || '',
    branchFellowship: branchFellowship || '',
    state,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  const contextPromise = setDoc(doc(db, 'users', user.uid), userData)
    .then(() => ({ userData, isOverseer: false }));
  authContextPromises.set(user.uid, contextPromise);
  try {
    await contextPromise;
    return { user, userData };
  } catch (error) {
    authContextPromises.delete(user.uid);
    throw error;
  }
}

async function loadAuthContext(user: FirebaseUser): Promise<FirebaseAuthContext> {
  const userDocRef = doc(db, 'users', user.uid);
  const [userSnap, tokenResult] = await Promise.all([
    getDoc(userDocRef),
    user.getIdTokenResult(),
  ]);

  if (userSnap.exists()) {
    const userData = userSnap.data() as FirebaseUserData;
    const onboardingCompleted = userData.onboardingCompleted ?? !shouldShowGettingStarted(
      undefined,
      user.metadata.creationTime || null,
    );
    void updateDoc(userDocRef, {
      lastLogin: new Date().toISOString(),
      ...(userData.onboardingCompleted === undefined ? { onboardingCompleted } : {}),
    }).catch((error: unknown) => {
      console.error('Error updating user login metadata:', error);
    });
    return {
      userData: { ...userData, onboardingCompleted },
      isOverseer: tokenResult.claims.overseer === true,
    };
  }

  if (tokenResult.claims.overseer === true) return { userData: null, isOverseer: true };

  const state = createInitialMemberState({
    fullName: user.displayName || 'HOREMOW Member',
    country: 'Nigeria',
    stateChapter: 'National Headquarter',
    zoneRegion: 'Central Region',
    lgaDistrict: '',
    branchFellowship: '',
  });
  const shouldShowTour = shouldShowGettingStarted(
    undefined,
    user.metadata.creationTime || null,
  );
  const userData: FirebaseUserData = {
    uid: user.uid,
    email: user.email || '',
    fullName: state.profile.fullName,
    accountType: 'member',
    country: state.profile.country,
    stateChapter: state.profile.stateChapter,
    zoneRegion: state.profile.zoneRegion,
    lgaDistrict: '',
    branchFellowship: '',
    state,
    onboardingCompleted: !shouldShowTour,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  await setDoc(userDocRef, userData);
  return { userData, isOverseer: false };
}

export function getFirebaseAuthContext(user: FirebaseUser): Promise<FirebaseAuthContext> {
  const existingPromise = authContextPromises.get(user.uid);
  if (existingPromise) return existingPromise;

  const contextPromise = loadAuthContext(user);
  authContextPromises.set(user.uid, contextPromise);
  void contextPromise.catch(() => {
    if (authContextPromises.get(user.uid) === contextPromise) {
      authContextPromises.delete(user.uid);
    }
  });
  return contextPromise;
}

export function clearFirebaseAuthContextCache(): void {
  authContextPromises.clear();
}

/**
 * Sign in existing user with Firebase Auth
 */
export async function loginUserWithFirebase(email: string, pass: string): Promise<{ user: FirebaseUser } & FirebaseAuthContext> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  return { user, ...await getFirebaseAuthContext(user) };
}

export async function signInWithGoogle(): Promise<{ user: FirebaseUser } & FirebaseAuthContext> {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return { user: result.user, ...await getFirebaseAuthContext(result.user) };
}

export async function completeUserOnboarding(uid: string): Promise<void> {
  if (!uid || uid === 'guest') {
    throw new Error('A signed-in member is required to save onboarding progress.');
  }

  await updateDoc(doc(db, 'users', uid), { onboardingCompleted: true });
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
      email: auth.currentUser?.email || '',
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
