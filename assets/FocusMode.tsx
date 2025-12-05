import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  completedPomodoros: number;
  taskName?: string;
  breaks: number;
}

export interface FocusModeSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  pomodorosUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  showNotifications: boolean;
  playSound: boolean;
  blockDistractions: boolean;
  ambientSound: 'none' | 'rain' | 'forest' | 'cafe' | 'whitenoise';
}

type TimerPhase = 'focus' | 'shortBreak' | 'longBreak' | 'idle';

interface FocusModeProps {
  onSessionComplete?: (session: FocusSession) => void;
  onPhaseChange?: (phase: TimerPhase) => void;
  initialSettings?: Partial<FocusModeSettings>;
  className?: string;
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const DEFAULT_SETTINGS: FocusModeSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  showNotifications: true,
  playSound: true,
  blockDistractions: false,
  ambientSound: 'none',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const generateId = (): string => {
  return `focus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const playNotificationSound = () => {
  // Create a simple beep sound using Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

const showNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '🎯' });
  }
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useTimer = (
  initialSeconds: number,
  onComplete: () => void,
  isRunning: boolean
) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete]);

  const reset = useCallback((newSeconds?: number) => {
    setSeconds(newSeconds ?? initialSeconds);
  }, [initialSeconds]);

  return { seconds, reset, setSeconds };
};

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };

  return [storedValue, setValue];
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  phase: TimerPhase;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 280,
  strokeWidth = 8,
  phase,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  const getPhaseColor = () => {
    switch (phase) {
      case 'focus': return '#ef4444';
      case 'shortBreak': return '#22c55e';
      case 'longBreak': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity={0.1}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getPhaseColor()}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease',
        }}
      />
    </svg>
  );
};

interface SettingsPanelProps {
  settings: FocusModeSettings;
  onSettingsChange: (settings: FocusModeSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
}) => {
  const updateSetting = <K extends keyof FocusModeSettings>(
    key: K,
    value: FocusModeSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div style={styles.settingsOverlay}>
      <div style={styles.settingsPanel}>
        <div style={styles.settingsHeader}>
          <h3 style={styles.settingsTitle}>Focus Settings</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <div style={styles.settingsContent}>
          <div style={styles.settingGroup}>
            <h4 style={styles.settingGroupTitle}>Timer Durations</h4>
            
            <label style={styles.settingLabel}>
              <span>Focus Duration</span>
              <div style={styles.inputGroup}>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={settings.focusDuration}
                  onChange={(e) => updateSetting('focusDuration', Number(e.target.value))}
                  style={styles.numberInput}
                />
                <span style={styles.inputSuffix}>min</span>
              </div>
            </label>

            <label style={styles.settingLabel}>
              <span>Short Break</span>
              <div style={styles.inputGroup}>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.shortBreakDuration}
                  onChange={(e) => updateSetting('shortBreakDuration', Number(e.target.value))}
                  style={styles.numberInput}
                />
                <span style={styles.inputSuffix}>min</span>
              </div>
            </label>

            <label style={styles.settingLabel}>
              <span>Long Break</span>
              <div style={styles.inputGroup}>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.longBreakDuration}
                  onChange={(e) => updateSetting('longBreakDuration', Number(e.target.value))}
                  style={styles.numberInput}
                />
                <span style={styles.inputSuffix}>min</span>
              </div>
            </label>

            <label style={styles.settingLabel}>
              <span>Pomodoros until Long Break</span>
              <div style={styles.inputGroup}>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={settings.pomodorosUntilLongBreak}
                  onChange={(e) => updateSetting('pomodorosUntilLongBreak', Number(e.target.value))}
                  style={styles.numberInput}
                />
              </div>
            </label>
          </div>

          <div style={styles.settingGroup}>
            <h4 style={styles.settingGroupTitle}>Automation</h4>
            
            <label style={styles.toggleLabel}>
              <span>Auto-start Breaks</span>
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => updateSetting('autoStartBreaks', e.target.checked)}
                style={styles.checkbox}
              />
            </label>

            <label style={styles.toggleLabel}>
              <span>Auto-start Focus</span>
              <input
                type="checkbox"
                checked={settings.autoStartFocus}
                onChange={(e) => updateSetting('autoStartFocus', e.target.checked)}
                style={styles.checkbox}
              />
            </label>
          </div>

          <div style={styles.settingGroup}>
            <h4 style={styles.settingGroupTitle}>Notifications</h4>
            
            <label style={styles.toggleLabel}>
              <span>Show Notifications</span>
              <input
                type="checkbox"
                checked={settings.showNotifications}
                onChange={(e) => updateSetting('showNotifications', e.target.checked)}
                style={styles.checkbox}
              />
            </label>

            <label style={styles.toggleLabel}>
              <span>Play Sound</span>
              <input
                type="checkbox"
                checked={settings.playSound}
                onChange={(e) => updateSetting('playSound', e.target.checked)}
                style={styles.checkbox}
              />
            </label>
          </div>

          <div style={styles.settingGroup}>
            <h4 style={styles.settingGroupTitle}>Ambient Sound</h4>
            <select
              value={settings.ambientSound}
              onChange={(e) => updateSetting('ambientSound', e.target.value as FocusModeSettings['ambientSound'])}
              style={styles.select}
            >
              <option value="none">None</option>
              <option value="rain">Rain</option>
              <option value="forest">Forest</option>
              <option value="cafe">Café</option>
              <option value="whitenoise">White Noise</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const FocusMode: React.FC<FocusModeProps> = ({
  onSessionComplete,
  onPhaseChange,
  initialSettings,
  className,
}) => {
  // State
  const [settings, setSettings] = useLocalStorage<FocusModeSettings>(
    'focusmode_settings',
    { ...DEFAULT_SETTINGS, ...initialSettings }
  );
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalBreaks, setTotalBreaks] = useState(0);

  // Calculate initial seconds based on phase
  const getPhaseSeconds = useCallback((currentPhase: TimerPhase): number => {
    switch (currentPhase) {
      case 'focus': return settings.focusDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
      default: return settings.focusDuration * 60;
    }
  }, [settings]);

  // Handle phase completion
  const handlePhaseComplete = useCallback(() => {
    if (settings.playSound) {
      playNotificationSound();
    }

    if (phase === 'focus') {
      const newPomodoroCount = completedPomodoros + 1;
      setCompletedPomodoros(newPomodoroCount);

      const isLongBreak = newPomodoroCount % settings.pomodorosUntilLongBreak === 0;
      const nextPhase = isLongBreak ? 'longBreak' : 'shortBreak';

      if (settings.showNotifications) {
        showNotification(
          'Focus session complete! 🎉',
          `Time for a ${isLongBreak ? 'long' : 'short'} break.`
        );
      }

      setPhase(nextPhase);
      setTotalBreaks((prev) => prev + 1);
      setIsRunning(settings.autoStartBreaks);
      onPhaseChange?.(nextPhase);
    } else {
      if (settings.showNotifications) {
        showNotification('Break is over! 💪', 'Ready to focus again?');
      }

      setPhase('focus');
      setIsRunning(settings.autoStartFocus);
      onPhaseChange?.('focus');
    }
  }, [phase, completedPomodoros, settings, onPhaseChange]);

  // Timer hook
  const { seconds, reset } = useTimer(
    getPhaseSeconds(phase),
    handlePhaseComplete,
    isRunning
  );

  // Calculate progress
  const totalSeconds = getPhaseSeconds(phase);
  const progress = phase === 'idle' ? 0 : (totalSeconds - seconds) / totalSeconds;

  // Request notification permission on mount
  useEffect(() => {
    if (settings.showNotifications) {
      requestNotificationPermission();
    }
  }, [settings.showNotifications]);

  // Update page title with timer
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(seconds)} - Focus Mode`;
    } else {
      document.title = 'Focus Mode';
    }
    return () => {
      document.title = 'Focus Mode';
    };
  }, [seconds, isRunning]);

  // Handlers
  const handleStart = () => {
    if (phase === 'idle') {
      setPhase('focus');
      setSessionStartTime(new Date());
      reset(settings.focusDuration * 60);
      onPhaseChange?.('focus');
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    reset(getPhaseSeconds(phase));
  };

  const handleStop = () => {
    // Complete the session
    if (sessionStartTime && onSessionComplete) {
      const session: FocusSession = {
        id: generateId(),
        startTime: sessionStartTime,
        endTime: new Date(),
        duration: Math.round((Date.now() - sessionStartTime.getTime()) / 60000),
        completedPomodoros,
        taskName: taskName || undefined,
        breaks: totalBreaks,
      };
      onSessionComplete(session);
    }

    // Reset everything
    setPhase('idle');
    setIsRunning(false);
    setCompletedPomodoros(0);
    setSessionStartTime(null);
    setTotalBreaks(0);
    reset(settings.focusDuration * 60);
    onPhaseChange?.('idle');
  };

  const handleSkipPhase = () => {
    handlePhaseComplete();
    reset(getPhaseSeconds(phase === 'focus' ? 'shortBreak' : 'focus'));
  };

  const getPhaseLabel = (): string => {
    switch (phase) {
      case 'focus': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Ready to Focus';
    }
  };

  const getPhaseEmoji = (): string => {
    switch (phase) {
      case 'focus': return '🎯';
      case 'shortBreak': return '☕';
      case 'longBreak': return '🌴';
      default: return '⏱️';
    }
  };

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Focus Mode</h2>
        <button
          onClick={() => setShowSettings(true)}
          style={styles.settingsButton}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Task Input */}
      {phase === 'idle' && (
        <div style={styles.taskInput}>
          <input
            type="text"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            style={styles.input}
          />
        </div>
      )}

      {/* Timer Display */}
      <div style={styles.timerContainer}>
        <div style={styles.progressWrapper}>
          <CircularProgress progress={progress} phase={phase} />
          <div style={styles.timerContent}>
            <span style={styles.phaseEmoji}>{getPhaseEmoji()}</span>
            <span style={styles.phaseLabel}>{getPhaseLabel()}</span>
            <span style={styles.timerDisplay}>{formatTime(seconds)}</span>
          </div>
        </div>
      </div>

      {/* Pomodoro Counter */}
      <div style={styles.pomodoroCounter}>
        {Array.from({ length: settings.pomodorosUntilLongBreak }).map((_, i) => (
          <span
            key={i}
            style={{
              ...styles.pomodoroIndicator,
              backgroundColor: i < (completedPomodoros % settings.pomodorosUntilLongBreak) || 
                (completedPomodoros > 0 && completedPomodoros % settings.pomodorosUntilLongBreak === 0 && i === settings.pomodorosUntilLongBreak - 1)
                ? '#ef4444'
                : '#e5e7eb',
            }}
          />
        ))}
        <span style={styles.pomodoroText}>
          {completedPomodoros} pomodoro{completedPomodoros !== 1 ? 's' : ''} completed
        </span>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        {phase === 'idle' ? (
          <button onClick={handleStart} style={styles.primaryButton}>
            Start Focusing
          </button>
        ) : (
          <>
            {isRunning ? (
              <button onClick={handlePause} style={styles.secondaryButton}>
                Pause
              </button>
            ) : (
              <button onClick={handleStart} style={styles.primaryButton}>
                Resume
              </button>
            )}
            <button onClick={handleReset} style={styles.secondaryButton}>
              Reset
            </button>
            <button onClick={handleSkipPhase} style={styles.secondaryButton}>
              Skip
            </button>
            <button onClick={handleStop} style={styles.dangerButton}>
              End Session
            </button>
          </>
        )}
      </div>

      {/* Current Task Display */}
      {taskName && phase !== 'idle' && (
        <div style={styles.currentTask}>
          <span style={styles.currentTaskLabel}>Working on:</span>
          <span style={styles.currentTaskName}>{taskName}</span>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    maxWidth: '400px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1f2937',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: 0,
  },
  settingsButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    transition: 'background-color 0.2s',
  },
  taskInput: {
    width: '100%',
    marginBottom: '2rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  timerContainer: {
    marginBottom: '1.5rem',
  },
  progressWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContent: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseEmoji: {
    fontSize: '2rem',
    marginBottom: '0.25rem',
  },
  phaseLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 500,
  },
  timerDisplay: {
    fontSize: '3.5rem',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    marginTop: '0.25rem',
  },
  pomodoroCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  pomodoroIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    transition: 'background-color 0.3s',
  },
  pomodoroText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginLeft: '0.5rem',
  },
  controls: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    padding: '0.875rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
  },
  secondaryButton: {
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  dangerButton: {
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  currentTask: {
    marginTop: '1.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    textAlign: 'center',
  },
  currentTaskLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  currentTaskName: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 500,
    marginTop: '0.25rem',
  },
  settingsOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  settingsPanel: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '1.5rem',
    width: '90%',
    maxWidth: '400px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  settingsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  settingsTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.25rem',
  },
  settingsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  settingGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  settingGroupTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
    margin: 0,
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  settingLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  toggleLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  numberInput: {
    width: '60px',
    padding: '0.5rem',
    fontSize: '0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    backgroundColor: '#ffffff',
  },
};

export default FocusMode;
