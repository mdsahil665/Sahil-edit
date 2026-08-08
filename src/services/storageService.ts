import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../lib/firebase';

export const storage = getStorage(app);

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Compresses an image file client-side before uploading.
 * Max width/height 1200px, quality 0.85
 */
export async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<Blob> {
  if (file.type === 'image/svg+xml') {
    return file; // SVGs don't need canvas compression
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          mimeType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads a logo file or blob to Firebase Storage at `logos/site_logo_<timestamp>`
 */
export async function uploadSiteLogo(
  fileOrBlob: File | Blob,
  fileName: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const timestamp = Date.now();
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `logos/site_logo_${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, fileOrBlob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase Storage Upload Error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });
}

/**
 * Uploads a user profile photo to Firebase Storage at `users/<uid>/profile_<timestamp>`
 */
export async function uploadUserProfilePhoto(
  uid: string,
  fileOrBlob: File | Blob,
  fileName: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const timestamp = Date.now();
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `users/${uid}/profile_${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, fileOrBlob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase Storage User Photo Upload Error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });
}

/**
 * Deletes a storage file by full URL if it is hosted on Firebase Storage
 */
export async function deleteStorageFileByUrl(url: string): Promise<void> {
  if (!url || !url.includes('firebasestorage.googleapis.com')) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Firebase Storage file delete notice:', err);
  }
}
