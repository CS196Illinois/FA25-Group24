import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../constants/colors';
import { calculateQuadrant, getQuadrantName } from '../utils/eisenhowerUtils';
import { deleteTask, toggleTaskComplete } from '../services/taskService';

export interface Task {
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

interface HomeScreenProps {
  tasks: Task[];
  addTask: (task: any) => void;
  onTasksChange: () => void;
  onNavigateToNewTask: () => void;
}

export default function HomeScreen({ tasks, addTask, onTasksChange, onNavigateToNewTask }: HomeScreenProps) {
  const [tasksByQuadrant, setTasksByQuadrant] = useState<{[key: number]: Task[]}>({
    1: [],
    2: [],
    3: [],
    4: []
  });

  useEffect(() => {
    organizeTasksByQuadrant();
  }, [tasks]);

  const organizeTasksByQuadrant = () => {
    const organized: {[key: number]: Task[]} = {
      1: [],
      2: [],
      3: [],
      4: []
    };

    tasks.forEach(task => {
      const quadrant = calculateQuadrant(task.difficulty, task.importance);
      organized[quadrant].push(task);
    });

    // Sort each quadrant by due date
    Object.keys(organized).forEach(key => {
      const quadrantNum = parseInt(key);
      organized[quadrantNum].sort((a, b) => {
        const dateA = new Date(`${a.dueDate} ${a.dueTime}`);
        const dateB = new Date(`${b.dueDate} ${b.dueTime}`);
        return dateA.getTime() - dateB.getTime();
      });
    });

    setTasksByQuadrant(organized);
  };

  const handleDeleteTask = async (taskId: string, taskName: string) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(taskId);
            onTasksChange();
          }
        }
      ]
    );
  };

  const handleToggleComplete = async (taskId: string) => {
    await toggleTaskComplete(taskId);
    onTasksChange();
  };

  const renderTask = (task: Task) => (
    <View key={task.id} style={[styles.taskItem, task.isCompleted && styles.taskCompleted]}>
      <TouchableOpacity 
        style={styles.taskCheckbox}
        onPress={() => handleToggleComplete(task.id)}
      >
        <Text style={styles.checkbox}>{task.isCompleted ? '✓' : '○'}</Text>
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <Text style={[styles.taskName, task.isCompleted && styles.taskNameCompleted]}>
          {task.name}
        </Text>
        <Text style={styles.taskTime}>
          {task.dueDate} at {task.dueTime}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(task.id, task.name)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuadrant = (quadrant: number, title: string, subtitle: string, bgColor: string) => (
    <View style={[styles.quadrant, { backgroundColor: bgColor }]}>
      <View style={styles.quadrantHeader}>
        <Text style={styles.quadrantTitle}>{title}</Text>
        <TouchableOpacity onPress={onNavigateToNewTask}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.quadrantSubtitle}>{subtitle}</Text>
      
      <ScrollView style={styles.taskList}>
        {tasksByQuadrant[quadrant].length === 0 ? (
          <Text style={styles.noTasks}>No tasks yet</Text>
        ) : (
          tasksByQuadrant[quadrant].map(task => renderTask(task))
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderQuadrant(1, 'Do Now', 'Important and Urgent', colors.quadrant1)}
        {renderQuadrant(2, 'Schedule', 'Important, but not Urgent', colors.quadrant2)}
        {renderQuadrant(3, 'Keep in Mind', 'Urgent, but not Important', colors.quadrant3)}
        {renderQuadrant(4, 'Eliminate', 'Not Urgent or Important', colors.quadrant4)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  quadrant: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 150,
  },
  quadrantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quadrantTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
  quadrantSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  taskList: {
    flex: 1,
  },
  noTasks: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskCompleted: {
    opacity: 0.6,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    fontSize: 20,
    color: 'white',
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 2,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
  },
  taskTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '300',
  },
});