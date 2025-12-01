import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { colors } from '../constants/colors';
import { calculateQuadrant, getQuadrantName } from '../utils/eisenhowerUtils';

interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  dueTime: string;
  importance: number;
  difficulty: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface PomodoroScreenProps {
  tasks: Task[];
}

interface TaskSession {
  taskId: string;
  taskName: string;
  duration: number; // in seconds
  timestamp: string;
}

export default function PomodoroScreen({ tasks }: PomodoroScreenProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<number>(1);
  const [workDuration, setWorkDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5); // minutes
  const [timer, setTimer] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<TaskSession[]>([]);
  const [elapsedWorkTime, setElapsedWorkTime] = useState(0); // Track elapsed work time

  useEffect(() => {
    filterTasksByQuadrant();
  }, [tasks, selectedQuadrant]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
        
        // Track work time (not break time)
        if (!isBreak) {
          setElapsedWorkTime(prev => prev + 1);
        }
      }, 1000);
    } else if (timer === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const filterTasksByQuadrant = () => {
    const filtered = tasks.filter(task => {
      const quadrant = calculateQuadrant(task.difficulty, task.importance);
      return quadrant === selectedQuadrant && !task.isCompleted;
    });
    setFilteredTasks(filtered);
    
    if (filtered.length > 0 && !selectedTaskId) {
      setSelectedTaskId(filtered[0].id);
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (isBreak) {
      // Break completed
      Alert.alert('Break Over!', 'Ready to get back to work?', [
        { text: 'Start Work', onPress: () => startWork() }
      ]);
    } else {
      // Work session completed - save it
      saveSession();
      Alert.alert('Great Work!', 'Time for a break!', [
        { text: 'Start Break', onPress: () => startBreak() }
      ]);
    }
  };

  const saveSession = () => {
    if (!selectedTaskId || elapsedWorkTime === 0) return;
    
    const task = filteredTasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    const session: TaskSession = {
      taskId: task.id,
      taskName: task.name,
      duration: elapsedWorkTime,
      timestamp: new Date().toISOString(),
    };

    setSessions(prev => [session, ...prev]);
    setElapsedWorkTime(0); // Reset elapsed time after saving
  };

  const startWork = () => {
    if (!selectedTaskId) {
      Alert.alert('No Task Selected', 'Please select a task first');
      return;
    }
    setTimer(workDuration * 60);
    setIsBreak(false);
    setIsRunning(true);
  };

  const startBreak = () => {
    setTimer(breakDuration * 60);
    setIsBreak(true);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    // Save any elapsed work time before resetting
    if (elapsedWorkTime > 0 && !isBreak) {
      saveSession();
    }
    setIsRunning(false);
    setTimer(isBreak ? breakDuration * 60 : workDuration * 60);
    setElapsedWorkTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return sessions.filter(session => {
      const sessionDate = new Date(session.timestamp).toDateString();
      return sessionDate === today;
    });
  };

  const getTaskTotalTime = (taskId: string) => {
    const todaySessions = getTodaySessions();
    return todaySessions
      .filter(session => session.taskId === taskId)
      .reduce((total, session) => total + session.duration, 0);
  };

  const getTotalTimeToday = () => {
    return getTodaySessions().reduce((total, session) => total + session.duration, 0);
  };

  const renderQuadrantButton = (quadrant: number, label: string) => (
    <TouchableOpacity
      style={[
        styles.quadrantButton,
        selectedQuadrant === quadrant && styles.quadrantButtonActive,
      ]}
      onPress={() => setSelectedQuadrant(quadrant)}
    >
      <Text
        style={[
          styles.quadrantButtonText,
          selectedQuadrant === quadrant && styles.quadrantButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Focus Timer</Text>
      </View>

      <View style={styles.content}>
        {/* Timer Display */}
        <View style={[styles.timerContainer, isBreak && styles.timerContainerBreak]}>
          <Text style={styles.timerLabel}>
            {isBreak ? '☕ Break Time' : '🎯 Focus Time'}
          </Text>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
          {!isBreak && elapsedWorkTime > 0 && (
            <Text style={styles.elapsedText}>
              Working for: {formatDuration(elapsedWorkTime)}
            </Text>
          )}
        </View>

        {/* Timer Controls */}
        <View style={styles.controlsContainer}>
          {!isRunning ? (
            <TouchableOpacity
              style={[styles.controlButton, styles.startButton]}
              onPress={isBreak ? startBreak : startWork}
            >
              <Text style={styles.controlButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              onPress={pauseTimer}
            >
              <Text style={styles.controlButtonText}>Pause</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetTimer}
          >
            <Text style={styles.resetButtonText}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Duration Settings */}
        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Work Duration (min)</Text>
            <View style={styles.settingInput}>
              <TouchableOpacity
                onPress={() => setWorkDuration(Math.max(1, workDuration - 5))}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.durationInput}
                value={workDuration.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setWorkDuration(Math.max(1, Math.min(120, num)));
                }}
                keyboardType="number-pad"
              />
              <TouchableOpacity
                onPress={() => setWorkDuration(Math.min(120, workDuration + 5))}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Break Duration (min)</Text>
            <View style={styles.settingInput}>
              <TouchableOpacity
                onPress={() => setBreakDuration(Math.max(1, breakDuration - 5))}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.durationInput}
                value={breakDuration.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setBreakDuration(Math.max(1, Math.min(60, num)));
                }}
                keyboardType="number-pad"
              />
              <TouchableOpacity
                onPress={() => setBreakDuration(Math.min(60, breakDuration + 5))}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Task Selection */}
        <Text style={styles.sectionLabel}>Select Task</Text>
        <View style={styles.quadrantContainer}>
          <View style={styles.quadrantRow}>
            {renderQuadrantButton(1, 'Do Now')}
            {renderQuadrantButton(2, 'Schedule')}
          </View>
          <View style={styles.quadrantRow}>
            {renderQuadrantButton(3, 'Keep in Mind')}
            {renderQuadrantButton(4, 'Eliminate')}
          </View>
        </View>

        <View style={styles.taskDropdownContainer}>
          {filteredTasks.length === 0 ? (
            <View style={styles.taskDropdown}>
              <Text style={styles.taskDropdownText}>
                No tasks in this quadrant
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredTasks.map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskChip,
                    selectedTaskId === task.id && styles.taskChipActive,
                  ]}
                  onPress={() => setSelectedTaskId(task.id)}
                >
                  <Text
                    style={[
                      styles.taskChipText,
                      selectedTaskId === task.id && styles.taskChipTextActive,
                    ]}
                  >
                    {task.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Today's Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionLabel}>Today's Focus Time</Text>
          
          <View style={styles.totalTimeCard}>
            <Text style={styles.totalTimeLabel}>Total Time</Text>
            <Text style={styles.totalTimeValue}>
              {formatDuration(getTotalTimeToday())}
            </Text>
          </View>

          {getTodaySessions().length > 0 && (
            <View style={styles.sessionsList}>
              <Text style={styles.sessionsTitle}>Sessions</Text>
              {getTodaySessions().map((session, index) => (
                <View key={index} style={styles.sessionItem}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTaskName}>{session.taskName}</Text>
                    <Text style={styles.sessionTime}>
                      {new Date(session.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                  <Text style={styles.sessionDuration}>
                    {formatDuration(session.duration)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  timerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  timerContainerBreak: {
    backgroundColor: colors.quadrant3,
    borderColor: colors.quadrant3,
  },
  timerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  elapsedText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  controlButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  pauseButton: {
    backgroundColor: colors.quadrant3,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  resetButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 28,
    color: colors.text,
  },
  settingsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  settingItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  settingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '300',
  },
  durationInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  quadrantContainer: {
    gap: 12,
    marginBottom: 16,
  },
  quadrantRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quadrantButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quadrantButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quadrantButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  quadrantButtonTextActive: {
    color: 'white',
  },
  taskDropdownContainer: {
    marginBottom: 24,
  },
  taskDropdown: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskDropdownText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  taskChip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  taskChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  taskChipTextActive: {
    color: 'white',
  },
  statsContainer: {
    marginTop: 24,
  },
  totalTimeCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalTimeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  totalTimeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionsList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTaskName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});