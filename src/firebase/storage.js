import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

export const uploadPDF = (uid, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `users/${uid}/pdfs/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ downloadURL, fullPath: uploadTask.snapshot.ref.fullPath });
      }
    );
  });
};

export const deletePDF = async (fullPath) => {
  const storageRef = ref(storage, fullPath);
  await deleteObject(storageRef);
};
