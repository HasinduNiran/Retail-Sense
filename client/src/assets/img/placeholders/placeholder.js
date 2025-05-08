// Placeholder image paths for fallback use
import defaultAvatar from './avatar-32.png';
import mediumAvatar from './avatar-40.png';
import largeAvatar from './avatar-96.png';

// Export paths for use in components
export const PLACEHOLDER_AVATAR_SMALL = defaultAvatar;
export const PLACEHOLDER_AVATAR_MEDIUM = mediumAvatar;
export const PLACEHOLDER_AVATAR_LARGE = largeAvatar;

// Function to get placeholder by size
export const getAvatarPlaceholder = (size) => {
  switch (size) {
    case 'small':
      return defaultAvatar;
    case 'medium':
      return mediumAvatar;
    case 'large':
      return largeAvatar;
    default:
      return defaultAvatar;
  }
}; 