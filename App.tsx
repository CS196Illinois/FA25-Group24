import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import HomeScreen, { Task } from './src/pages/HomeScreen';
import CalendarScreen from './src/pages/CalendarScreen';
import PomodoroScreen from './src/pages/AboutScreen';
import { colors } from './src/constants/colors';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [tasks, setTasks] = useState([]);

  const addTask = (task) => setTasks(prev => [...prev, task]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen tasks={tasks} addTask={addTask} />;
      case 'calendar':
        return <CalendarScreen />;
      case 'pomodoro':
        return <PomodoroScreen addTask={addTask} />;
      default:
        return <HomeScreen tasks={tasks} addTask={addTask} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      
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