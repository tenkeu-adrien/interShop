/**
 * Utilitaire de compression vidéo côté client
 * Compresse les vidéos pour réduire la taille sans détruire la qualité
 */

export interface CompressionOptions {
  maxWidth?: number;      // Largeur max (défaut: 1920)
  maxHeight?: number;     // Hauteur max (défaut: 1080)
  quality?: number;       // Qualité 0-1 (défaut: 0.8)
  bitrate?: number;       // Bitrate en bps (défaut: 2500000 = 2.5Mbps)
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  duration: number;
}

/**
 * Compresse une vidéo en utilisant le canvas et MediaRecorder
 * Préserve la qualité visuelle tout en réduisant la taille du fichier
 */
export async function compressVideo(
  file: File,
  options: CompressionOptions = {},
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    bitrate = 2500000 // 2.5 Mbps pour bonne qualité
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas non supporté'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    
    const originalSize = file.size;
    const chunks: Blob[] = [];

    video.onloadedmetadata = () => {
      // Calculer les nouvelles dimensions en préservant le ratio
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Configuration MediaRecorder avec codec optimisé
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Essayer différents codecs par ordre de préférence
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrate
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: mimeType });
        const compressedSize = compressedBlob.size;
        const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

        // Créer un nouveau fichier avec le blob compressé
        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, '') + '_compressed.webm',
          { type: mimeType }
        );

        resolve({
          file: compressedFile,
          originalSize,
          compressedSize,
          compressionRatio,
          duration: video.duration
        });

        // Cleanup
        URL.revokeObjectURL(video.src);
      };

      mediaRecorder.onerror = (error) => {
        reject(error);
      };

      // Démarrer l'enregistrement
      mediaRecorder.start();
      video.play();

      let lastProgress = 0;

      // Dessiner les frames
      const drawFrame = () => {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, width, height);
          
          // Calculer la progression
          const progress = (video.currentTime / video.duration) * 100;
          if (progress - lastProgress >= 5 && onProgress) {
            onProgress(Math.round(progress));
            lastProgress = progress;
          }
          
          requestAnimationFrame(drawFrame);
        } else {
          mediaRecorder.stop();
        }
      };

      drawFrame();
    };

    video.onerror = () => {
      reject(new Error('Erreur lors du chargement de la vidéo'));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Vérifie si un fichier est une vidéo et sa taille
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format vidéo non supporté. Utilisez MP4, WebM, MOV ou AVI.'
    };
  }

  // Limite à 100 MB pour la vidéo d'origine
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'La vidéo est trop volumineuse (max 100 MB).'
    };
  }

  return { valid: true };
}

/**
 * Formate la taille de fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
