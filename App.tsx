import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import HomeScreen from './src/pages/HomeScreen';
import CalendarScreen from './src/pages/CalendarScreen';
import PomodoroScreen from './src/pages/AboutScreen';
import NewTask from './src/pages/NewTask';
import { colors } from './src/constants/colors';
import { getAllTasks, addTask as addTaskToStorage, cleanupOldCompletedTasks } from './src/services/taskService';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showNewTask, setShowNewTask] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasksFromStorage();
    // Cleanup old completed tasks on app start
    cleanupOldCompletedTasks();
  }, []);

  const loadTasksFromStorage = async () => {
    try {
      const storedTasks = await getAllTasks();
      setTasks(storedTasks);
      console.log('Loaded tasks:', storedTasks.length);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addTask = async (taskData: any) => {
    try {
      const newTask = await addTaskToStorage(taskData);
      setTasks(prev => [...prev, newTask]);
      console.log('Task added successfully:', newTask.name);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const renderScreen = () => {
    if (showNewTask) {
      return (
        <NewTask
          addTask={addTask}
          onClose={() => setShowNewTask(false)}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            tasks={tasks}
            addTask={addTask}
            onTasksChange={loadTasksFromStorage}
            onNavigateToNewTask={() => setShowNewTask(true)}
          />
        );
      case 'calendar':
  return (
    <CalendarScreen
      tasks={tasks}
      onNavigateToNewTask={() => setShowNewTask(true)}
    />
  );
    case 'pomodoro':
        return <PomodoroScreen tasks={tasks} />;
      default:
        return (
          <HomeScreen
            tasks={tasks}
            addTask={addTask}
            onTasksChange={loadTasksFromStorage}
            onNavigateToNewTask={() => setShowNewTask(true)}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      
      {!showNewTask && (
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => setActiveTab('home')}
          >
            <Text style={[styles.navIcon, activeTab === 'home' && styles.navIconActive]}>⌂</Text>
            <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => setActiveTab('calendar')}
          >
            <Text style={[styles.navIcon, activeTab === 'calendar' && styles.navIconActive]}>📅</Text>
            <Text style={[styles.navLabel, activeTab === 'calendar' && styles.navLabelActive]}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => setActiveTab('pomodoro')}
          >
            <Text style={[styles.navIcon, activeTab === 'pomodoro' && styles.navIconActive]}>⏱</Text>
            <Text style={[styles.navLabel, activeTab === 'pomodoro' && styles.navLabelActive]}>Focus</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomNav: { 
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 10,
    paddingTop: 10,
    height: 65,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIcon: { 
    fontSize: 24,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});