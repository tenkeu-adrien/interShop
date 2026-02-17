import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTask
} from 'firebase/storage';
import { storage } from './config';

export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

/**
 * Upload une image vers Firebase Storage
 * @param file - Fichier à uploader
 * @param path - Chemin dans Storage (ex: 'products/images')
 * @param onProgress - Callback pour suivre la progression
 * @returns URL de téléchargement de l'image
 */
export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Valider que c'est une image
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  // Valider la taille (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('L\'image ne doit pas dépasser 5MB');
  }

  // Créer un nom de fichier unique
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  // Upload avec suivi de progression
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Upload une vidéo vers Firebase Storage
 * @param file - Fichier vidéo à uploader
 * @param path - Chemin dans Storage (ex: 'products/videos')
 * @param onProgress - Callback pour suivre la progression
 * @returns URL de téléchargement de la vidéo
 */
export async function uploadVideo(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Valider que c'est une vidéo
  if (!file.type.startsWith('video/')) {
    throw new Error('Le fichier doit être une vidéo');
  }

  // Valider la taille (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error('La vidéo ne doit pas dépasser 50MB');
  }

  // Créer un nom de fichier unique
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  // Upload avec suivi de progression
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Upload plusieurs images en parallèle
 * @param files - Liste de fichiers à uploader
 * @param path - Chemin dans Storage
 * @param onProgress - Callback pour suivre la progression globale
 * @returns Liste des URLs de téléchargement
 */
export async function uploadMultipleImages(
  files: File[],
  path: string,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const totalFiles = files.length;
  let completedFiles = 0;

  const uploadPromises = files.map(async (file) => {
    const url = await uploadImage(file, path, (fileProgress) => {
      // Calculer la progression globale
      const globalProgress = ((completedFiles + fileProgress / 100) / totalFiles) * 100;
      if (onProgress) {
        onProgress(globalProgress);
      }
    });
    completedFiles++;
    return url;
  });

  return Promise.all(uploadPromises);
}

/**
 * Supprimer un fichier de Firebase Storage
 * @param url - URL du fichier à supprimer
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    // Extraire le chemin du fichier depuis l'URL
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Supprimer plusieurs fichiers
 * @param urls - Liste des URLs à supprimer
 */
export async function deleteMultipleFiles(urls: string[]): Promise<void> {
  const deletePromises = urls.map((url) => deleteFile(url));
  await Promise.all(deletePromises);
}

/**
 * Compresser une image avant l'upload
 * @param file - Fichier image à compresser
 * @param maxWidth - Largeur maximale
 * @param maxHeight - Hauteur maximale
 * @param quality - Qualité de compression (0-1)
 * @returns Fichier compressé
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculer les nouvelles dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Valider un fichier image
 * @param file - Fichier à valider
 * @returns true si valide, sinon lance une erreur
 */
export function validateImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Format d\'image non supporté. Utilisez JPG, PNG, WEBP ou GIF');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('L\'image ne doit pas dépasser 5MB');
  }

  return true;
}

/**
 * Valider un fichier vidéo
 * @param file - Fichier à valider
 * @returns true si valide, sinon lance une erreur
 */
export function validateVideoFile(file: File): boolean {
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Format de vidéo non supporté. Utilisez MP4, WEBM ou OGG');
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error('La vidéo ne doit pas dépasser 50MB');
  }

  return true;
}
