// Base64 conversion function (only method we're using)
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to convert image to base64"));
    };
    reader.readAsDataURL(file);
  });
};

// Compress image before converting to base64 (to reduce size)
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          reject(new Error("Failed to compress image"));
        }
      }, file.type, quality);
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

// Main upload function - converts image to base64
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate the file first
    validateImageFile(file);
    
    // Compress the image to reduce size
    const compressedFile = await compressImage(file);
    
    // Convert to base64
    const base64String = await convertImageToBase64(compressedFile);
    
    return base64String;
  } catch (error: any) {
    console.error("Error converting image to base64:", error);
    throw new Error("Failed to process image. Please try again.");
  }
};

// Retry function for base64 conversion
export const uploadImageWithRetry = async (file: File, maxRetries: number = 3): Promise<string> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadImage(file);
    } catch (error: any) {
      lastError = error;
      console.warn(`Upload attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError!;
};

export const validateImageFile = (file: File): boolean => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error("Please select a valid image file (JPEG, PNG, or WebP).");
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Image file size must be less than 5MB.");
  }
  
  return true;
}; 