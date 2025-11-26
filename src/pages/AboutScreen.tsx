import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, SafeAreaView, ScrollView } from 'react-native';
import { Task } from './HomeScreen';
import { colors } from '../constants/colors';

type PomodoroProps = {
  addTask?: (task: Task) => void;
};

export default function PomodoroScreen({ addTask }: PomodoroProps) {
  const defaultTimerMinutes = 1;
  const defaultBreakDuration = 5;

  const [timerMinutes, setTimerMinutes] = useState(defaultTimerMinutes);
  const [timeLeft, setTimeLeft] = useState(defaultTimerMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'countdown' | 'countup'>('countdown');
  const [showTimerDropdown, setShowTimerDropdown] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const [breakDuration, setBreakDuration] = useState(defaultBreakDuration);
  const [currentBreakDuration, setCurrentBreakDuration] = useState(breakDuration);
  const [isBreak, setIsBreak] = useState(false);

  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [selectedTask, setSelectedTask] = useState('Assignment');
  const [selectedQuadrant, setSelectedQuadrant] = useState<Task['quadrant']>('doNow');

  const timerModes = [
    { label: 'Start Countdown', value: 'countdown' },
    { label: 'Start Stopwatch', value: 'countup' },
  ];

  const quadrants: { key: Task['quadrant']; label: string }[] = [
    { key: 'doNow', label: 'Do Now' },
    { key: 'scheduleNow', label: 'Schedule' },
    { key: 'keepInMind', label: 'Keep in Mind' },
    { key: 'eliminate', label: 'Eliminate' },
  ];

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (timerMode === 'countdown') {
            if (prev <= 1) {
              clearInterval(intervalRef.current!);
              if (!isBreak) {
                setIsBreak(true);
                setTimerMinutes(currentBreakDuration);
                setTimeLeft(currentBreakDuration * 60);
                return currentBreakDuration * 60;
              } else {
                setIsBreak(false);
                setTimerMinutes(defaultTimerMinutes);
                setTimeLeft(defaultTimerMinutes * 60);
                setIsRunning(false);
                return defaultTimerMinutes * 60;
              }
            }
            return prev - 1;
          } else {
            if (prev >= timerMinutes * 60) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              return timerMinutes * 60;
            }
            return prev + 1;
          }
        });
      }, 1000) as unknown as number;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timerMode, timerMinutes, isBreak, currentBreakDuration]);

  useEffect(() => {
    setTimeLeft(timerMode === 'countdown' ? timerMinutes * 60 : 0);
  }, [timerMinutes, timerMode]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (!isRunning && timerMode === 'countdown') setCurrentBreakDuration(breakDuration);
    setIsRunning(prev => !prev);
  };

  const handleBreakSelect = (minutes: number) => setBreakDuration(minutes);

  const handleLeave = () => {
    if (addTask) {
      addTask({
        name: selectedTask,
        description: 'Pomodoro session',
        dueDate: new Date().toLocaleDateString(),
        quadrant: selectedQuadrant,
      });
    }

    setIsRunning(false);
    setTimerMode('countdown');
    setTimerMinutes(defaultTimerMinutes);
    setBreakDuration(defaultBreakDuration);
    setCurrentBreakDuration(defaultBreakDuration);
    setTimeLeft(defaultTimerMinutes * 60);
    setIsBreak(false);
    setSelectedTask('Assignment');
    setSelectedQuadrant('doNow');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pomodoro</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task</Text>
          <Pressable style={styles.selectButton} onPress={() => setShowTaskDropdown(true)}>
            <Text style={styles.selectButtonText}>{selectedTask}</Text>
            <Text style={styles.selectButtonIcon}>▼</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quadrant</Text>
          <View style={styles.quadrantGrid}>
            {quadrants.map(q => (
              <Pressable
                key={q.key}
                style={[
                  styles.quadrantOption,
                  selectedQuadrant === q.key && styles.quadrantOptionSelected,
                ]}
                onPress={() => setSelectedQuadrant(q.key)}
              >
                <Text
                  style={[
                    styles.quadrantOptionText,
                    selectedQuadrant === q.key && styles.quadrantOptionTextSelected,
                  ]}
                >
                  {q.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          {isBreak && <Text style={styles.breakIndicator}>Break Time</Text>}
        </View>

        <View style={styles.controlButtons}>
          <Pressable
            style={[styles.mainButton, { flex: 1 }]}
            onPress={handleStartPause}
          >
            <Text style={styles.mainButtonText}>
              {isRunning ? 'Pause' : timerMode === 'countdown' ? 'Start Countdown' : 'Start Stopwatch'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.dropdownButton}
            onPress={() => setShowTimerDropdown(true)}
          >
            <Text style={styles.mainButtonText}>▼</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Break Duration</Text>
          <View style={styles.breakOptions}>
            {[5, 10, 15].map(min => (
              <Pressable
                key={min}
                style={[
                  styles.breakOption,
                  breakDuration === min && styles.breakOptionSelected,
                ]}
                onPress={() => handleBreakSelect(min)}
              >
                <Text
                  style={[
                    styles.breakOptionText,
                    breakDuration === min && styles.breakOptionTextSelected,
                  ]}
                >
                  {min} min
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.leaveButton} onPress={handleLeave}>
          <Text style={styles.leaveButtonText}>Save & Leave</Text>
        </Pressable>
      </ScrollView>

      <Modal
        transparent
        visible={showTimerDropdown}
        animationType="fade"
        onRequestClose={() => setShowTimerDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowTimerDropdown(false)}>
          <View style={styles.dropdown}>
            {timerModes.map(mode => (
              <Pressable
                key={mode.value}
                onPress={() => {
                  setTimerMode(mode.value as 'countdown' | 'countup');
                  setShowTimerDropdown(false);
                }}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownItemText}>{mode.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={showTaskDropdown}
        animationType="fade"
        onRequestClose={() => setShowTaskDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowTaskDropdown(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.emptyDropdownText}>No tasks yet</Text>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  selectButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  selectButtonIcon: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  quadrantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quadrantOption: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '48%',
    alignItems: 'center',
  },
  quadrantOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quadrantOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  quadrantOptionTextSelected: {
    color: '#fff',
  },
  timerBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 60,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.text,
  },
  breakIndicator: {
    color: colors.primary,
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  mainButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  breakOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  breakOption: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  breakOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  breakOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  breakOptionTextSelected: {
    color: '#fff',
  },
  leaveButton: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  emptyDropdownText: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 12,
    fontSize: 14,
  },
});