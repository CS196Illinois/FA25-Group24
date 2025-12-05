import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  ReactNode,
} from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 
  | 'task_reminder'
  | 'adaptive_nudge'
  | 'location_aware'
  | 'calendar_conflict'
  | 'achievement'
  | 'insight'
  | 'system';

export interface SmartNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  dismissCount: number;
  taskId?: string;
  actions?: NotificationAction[];
  metadata?: {
    location?: string;
    conflictTime?: string;
    conflictEvent?: string;
    originalDueTime?: string;
    suggestedActions?: string[];
  };
  expiresAt?: Date;
  snoozeUntil?: Date;
}

export interface NotificationAction {
  id: string;
  label: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  onClick: () => void;
}

export interface NotificationSettings {
  enabled: boolean;
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  types: {
    task_reminder: boolean;
    adaptive_nudge: boolean;
    location_aware: boolean;
    calendar_conflict: boolean;
    achievement: boolean;
    insight: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "07:00"
  };
  adaptiveNudges: {
    enabled: boolean;
    maxDismissBeforeAsk: number;
    offerBreakdown: boolean;
    offerReschedule: boolean;
  };
  sounds: {
    enabled: boolean;
    volume: number;
  };
  displayDuration: number; // seconds
}

interface NotificationContextValue {
  notifications: SmartNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read' | 'dismissed' | 'dismissCount'>) => string;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  snoozeNotification: (id: string, minutes: number) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  priorities: {
    low: true,
    medium: true,
    high: true,
    urgent: true,
  },
  types: {
    task_reminder: true,
    adaptive_nudge: true,
    location_aware: true,
    calendar_conflict: true,
    achievement: true,
    insight: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
  adaptiveNudges: {
    enabled: true,
    maxDismissBeforeAsk: 2,
    offerBreakdown: true,
    offerReschedule: true,
  },
  sounds: {
    enabled: true,
    volume: 0.5,
  },
  displayDuration: 5,
};

// ============================================================================
// UTILITIES
// ============================================================================

const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const isInQuietHours = (settings: NotificationSettings): boolean => {
  if (!settings.quietHours.enabled) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = settings.quietHours.start.split(':').map(Number);
  const [endH, endM] = settings.quietHours.end.split(':').map(Number);
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  }
  return currentTime >= startTime || currentTime <= endTime;
};

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface NotificationProviderProps {
  children: ReactNode;
  initialSettings?: Partial<NotificationSettings>;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  initialSettings,
}) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length;

  const addNotification = useCallback(
    (notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read' | 'dismissed' | 'dismissCount'>) => {
      if (!settings.enabled) return '';
      if (isInQuietHours(settings) && notification.priority !== 'urgent') return '';
      if (!settings.priorities[notification.priority]) return '';
      if (!settings.types[notification.type]) return '';

      const id = generateId();
      const newNotification: SmartNotification = {
        ...notification,
        id,
        timestamp: new Date(),
        read: false,
        dismissed: false,
        dismissCount: 0,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      return id;
    },
    [settings]
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, dismissed: true, dismissCount: n.dismissCount + 1 }
          : n
      )
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const snoozeNotification = useCallback((id: string, minutes: number) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60000);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, dismissed: true, snoozeUntil } : n
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Check for snoozed notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.snoozeUntil && n.snoozeUntil <= now) {
            return { ...n, dismissed: false, snoozeUntil: undefined };
          }
          return n;
        })
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    dismissNotification,
    markAsRead,
    markAllAsRead,
    snoozeNotification,
    clearAll,
    updateSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// NOTIFICATION TOAST COMPONENT
// ============================================================================

interface NotificationToastProps {
  notification: SmartNotification;
  onDismiss: () => void;
  onAction?: (actionId: string) => void;
  onSnooze?: (minutes: number) => void;
  showAdaptiveOptions?: boolean;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onAction,
  onSnooze,
  showAdaptiveOptions,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 200);
  };

  const getPriorityStyles = (): React.CSSProperties => {
    const colors: Record<NotificationPriority, { bg: string; border: string; accent: string }> = {
      low: { bg: '#f8fafc', border: '#e2e8f0', accent: '#64748b' },
      medium: { bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
      high: { bg: '#fef2f2', border: '#fecaca', accent: '#dc2626' },
      urgent: { bg: '#fef2f2', border: '#f87171', accent: '#b91c1c' },
    };
    return {
      backgroundColor: colors[notification.priority].bg,
      borderColor: colors[notification.priority].border,
      '--accent-color': colors[notification.priority].accent,
    } as React.CSSProperties;
  };

  const getTypeIcon = (): string => {
    const icons: Record<NotificationType, string> = {
      task_reminder: '⏰',
      adaptive_nudge: '💡',
      location_aware: '📍',
      calendar_conflict: '⚠️',
      achievement: '🏆',
      insight: '📊',
      system: '⚙️',
    };
    return icons[notification.type];
  };

  return (
    <div
      style={{
        ...styles.toast,
        ...getPriorityStyles(),
        animation: isExiting ? 'slideOut 0.2s ease forwards' : 'slideIn 0.3s ease',
      }}
    >
      <div style={styles.toastHeader}>
        <span style={styles.toastIcon}>{getTypeIcon()}</span>
        <span style={styles.toastTitle}>{notification.title}</span>
        <button onClick={handleDismiss} style={styles.closeButton}>×</button>
      </div>
      
      <p style={styles.toastMessage}>{notification.message}</p>

      {notification.metadata?.conflictEvent && (
        <div style={styles.conflictInfo}>
          <span style={styles.conflictIcon}>📅</span>
          <span>Conflicts with: {notification.metadata.conflictEvent} at {notification.metadata.conflictTime}</span>
        </div>
      )}

      {notification.metadata?.location && (
        <div style={styles.locationInfo}>
          <span style={styles.locationIcon}>📍</span>
          <span>Near: {notification.metadata.location}</span>
        </div>
      )}

      <div style={styles.toastActions}>
        {notification.actions?.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              action.onClick();
              onAction?.(action.id);
            }}
            style={{
              ...styles.actionButton,
              ...(action.variant === 'primary' ? styles.actionPrimary : {}),
              ...(action.variant === 'danger' ? styles.actionDanger : {}),
            }}
          >
            {action.label}
          </button>
        ))}

        {showAdaptiveOptions && (
          <>
            <div style={styles.actionDivider} />
            <button
              onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
              style={styles.actionButton}
            >
              ⏱ Snooze
            </button>
          </>
        )}
      </div>

      {showSnoozeMenu && (
        <div style={styles.snoozeMenu}>
          {[5, 15, 30, 60, 180].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                onSnooze?.(mins);
                setShowSnoozeMenu(false);
              }}
              style={styles.snoozeOption}
            >
              {mins < 60 ? `${mins} min` : `${mins / 60}h`}
            </button>
          ))}
        </div>
      )}

      <span style={styles.timestamp}>{formatTimeAgo(notification.timestamp)}</span>
    </div>
  );
};

// ============================================================================
// NOTIFICATION CENTER COMPONENT
// ============================================================================

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    settings,
    dismissNotification,
    markAsRead,
    markAllAsRead,
    snoozeNotification,
    clearAll,
  } = useNotifications();

  const activeNotifications = notifications.filter((n) => !n.dismissed);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = activeNotifications.filter((n) =>
    filter === 'all' ? true : !n.read
  );

  if (!isOpen) return null;

  return (
    <div style={styles.centerOverlay} onClick={onClose}>
      <div style={styles.centerPanel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.centerHeader}>
          <h2 style={styles.centerTitle}>
            Notifications
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </h2>
          <div style={styles.centerActions}>
            <button onClick={markAllAsRead} style={styles.headerAction}>
              Mark all read
            </button>
            <button onClick={clearAll} style={styles.headerAction}>
              Clear all
            </button>
            <button onClick={onClose} style={styles.closeButton}>×</button>
          </div>
        </div>

        <div style={styles.filterTabs}>
          <button
            onClick={() => setFilter('all')}
            style={{
              ...styles.filterTab,
              ...(filter === 'all' ? styles.filterTabActive : {}),
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{
              ...styles.filterTab,
              ...(filter === 'unread' ? styles.filterTabActive : {}),
            }}
          >
            Unread
          </button>
        </div>

        <div style={styles.notificationList}>
          {filteredNotifications.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🔔</span>
              <p style={styles.emptyText}>No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationToast
                key={notification.id}
                notification={notification}
                onDismiss={() => dismissNotification(notification.id)}
                onSnooze={(mins) => snoozeNotification(notification.id, mins)}
                showAdaptiveOptions={
                  settings.adaptiveNudges.enabled &&
                  notification.dismissCount >= settings.adaptiveNudges.maxDismissBeforeAsk
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NOTIFICATION BELL BUTTON
// ============================================================================

interface NotificationBellProps {
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { unreadCount } = useNotifications();
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <button
      onClick={onClick}
      style={{
        ...styles.bellButton,
        animation: isAnimating ? 'shake 0.5s ease' : 'none',
      }}
    >
      <span style={styles.bellIcon}>🔔</span>
      {unreadCount > 0 && (
        <span style={styles.bellBadge}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

// ============================================================================
// TOAST CONTAINER (for displaying active toasts)
// ============================================================================

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification, snoozeNotification, settings } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState<SmartNotification[]>([]);
  const shownIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newNotifications = notifications.filter(
      (n) => !n.dismissed && !n.read && !shownIds.current.has(n.id)
    );

    if (newNotifications.length > 0) {
      newNotifications.forEach((n) => shownIds.current.add(n.id));
      setVisibleToasts((prev) => [...newNotifications.slice(0, 3), ...prev].slice(0, 3));

      // Auto-dismiss after displayDuration
      newNotifications.forEach((n) => {
        setTimeout(() => {
          setVisibleToasts((prev) => prev.filter((t) => t.id !== n.id));
        }, settings.displayDuration * 1000);
      });
    }
  }, [notifications, settings.displayDuration]);

  const handleDismiss = (id: string) => {
    setVisibleToasts((prev) => prev.filter((t) => t.id !== id));
    dismissNotification(id);
  };

  return (
    <div style={styles.toastContainer}>
      {visibleToasts.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            ...styles.toastWrapper,
            transform: `translateY(${index * 10}px)`,
            zIndex: 1000 - index,
          }}
        >
          <NotificationToast
            notification={notification}
            onDismiss={() => handleDismiss(notification.id)}
            onSnooze={(mins) => {
              snoozeNotification(notification.id, mins);
              setVisibleToasts((prev) => prev.filter((t) => t.id !== notification.id));
            }}
            showAdaptiveOptions={
              settings.adaptiveNudges.enabled &&
              notification.dismissCount >= settings.adaptiveNudges.maxDismissBeforeAsk
            }
          />
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// SETTINGS PANEL COMPONENT
// ============================================================================

interface NotificationSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsPanel: React.FC<NotificationSettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useNotifications();

  if (!isOpen) return null;

  const togglePriority = (priority: NotificationPriority) => {
    updateSettings({
      priorities: {
        ...settings.priorities,
        [priority]: !settings.priorities[priority],
      },
    });
  };

  const toggleType = (type: NotificationType) => {
    updateSettings({
      types: {
        ...settings.types,
        [type]: !settings.types[type],
      },
    });
  };

  const typeLabels: Record<NotificationType, { label: string; icon: string; description: string }> = {
    task_reminder: {
      label: 'Task Reminders',
      icon: '⏰',
      description: 'Get reminded about upcoming and overdue tasks',
    },
    adaptive_nudge: {
      label: 'Smart Nudges',
      icon: '💡',
      description: 'Helpful suggestions when you dismiss reminders',
    },
    location_aware: {
      label: 'Location Reminders',
      icon: '📍',
      description: 'Reminders based on your current location',
    },
    calendar_conflict: {
      label: 'Calendar Conflicts',
      icon: '⚠️',
      description: 'Warnings when tasks conflict with calendar events',
    },
    achievement: {
      label: 'Achievements',
      icon: '🏆',
      description: 'Celebrate your productivity milestones',
    },
    insight: {
      label: 'Productivity Insights',
      icon: '📊',
      description: 'Tips and stats about your work patterns',
    },
    system: {
      label: 'System',
      icon: '⚙️',
      description: 'App updates and system messages',
    },
  };

  return (
    <div style={styles.settingsOverlay} onClick={onClose}>
      <div style={styles.settingsPanel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.settingsHeader}>
          <h2 style={styles.settingsTitle}>Notification Settings</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <div style={styles.settingsContent}>
          {/* Master Toggle */}
          <div style={styles.settingSection}>
            <div style={styles.masterToggle}>
              <div>
                <h3 style={styles.sectionTitle}>Notifications</h3>
                <p style={styles.sectionDescription}>
                  Enable or disable all in-app notifications
                </p>
              </div>
              <label style={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => updateSettings({ enabled: e.target.checked })}
                  style={styles.toggleInput}
                />
                <span style={styles.toggleSlider} />
              </label>
            </div>
          </div>

          {/* Priority Settings */}
          <div style={styles.settingSection}>
            <h3 style={styles.sectionTitle}>Priority Levels</h3>
            <p style={styles.sectionDescription}>
              Choose which priority levels trigger notifications
            </p>
            <div style={styles.priorityGrid}>
              {(['urgent', 'high', 'medium', 'low'] as NotificationPriority[]).map((priority) => (
                <button
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  style={{
                    ...styles.priorityChip,
                    ...(settings.priorities[priority] ? styles.priorityChipActive : {}),
                    ...getPriorityChipStyle(priority, settings.priorities[priority]),
                  }}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Types */}
          <div style={styles.settingSection}>
            <h3 style={styles.sectionTitle}>Notification Types</h3>
            <div style={styles.typeList}>
              {(Object.keys(typeLabels) as NotificationType[]).map((type) => (
                <div key={type} style={styles.typeItem}>
                  <div style={styles.typeInfo}>
                    <span style={styles.typeIcon}>{typeLabels[type].icon}</span>
                    <div>
                      <span style={styles.typeLabel}>{typeLabels[type].label}</span>
                      <span style={styles.typeDescription}>
                        {typeLabels[type].description}
                      </span>
                    </div>
                  </div>
                  <label style={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={settings.types[type]}
                      onChange={() => toggleType(type)}
                      style={styles.toggleInput}
                    />
                    <span style={styles.toggleSlider} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div style={styles.settingSection}>
            <div style={styles.quietHoursHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Quiet Hours</h3>
                <p style={styles.sectionDescription}>
                  Pause non-urgent notifications during specific times
                </p>
              </div>
              <label style={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.quietHours.enabled}
                  onChange={(e) =>
                    updateSettings({
                      quietHours: { ...settings.quietHours, enabled: e.target.checked },
                    })
                  }
                  style={styles.toggleInput}
                />
                <span style={styles.toggleSlider} />
              </label>
            </div>
            {settings.quietHours.enabled && (
              <div style={styles.timeInputs}>
                <div style={styles.timeInput}>
                  <label style={styles.timeLabel}>From</label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) =>
                      updateSettings({
                        quietHours: { ...settings.quietHours, start: e.target.value },
                      })
                    }
                    style={styles.timeField}
                  />
                </div>
                <div style={styles.timeInput}>
                  <label style={styles.timeLabel}>To</label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) =>
                      updateSettings({
                        quietHours: { ...settings.quietHours, end: e.target.value },
                      })
                    }
                    style={styles.timeField}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Adaptive Nudges */}
          <div style={styles.settingSection}>
            <div style={styles.quietHoursHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Adaptive Nudges</h3>
                <p style={styles.sectionDescription}>
                  Offer alternatives when you dismiss reminders repeatedly
                </p>
              </div>
              <label style={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.adaptiveNudges.enabled}
                  onChange={(e) =>
                    updateSettings({
                      adaptiveNudges: {
                        ...settings.adaptiveNudges,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  style={styles.toggleInput}
                />
                <span style={styles.toggleSlider} />
              </label>
            </div>
            {settings.adaptiveNudges.enabled && (
              <div style={styles.nudgeOptions}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.adaptiveNudges.offerBreakdown}
                    onChange={(e) =>
                      updateSettings({
                        adaptiveNudges: {
                          ...settings.adaptiveNudges,
                          offerBreakdown: e.target.checked,
                        },
                      })
                    }
                    style={styles.checkbox}
                  />
                  <span>Offer to break down large tasks</span>
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.adaptiveNudges.offerReschedule}
                    onChange={(e) =>
                      updateSettings({
                        adaptiveNudges: {
                          ...settings.adaptiveNudges,
                          offerReschedule: e.target.checked,
                        },
                      })
                    }
                    style={styles.checkbox}
                  />
                  <span>Offer to reschedule tasks</span>
                </label>
              </div>
            )}
          </div>

          {/* Display Duration */}
          <div style={styles.settingSection}>
            <h3 style={styles.sectionTitle}>Display Duration</h3>
            <p style={styles.sectionDescription}>
              How long toast notifications stay visible
            </p>
            <div style={styles.sliderContainer}>
              <input
                type="range"
                min={2}
                max={15}
                value={settings.displayDuration}
                onChange={(e) =>
                  updateSettings({ displayDuration: Number(e.target.value) })
                }
                style={styles.slider}
              />
              <span style={styles.sliderValue}>{settings.displayDuration}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPriorityChipStyle = (
  priority: NotificationPriority,
  active: boolean
): React.CSSProperties => {
  if (!active) return {};
  const colors: Record<NotificationPriority, string> = {
    urgent: '#dc2626',
    high: '#ea580c',
    medium: '#d97706',
    low: '#64748b',
  };
  return {
    backgroundColor: colors[priority],
    color: '#ffffff',
    borderColor: colors[priority],
  };
};

// ============================================================================
// STYLES
// ============================================================================

const styles: { [key: string]: React.CSSProperties } = {
  // Toast styles
  toastContainer: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxWidth: '380px',
    width: '100%',
  },
  toastWrapper: {
    transition: 'transform 0.2s ease',
  },
  toast: {
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
    position: 'relative',
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  toastHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  toastIcon: {
    fontSize: '1.25rem',
  },
  toastTitle: {
    fontWeight: 600,
    fontSize: '0.9375rem',
    flex: 1,
    color: '#0f172a',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: 0,
    lineHeight: 1,
    transition: 'color 0.2s',
  },
  toastMessage: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#475569',
    lineHeight: 1.5,
  },
  conflictInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    color: '#b91c1c',
  },
  conflictIcon: {
    fontSize: '0.875rem',
  },
  locationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    color: '#1d4ed8',
  },
  locationIcon: {
    fontSize: '0.875rem',
  },
  toastActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  actionButton: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    color: '#475569',
    transition: 'all 0.2s',
  },
  actionPrimary: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderColor: '#0f172a',
  },
  actionDanger: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderColor: '#fecaca',
  },
  actionDivider: {
    width: '1px',
    height: '20px',
    backgroundColor: '#e2e8f0',
    margin: '0 0.25rem',
  },
  snoozeMenu: {
    display: 'flex',
    gap: '0.25rem',
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  snoozeOption: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    color: '#64748b',
    transition: 'all 0.2s',
  },
  timestamp: {
    position: 'absolute',
    bottom: '0.5rem',
    right: '0.75rem',
    fontSize: '0.6875rem',
    color: '#94a3b8',
  },

  // Bell button styles
  bellButton: {
    position: 'relative',
    padding: '0.625rem',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  bellIcon: {
    fontSize: '1.25rem',
  },
  bellBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    minWidth: '18px',
    height: '18px',
    padding: '0 5px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Center panel styles
  centerOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 9998,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  centerPanel: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    animation: 'slideInRight 0.25s ease',
  },
  centerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },
  centerTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  badge: {
    fontSize: '0.75rem',
    padding: '0.125rem 0.5rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    borderRadius: '9999px',
    fontWeight: 500,
  },
  centerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerAction: {
    background: 'none',
    border: 'none',
    fontSize: '0.8125rem',
    color: '#64748b',
    cursor: 'pointer',
    padding: 0,
    transition: 'color 0.2s',
  },
  filterTabs: {
    display: 'flex',
    padding: '0 1.5rem',
    gap: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  filterTab: {
    padding: '0.75rem 0',
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
    transition: 'all 0.2s',
  },
  filterTabActive: {
    color: '#0f172a',
    borderBottomColor: '#0f172a',
    fontWeight: 500,
  },
  notificationList: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
    opacity: 0.5,
  },
  emptyText: {
    margin: 0,
    fontSize: '0.9375rem',
  },

  // Settings panel styles
  settingsOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  settingsPanel: {
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    animation: 'fadeInUp 0.25s ease',
    overflow: 'hidden',
  },
  settingsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },
  settingsTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
    color: '#0f172a',
  },
  settingsContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 1.5rem 1.5rem',
  },
  settingSection: {
    paddingBottom: '1.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #f1f5f9',
  },
  masterToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    margin: '0 0 0.25rem 0',
    color: '#0f172a',
  },
  sectionDescription: {
    fontSize: '0.8125rem',
    color: '#64748b',
    margin: 0,
  },
  priorityGrid: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  priorityChip: {
    padding: '0.5rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    color: '#64748b',
    transition: 'all 0.2s',
  },
  priorityChipActive: {
    // Styles are dynamically applied via getPriorityChipStyle
  },
  typeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  typeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
  },
  typeInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  typeIcon: {
    fontSize: '1.25rem',
    marginTop: '0.125rem',
  },
  typeLabel: {
    display: 'block',
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#0f172a',
  },
  typeDescription: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.125rem',
  },
  toggle: {
    position: 'relative',
    display: 'inline-block',
    width: '44px',
    height: '24px',
    flexShrink: 0,
  },
  toggleInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  toggleSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    transition: 'background-color 0.2s',
  },
  quietHoursHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  timeInputs: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#64748b',
    marginBottom: '0.375rem',
  },
  timeField: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
  },
  nudgeOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.875rem',
    color: '#475569',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#0f172a',
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  slider: {
    flex: 1,
    height: '4px',
    accentColor: '#0f172a',
  },
  sliderValue: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#0f172a',
    minWidth: '2.5rem',
  },
};

// ============================================================================
// GLOBAL STYLES (inject via style tag or CSS file)
// ============================================================================

export const NotificationStyles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }

  /* Toggle switch styling */
  input:checked + span[style*="toggleSlider"] {
    background-color: #0f172a !important;
  }

  input:checked + span[style*="toggleSlider"]::before {
    transform: translateX(20px);
  }

  span[style*="toggleSlider"]::before {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

export default {
  NotificationProvider,
  NotificationCenter,
  NotificationBell,
  NotificationSettingsPanel,
  ToastContainer,
  useNotifications,
};
