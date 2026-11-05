import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const uid = process.argv[2];
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!uid || !projectId) {
  console.error('Usage: FIREBASE_PROJECT_ID=<project-id> npm run provision:overseer -- <firebase-auth-uid>');
  process.exitCode = 1;
} else {
  try {
    initializeApp({
      credential: applicationDefault(),
      projectId,
    });

    const auth = getAuth();
    const user = await auth.getUser(uid);
    const userDocument = getFirestore().collection('users').doc(uid);
    const userSnapshot = await userDocument.get();

    if (!userSnapshot.exists) {
      throw new Error(`No Firestore user profile exists for UID ${uid}.`);
    }

    await userDocument.set({ accountType: 'overseer' }, { merge: true });
    await auth.setCustomUserClaims(uid, {
      ...user.customClaims,
      overseer: true,
    });

    console.log(`Granted overseer access to Firebase user ${uid}. They must sign in again to refresh their token.`);
  } catch (error) {
    console.error('Unable to grant overseer access:', error);
    process.exitCode = 1;
  }
}
