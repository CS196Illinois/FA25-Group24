import React, { useState, useEffect } from 'react';
// Shreyas's code
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import HomeScreen from './src/pages/HomeScreen';
import CalendarScreen from './src/pages/CalendarScreen';
import PomodoroScreen from './src/pages/AboutScreen';
import NewTask from './src/pages/NewTask';
import LoginScreen from './src/pages/auth/LoginScreen';
import SignupScreen from './src/pages/auth/SignupScreen';
import { colors } from './src/constants/colors';
import { supabase } from './src/services/supabase';
import * as SupabaseTaskService from './src/services/supabaseTaskService';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showNewTask, setShowNewTask] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [tasks, setTasks] = useState([]);
  // Shreyas's code
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Shreyas's code
  // Deep link handler for email confirmation
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('Deep link received:', url);

      // Check if it's an auth callback
      if (url.includes('access_token') || url.includes('type=signup') || url.includes('type=recovery')) {
        // Supabase will automatically handle the session via detectSessionInUrl
        const { data, error } = await supabase.auth.getSession();
        if (data.session) {
          console.log('User authenticated via email confirmation');
          setSession(data.session);
        } else if (error) {
          console.error('Error getting session from deep link:', error);
        }
      }
    };

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  // Shreyas's code

  useEffect(() => {
    if (session) {
      loadTasksFromCloud();
      // Cleanup old completed tasks on app start
      SupabaseTaskService.cleanupOldCompletedTasks();
    }
  }, [session]);

  const loadTasksFromCloud = async () => {
    try {
      const cloudTasks = await SupabaseTaskService.getAllTasks();
      setTasks(cloudTasks);
      console.log('Loaded tasks from cloud:', cloudTasks.length);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addTask = async (taskData: any) => {
    try {
      const newTask = await SupabaseTaskService.addTask(taskData);
      setTasks(prev => [...prev, newTask]);
      console.log('Task added successfully:', newTask.name);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTasks([]);
    setActiveTab('home');
  };

  // Shreyas's code
  // Handle navigation with timer lock check
  const handleTabChange = (tab: string) => {
    if (isPomodoroRunning && activeTab === 'pomodoro') {
      Alert.alert(
        'Timer is Running',
        'Please pause or complete your focus session before leaving.',
        [{ text: 'OK' }]
      );
      return;
    }
    setActiveTab(tab);
  };

  // Development bypass - skip login (set to false to re-enable login)
  const DEV_BYPASS_LOGIN = false;

  // Show loading screen while checking auth
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show auth screens if not logged in (unless dev bypass is enabled)
  if (!session && !DEV_BYPASS_LOGIN) {
    if (authScreen === 'signup') {
      return (
        <SignupScreen
          onSignupSuccess={() => setAuthScreen('login')}
          onNavigateToLogin={() => setAuthScreen('login')}
        />
      );
    }
    return (
      <LoginScreen
        onLoginSuccess={() => {}}
        onNavigateToSignup={() => setAuthScreen('signup')}
      />
    );
  }

  // Main app (user is logged in)
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
            onTasksChange={loadTasksFromCloud}
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
        // Shreyas's code
        return <PomodoroScreen tasks={tasks} onTimerStateChange={setIsPomodoroRunning} />;
      default:
        return (
          <HomeScreen
            tasks={tasks}
            addTask={addTask}
            onTasksChange={loadTasksFromCloud}
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
          {/* Shreyas's code */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleTabChange('home')}
          >
            <Text style={[styles.navIcon, activeTab === 'home' && styles.navIconActive]}>⌂</Text>
            <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
          </TouchableOpacity>

          {/* Shreyas's code */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleTabChange('calendar')}
          >
            <Text style={[styles.navIcon, activeTab === 'calendar' && styles.navIconActive]}>📅</Text>
            <Text style={[styles.navLabel, activeTab === 'calendar' && styles.navLabelActive]}>Calendar</Text>
          </TouchableOpacity>

          {/* Shreyas's code */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleTabChange('pomodoro')}
          >
            <Text style={[styles.navIcon, activeTab === 'pomodoro' && styles.navIconActive]}>⏱</Text>
            <Text style={[styles.navLabel, activeTab === 'pomodoro' && styles.navLabelActive]}>Focus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleLogout}
          >
            <Text style={styles.navIcon}>🚪</Text>
            <Text style={styles.navLabel}>Logout</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
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