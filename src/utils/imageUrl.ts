// Centralized image URL utility for the frontend
// This ensures all image paths are correctly resolved to the backend API

// API base URL for images (without /api suffix)
// Uses VITE_API_BASE_URL (consistent with dataService.ts)
export const IMAGE_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');

// Placeholder image path
export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

/**
 * Helper to get full image URL from a relative path
 * @param imagePath - The image path (can be relative like /images/photo.jpg or absolute URL)
 * @param fallback - Optional fallback image path (defaults to placeholder)
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null, fallback: string = PLACEHOLDER_IMAGE): string => {
  // If no path provided, return fallback
  if (!imagePath || imagePath.trim() === '') {
    return `${IMAGE_BASE_URL}${fallback}`;
  }
  
  // If already a full URL (http:// or https://), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a data URL, return as-is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Ensure /images/ prefix for all relative paths
  if (imagePath.startsWith('/images/')) return `${IMAGE_BASE_URL}${imagePath}`;
  // Has a leading slash but no /images/ prefix (e.g. /IMAGE_11.png -> /images/IMAGE_11.png)
  if (imagePath.startsWith('/')) return `${IMAGE_BASE_URL}/images${imagePath}`;
  // Bare filename (e.g. IMAGE_11.png -> /images/IMAGE_11.png)
  return `${IMAGE_BASE_URL}/images/${imagePath}`;
};

/**
 * Check if an image URL is valid (not empty or placeholder-like)
 * @param imagePath - The image path to check
 * @returns true if the image path appears to be a real image
 */
export const hasValidImage = (imagePath: string | undefined | null): boolean => {
  if (!imagePath || imagePath.trim() === '') return false;
  if (imagePath === PLACEHOLDER_IMAGE) return false;
  return true;
};

export default getImageUrl;
