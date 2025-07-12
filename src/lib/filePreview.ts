import { MessageAttachment } from "./message";

// File type categories
export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
};

// Get file type category
export const getFileTypeCategory = (mimeType: string): string => {
  if (FILE_TYPES.IMAGE.includes(mimeType)) return 'image';
  if (FILE_TYPES.VIDEO.includes(mimeType)) return 'video';
  if (FILE_TYPES.AUDIO.includes(mimeType)) return 'audio';
  if (FILE_TYPES.DOCUMENT.includes(mimeType)) return 'document';
  if (FILE_TYPES.ARCHIVE.includes(mimeType)) return 'archive';
  return 'other';
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file icon based on type
export const getFileIcon = (mimeType: string): string => {
  const category = getFileTypeCategory(mimeType);
  
  switch (category) {
    case 'image':
      return '🖼️';
    case 'video':
      return '🎥';
    case 'audio':
      return '🎵';
    case 'document':
      return '📄';
    case 'archive':
      return '📦';
    default:
      return '📎';
  }
};

// Create preview URL for file
export const createFilePreviewUrl = (attachment: MessageAttachment): string => {
  return `data:${attachment.type};base64,${attachment.data}`;
};

// Check if file can be previewed inline
export const canPreviewInline = (mimeType: string): boolean => {
  const category = getFileTypeCategory(mimeType);
  return category === 'image' || category === 'video' || category === 'audio';
};

// Get file extension from name
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

// Validate file type
export const isValidFileType = (file: File): boolean => {
  // Add any specific file type restrictions here
  return true; // Allow all file types for now
}; 