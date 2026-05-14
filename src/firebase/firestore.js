import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

// ─── User Profile ───────────────────────────────────────────────────────────
export const createUserProfile = async (uid, data) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  }
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

// ─── Notes ──────────────────────────────────────────────────────────────────
export const addNote = async (uid, note) => {
  return await addDoc(collection(db, 'users', uid, 'notes'), {
    ...note,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getNotes = async (uid) => {
  const q = query(collection(db, 'users', uid, 'notes'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateNote = async (uid, noteId, data) => {
  await updateDoc(doc(db, 'users', uid, 'notes', noteId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteNote = async (uid, noteId) => {
  await deleteDoc(doc(db, 'users', uid, 'notes', noteId));
};

// ─── Doubts / Chat ──────────────────────────────────────────────────────────
export const addDoubtConversation = async (uid, conversation) => {
  return await addDoc(collection(db, 'users', uid, 'doubts'), {
    ...conversation,
    createdAt: serverTimestamp(),
  });
};

export const getDoubtConversations = async (uid) => {
  const q = query(collection(db, 'users', uid, 'doubts'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateDoubtConversation = async (uid, docId, data) => {
  await updateDoc(doc(db, 'users', uid, 'doubts', docId), data);
};

export const deleteDoubtConversation = async (uid, docId) => {
  await deleteDoc(doc(db, 'users', uid, 'doubts', docId));
};

// ─── PDFs ────────────────────────────────────────────────────────────────────
export const addPDFMetadata = async (uid, metadata) => {
  return await addDoc(collection(db, 'users', uid, 'pdfs'), {
    ...metadata,
    uploadedAt: serverTimestamp(),
  });
};

export const getPDFs = async (uid) => {
  const q = query(collection(db, 'users', uid, 'pdfs'), orderBy('uploadedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deletePDFMetadata = async (uid, pdfId) => {
  await deleteDoc(doc(db, 'users', uid, 'pdfs', pdfId));
};

// ─── Quiz Results ────────────────────────────────────────────────────────────
export const saveQuizResult = async (uid, result) => {
  return await addDoc(collection(db, 'users', uid, 'quizResults'), {
    ...result,
    takenAt: serverTimestamp(),
  });
};

export const getQuizResults = async (uid) => {
  const q = query(collection(db, 'users', uid, 'quizResults'), orderBy('takenAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
