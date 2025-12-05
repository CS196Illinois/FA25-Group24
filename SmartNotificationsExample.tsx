// ============================================================================
// SMART NOTIFICATIONS - INTEGRATION GUIDE & HELPERS
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  NotificationProvider,
  NotificationCenter,
  NotificationBell,
  NotificationSettingsPanel,
  ToastContainer,
  useNotifications,
  NotificationStyles,
  SmartNotification,
  NotificationPriority,
} from './SmartNotifications';

// ============================================================================
// 1. BASIC SETUP - Wrap your app with the provider
// ============================================================================

export const AppWithNotifications: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <NotificationProvider>
      {/* Inject animation styles */}
      <style>{NotificationStyles}</style>
      
      {/* Toast container for popup notifications */}
      <ToastContainer />
      
      {/* Your app content */}
      {children}
    </NotificationProvider>
  );
};

// ============================================================================
// 2. HEADER WITH NOTIFICATION BELL - Add to your app header
// ============================================================================

export const AppHeader: React.FC = () => {
  const [showCenter, setShowCenter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header style={headerStyles.container}>
      <h1 style={headerStyles.title}>My Productivity App</h1>
      
      <div style={headerStyles.actions}>
        {/* Settings gear */}
        <button
          onClick={() => setShowSettings(true)}
          style={headerStyles.iconButton}
        >
          ⚙️
        </button>
        
        {/* Notification bell */}
        <NotificationBell onClick={() => setShowCenter(true)} />
      </div>

      {/* Notification center panel */}
      <NotificationCenter
        isOpen={showCenter}
        onClose={() => setShowCenter(false)}
      />

      {/* Settings panel */}
      <NotificationSettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </header>
  );
};

const headerStyles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  iconButton: {
    padding: '0.625rem',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    cursor: 'pointer',
    fontSize: '1.25rem',
  },
};

// ============================================================================
// 3. NOTIFICATION HELPER HOOKS - Use these throughout your app
// ============================================================================

/**
 * Hook for creating task reminder notifications
 */
export const useTaskReminders = () => {
  const { addNotification, settings } = useNotifications();

  const remindTask = (task: {
    id: string;
    name: string;
    dueTime: Date;
    priority: NotificationPriority;
  }) => {
    return addNotification({
      type: 'task_reminder',
      priority: task.priority,
      title: 'Task Reminder',
      message: `"${task.name}" is due ${formatDueTime(task.dueTime)}`,
      taskId: task.id,
      actions: [
        {
          id: 'complete',
          label: 'Mark Complete',
          variant: 'primary',
          onClick: () => {
            // Your task completion logic
            console.log('Complete task:', task.id);
          },
        },
        {
          id: 'view',
          label: 'View Task',
          variant: 'secondary',
          onClick: () => {
            // Navigate to task
            console.log('View task:', task.id);
          },
        },
      ],
    });
  };

  return { remindTask };
};

/**
 * Hook for calendar conflict warnings
 */
export const useCalendarConflicts = () => {
  const { addNotification } = useNotifications();

  const warnConflict = (conflict: {
    taskName: string;
    taskTime: string;
    eventName: string;
    eventTime: string;
  }) => {
    return addNotification({
      type: 'calendar_conflict',
      priority: 'high',
      title: 'Schedule Conflict',
      message: `"${conflict.taskName}" conflicts with your calendar`,
      metadata: {
        conflictEvent: conflict.eventName,
        conflictTime: conflict.eventTime,
      },
      actions: [
        {
          id: 'reschedule',
          label: 'Reschedule Task',
          variant: 'primary',
          onClick: () => {
            console.log('Reschedule task');
          },
        },
        {
          id: 'keep',
          label: 'Keep Both',
          variant: 'secondary',
          onClick: () => {
            console.log('Keep both');
          },
        },
      ],
    });
  };

  return { warnConflict };
};

/**
 * Hook for location-aware reminders
 */
export const useLocationReminders = () => {
  const { addNotification } = useNotifications();

  const remindAtLocation = (reminder: {
    taskName: string;
    location: string;
    items?: string[];
  }) => {
    const itemsList = reminder.items?.length
      ? `: ${reminder.items.slice(0, 3).join(', ')}${reminder.items.length > 3 ? '...' : ''}`
      : '';

    return addNotification({
      type: 'location_aware',
      priority: 'medium',
      title: `You're near ${reminder.location}`,
      message: `Time to "${reminder.taskName}"${itemsList}`,
      metadata: {
        location: reminder.location,
      },
      actions: [
        {
          id: 'view_list',
          label: 'View List',
          variant: 'primary',
          onClick: () => {
            console.log('View list');
          },
        },
        {
          id: 'done',
          label: 'Already Done',
          variant: 'secondary',
          onClick: () => {
            console.log('Mark done');
          },
        },
      ],
    });
  };

  return { remindAtLocation };
};

/**
 * Hook for adaptive nudges (when user dismisses reminders repeatedly)
 */
export const useAdaptiveNudges = () => {
  const { addNotification, settings } = useNotifications();

  const nudgeUser = (task: {
    id: string;
    name: string;
    dismissCount: number;
  }) => {
    if (!settings.adaptiveNudges.enabled) return;

    const actions: SmartNotification['actions'] = [];

    if (settings.adaptiveNudges.offerBreakdown) {
      actions.push({
        id: 'breakdown',
        label: 'Break It Down',
        variant: 'primary',
        onClick: () => {
          console.log('Break down task:', task.id);
        },
      });
    }

    if (settings.adaptiveNudges.offerReschedule) {
      actions.push({
        id: 'reschedule',
        label: 'Reschedule',
        variant: 'secondary',
        onClick: () => {
          console.log('Reschedule task:', task.id);
        },
      });
    }

    actions.push({
      id: 'remove',
      label: 'Remove Task',
      variant: 'danger',
      onClick: () => {
        console.log('Remove task:', task.id);
      },
    });

    return addNotification({
      type: 'adaptive_nudge',
      priority: 'medium',
      title: 'Having trouble with this task?',
      message: `You've dismissed "${task.name}" ${task.dismissCount} times. Would you like to:`,
      taskId: task.id,
      actions,
    });
  };

  return { nudgeUser };
};

/**
 * Hook for achievement notifications
 */
export const useAchievements = () => {
  const { addNotification } = useNotifications();

  const celebrate = (achievement: {
    title: string;
    description: string;
  }) => {
    return addNotification({
      type: 'achievement',
      priority: 'low',
      title: `🏆 ${achievement.title}`,
      message: achievement.description,
      actions: [
        {
          id: 'view',
          label: 'View Achievements',
          variant: 'primary',
          onClick: () => {
            console.log('View achievements');
          },
        },
      ],
    });
  };

  return { celebrate };
};

/**
 * Hook for productivity insights
 */
export const useInsights = () => {
  const { addNotification } = useNotifications();

  const shareInsight = (insight: {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    return addNotification({
      type: 'insight',
      priority: 'low',
      title: insight.title,
      message: insight.message,
      actions: insight.actionLabel
        ? [
            {
              id: 'action',
              label: insight.actionLabel,
              variant: 'secondary',
              onClick: insight.onAction || (() => {}),
            },
          ]
        : undefined,
    });
  };

  return { shareInsight };
};

// ============================================================================
// 4. EXAMPLE: FULL DEMO COMPONENT
// ============================================================================

export const NotificationDemo: React.FC = () => {
  const { addNotification } = useNotifications();
  const { remindTask } = useTaskReminders();
  const { warnConflict } = useCalendarConflicts();
  const { remindAtLocation } = useLocationReminders();
  const { celebrate } = useAchievements();
  const { shareInsight } = useInsights();

  const demos = [
    {
      label: 'Task Reminder (High Priority)',
      action: () =>
        remindTask({
          id: 'task-1',
          name: 'Submit quarterly report',
          dueTime: new Date(Date.now() + 30 * 60000),
          priority: 'high',
        }),
    },
    {
      label: 'Calendar Conflict',
      action: () =>
        warnConflict({
          taskName: 'Team standup prep',
          taskTime: '3:00 PM',
          eventName: 'Client Call',
          eventTime: '3:00 PM',
        }),
    },
    {
      label: 'Location Reminder',
      action: () =>
        remindAtLocation({
          taskName: 'Buy groceries',
          location: 'Target',
          items: ['Milk', 'Bread', 'Eggs', 'Coffee'],
        }),
    },
    {
      label: 'Achievement',
      action: () =>
        celebrate({
          title: '5-Day Streak!',
          description: "You've completed all daily tasks for 5 days straight!",
        }),
    },
    {
      label: 'Productivity Insight',
      action: () =>
        shareInsight({
          title: 'Peak Performance Time',
          message: 'You complete 40% more tasks between 9-11 AM. Schedule important work then!',
          actionLabel: 'Optimize Schedule',
        }),
    },
    {
      label: 'Urgent System Alert',
      action: () =>
        addNotification({
          type: 'system',
          priority: 'urgent',
          title: 'Sync Error',
          message: 'Failed to sync 3 tasks. Tap to retry.',
          actions: [
            {
              id: 'retry',
              label: 'Retry Now',
              variant: 'primary',
              onClick: () => console.log('Retrying...'),
            },
          ],
        }),
    },
  ];

  return (
    <div style={demoStyles.container}>
      <h2 style={demoStyles.title}>Notification Demo</h2>
      <p style={demoStyles.description}>
        Click buttons below to test different notification types
      </p>
      <div style={demoStyles.buttonGrid}>
        {demos.map((demo, i) => (
          <button key={i} onClick={demo.action} style={demoStyles.button}>
            {demo.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const demoStyles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  description: {
    color: '#64748b',
    marginBottom: '1.5rem',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  button: {
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
};

// ============================================================================
// 5. UTILITY FUNCTIONS
// ============================================================================

function formatDueTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 0) return 'overdue';
  if (diffMins === 0) return 'now';
  if (diffMins < 60) return `in ${diffMins} min`;
  if (diffMins < 1440) return `in ${Math.round(diffMins / 60)} hours`;
  return `in ${Math.round(diffMins / 1440)} days`;
}

// ============================================================================
// 6. COMPLETE APP EXAMPLE
// ============================================================================

export const CompleteApp: React.FC = () => {
  return (
    <AppWithNotifications>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <AppHeader />
        <main>
          <NotificationDemo />
        </main>
      </div>
    </AppWithNotifications>
  );
};

export default CompleteApp;
