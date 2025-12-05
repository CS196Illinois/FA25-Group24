// ============================================================================
// EXAMPLE: How to use the FocusMode component in your app
// ============================================================================

import React from 'react';
import { FocusMode, FocusSession, FocusModeSettings } from './FocusMode';

// Example 1: Basic Usage
// ----------------------
// Just drop it in with no configuration needed

export const BasicExample: React.FC = () => {
  return (
    <div className="app">
      <FocusMode />
    </div>
  );
};


// Example 2: With Session Tracking
// --------------------------------
// Track completed sessions for statistics/history

export const WithSessionTracking: React.FC = () => {
  const handleSessionComplete = (session: FocusSession) => {
    console.log('Session completed:', session);
    
    // Save to your backend or state management
    // Example: dispatch(addFocusSession(session));
    // Example: await api.saveFocusSession(session);
    
    // Session object contains:
    // - id: unique identifier
    // - startTime: Date when session started
    // - endTime: Date when session ended
    // - duration: total minutes
    // - completedPomodoros: number of focus periods completed
    // - taskName: optional task description
    // - breaks: number of breaks taken
  };

  const handlePhaseChange = (phase: 'focus' | 'shortBreak' | 'longBreak' | 'idle') => {
    console.log('Phase changed to:', phase);
    
    // Update UI, trigger animations, etc.
    // Example: if (phase === 'focus') playFocusMusic();
  };

  return (
    <FocusMode
      onSessionComplete={handleSessionComplete}
      onPhaseChange={handlePhaseChange}
    />
  );
};


// Example 3: Custom Settings
// --------------------------
// Override default settings

export const WithCustomSettings: React.FC = () => {
  const customSettings: Partial<FocusModeSettings> = {
    focusDuration: 50,          // 50 minutes focus (for longer deep work)
    shortBreakDuration: 10,     // 10 minute breaks
    longBreakDuration: 30,      // 30 minute long breaks
    pomodorosUntilLongBreak: 2, // Long break every 2 pomodoros
    autoStartBreaks: true,      // Automatically start breaks
    autoStartFocus: false,      // Manual start for focus sessions
    showNotifications: true,
    playSound: true,
  };

  return (
    <FocusMode initialSettings={customSettings} />
  );
};


// Example 4: Full Integration with App State
// ------------------------------------------
// Complete example with Redux/Context integration

interface AppState {
  focusSessions: FocusSession[];
  totalFocusMinutes: number;
  currentStreak: number;
}

export const FullIntegrationExample: React.FC = () => {
  const [appState, setAppState] = React.useState<AppState>({
    focusSessions: [],
    totalFocusMinutes: 0,
    currentStreak: 0,
  });

  const handleSessionComplete = (session: FocusSession) => {
    setAppState((prev) => ({
      focusSessions: [...prev.focusSessions, session],
      totalFocusMinutes: prev.totalFocusMinutes + session.duration,
      currentStreak: prev.currentStreak + session.completedPomodoros,
    }));

    // Show achievement toast, update stats, etc.
    if (session.completedPomodoros >= 4) {
      alert('🏆 Great job! You completed a full pomodoro cycle!');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Stats Display */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>Productivity Dashboard</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {appState.totalFocusMinutes}
            </div>
            <div style={{ color: '#666' }}>Minutes Focused</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {appState.focusSessions.length}
            </div>
            <div style={{ color: '#666' }}>Sessions</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {appState.currentStreak}
            </div>
            <div style={{ color: '#666' }}>Pomodoros</div>
          </div>
        </div>
      </div>

      {/* Focus Mode Component */}
      <FocusMode onSessionComplete={handleSessionComplete} />

      {/* Session History */}
      {appState.focusSessions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Recent Sessions</h3>
          <ul>
            {appState.focusSessions.slice(-5).reverse().map((session) => (
              <li key={session.id}>
                {session.taskName || 'Untitled'} - {session.duration} min,{' '}
                {session.completedPomodoros} pomodoros
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


// Example 5: Styled with Your Design System
// -----------------------------------------
// Add custom className for styling integration

export const StyledExample: React.FC = () => {
  return (
    <div className="my-app-container">
      <FocusMode
        className="my-focus-mode-styles"
        onSessionComplete={(session) => {
          // Your logic here
        }}
      />
    </div>
  );
};

// In your CSS/SCSS file:
// .my-focus-mode-styles {
//   background: var(--app-background);
//   border-radius: var(--app-radius-lg);
//   box-shadow: var(--app-shadow);
// }


// ============================================================================
// EXPORTED TYPES (for your app's type definitions)
// ============================================================================

export type { FocusSession, FocusModeSettings } from './FocusMode';
