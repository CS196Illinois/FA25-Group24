import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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

export default function PomodoroScreen({ tasks }: PomodoroScreenProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<number>(1);
  const [timer, setTimer] = useState(60); // 1 minute in seconds for demo
  const [isRunning, setIsRunning] = useState(false);
  const [breakDuration, setBreakDuration] = useState(5);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  useEffect(() => {
    filterTasksByQuadrant();
  }, [tasks, selectedQuadrant]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
      Alert.alert('Time\'s Up!', 'Great work! Time for a break.');
    }

    return () => clearInterval(interval);
  }, [isRunning, timer]);

const filterTasksByQuadrant = () => {
  console.log('All tasks:', tasks.length);
  console.log('Selected quadrant:', selectedQuadrant);
  
  const filtered = tasks.filter(task => {
    const quadrant = calculateQuadrant(task.difficulty, task.importance);
    console.log(`Task: ${task.name}, Quadrant: ${quadrant}, Completed: ${task.isCompleted}`);
    return quadrant === selectedQuadrant && !task.isCompleted;
  });
  
  console.log('Filtered tasks:', filtered.length);
  setFilteredTasks(filtered);
  
  // Auto-select first task if available
  if (filtered.length > 0 && !selectedTaskId) {
    setSelectedTaskId(filtered[0].id);
  }
};
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCountdown = () => {
    if (!selectedTaskId) {
      Alert.alert('No Task Selected', 'Please select a task first');
      return;
    }
    setIsRunning(true);
  };

  const pauseCountdown = () => {
    setIsRunning(false);
  };

  const resetCountdown = () => {
    setIsRunning(false);
    setTimer(60); // Reset to 1 minute
  };

  const getSelectedTaskName = () => {
    const task = filteredTasks.find(t => t.id === selectedTaskId);
    return task ? task.name : 'Select a task';
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
        <Text style={styles.headerTitle}>Pomodoro</Text>
      </View>

      <View style={styles.content}>
<Text style={styles.label}>Task</Text>
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

        <Text style={styles.label}>Quadrant</Text>
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

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.controlButtonPrimary]}
            onPress={isRunning ? pauseCountdown : startCountdown}
          >
            <Text style={styles.controlButtonText}>
              {isRunning ? 'Pause' : 'Start Countdown'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetCountdown}
          >
            <Text style={styles.resetButtonText}>↻</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Break Duration</Text>
        <View style={styles.breakDurationContainer}>
          <TouchableOpacity
            style={[
              styles.breakButton,
              breakDuration === 5 && styles.breakButtonActive,
            ]}
            onPress={() => setBreakDuration(5)}
          >
            <Text
              style={[
                styles.breakButtonText,
                breakDuration === 5 && styles.breakButtonTextActive,
              ]}
            >
              5 min
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.breakButton,
              breakDuration === 10 && styles.breakButtonActive,
            ]}
            onPress={() => setBreakDuration(10)}
          >
            <Text
              style={[
                styles.breakButtonText,
                breakDuration === 10 && styles.breakButtonTextActive,
              ]}
            >
              10 min
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.breakButton,
              breakDuration === 15 && styles.breakButtonActive,
            ]}
            onPress={() => setBreakDuration(15)}
          >
            <Text
              style={[
                styles.breakButtonText,
                breakDuration === 15 && styles.breakButtonTextActive,
              ]}
            >
              15 min
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save & Leave</Text>
        </TouchableOpacity>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 20,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },

  /* Added task dropdown and chip styles used in the component */
  taskDropdownContainer: {
    marginBottom: 12,
  },
  taskDropdown: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  taskDropdownText: {
    color: colors.text,
  },
  taskChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskChipText: {
    color: colors.text,
  },
  taskChipTextActive: {
    color: 'white',
  },

  quadrantContainer: {
    gap: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quadrantButtonTextActive: {
    color: 'white',
  },
  timerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  controlButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  controlButtonPrimary: {
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 28,
    color: 'white',
  },
  breakDurationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  breakButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  breakButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  breakButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  breakButtonTextActive: {
    color: 'white',
  },
  saveButton: {
    marginTop: 32,
    padding: 18,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});