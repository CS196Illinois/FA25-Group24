export const Colors = {
  light: {
    background: '#f5f5f5',
    text: '#000000',
    textSecondary: '#666666',
    cardBackground: '#ffffff',
    border: '#e0e0e0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.05)',
    overlayStrong: 'rgba(0, 0, 0, 0.1)',
    profileButton: '#4A90E2',
    // Task box colors (same for both themes for visual consistency)
    urgentImportant: '#FF4444',
    important: '#FF7F50',
    urgent: '#FFA500',
    toDo: '#FFBF00',
  },
  dark: {
    background: '#25292e',
    text: '#ffffff',
    textSecondary: '#cccccc',
    cardBackground: '#1c1f24',
    border: '#3a3d42',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(255, 255, 255, 0.2)',
    overlayStrong: 'rgba(255, 255, 255, 0.3)',
    profileButton: '#ADD8E6',
    // Task box colors (same for both themes for visual consistency)
    urgentImportant: '#FF4444',
    important: '#FF7F50',
    urgent: '#FFA500',
    toDo: '#FFBF00',
  },
};

export type ThemeColors = typeof Colors.light;
