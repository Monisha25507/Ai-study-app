import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestore';

const googleProvider = new GoogleAuthProvider();

export const signUp = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  await createUserProfile(userCredential.user.uid, {
    name,
    email,
    photoURL: userCredential.user.photoURL || '',
  });
  return userCredential.user;
};

export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;
  await createUserProfile(user.uid, {
    name: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
  });
  return user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};
