import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

export default function AboutScreen({ navigation }: { navigation: any }) {
  const defaultTimerMinutes = 1; // work duration default
  const defaultBreakDuration = 5; // break duration default

  const [timerMinutes, setTimerMinutes] = useState(defaultTimerMinutes);
  const [timeLeft, setTimeLeft] = useState(defaultTimerMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'countdown' | 'countup'>('countdown');
  const [showTimerDropdown, setShowTimerDropdown] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const [breakDuration, setBreakDuration] = useState(defaultBreakDuration);
  const [currentBreakDuration, setCurrentBreakDuration] = useState(breakDuration);
  const [isBreak, setIsBreak] = useState(false);

  // Task dropdown
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [selectedTask, setSelectedTask] = useState('Assignment');

  const timerModes = [
    { label: 'Start Countdown', value: 'countdown' },
    { label: 'Start Stopwatch', value: 'countup' },
  ];

  // ---------- Timer logic ----------
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (timerMode === 'countdown') {
            if (prev <= 1) {
              clearInterval(intervalRef.current!);
              if (!isBreak) {
                // Switch to break automatically using locked duration
                setIsBreak(true);
                setTimerMinutes(currentBreakDuration);
                setTimeLeft(currentBreakDuration * 60);
                return currentBreakDuration * 60;
              } else {
                // Break finished
                setIsBreak(false);
                setTimerMinutes(defaultTimerMinutes);
                setTimeLeft(defaultTimerMinutes * 60);
                setIsRunning(false);
                return defaultTimerMinutes * 60;
              }
            }
            return prev - 1;
          } else {
            // Count up logic
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

  // Ensure timeLeft shows correct initial value
  useEffect(() => {
    setTimeLeft(timerMode === 'countdown' ? timerMinutes * 60 : 0);
  }, [timerMinutes, timerMode]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  };

  // Lock in break duration when starting
  const handleStartPause = () => {
    if (!isRunning && timerMode === 'countdown') {
      setCurrentBreakDuration(breakDuration);
    }
    setIsRunning(prev => !prev);
  };

  const handleBreakSelect = (minutes: number) => setBreakDuration(minutes);

  const handleLeave = () => {
  setIsRunning(false);
  setTimerMode('countdown');
  setTimerMinutes(defaultTimerMinutes);
  setBreakDuration(defaultBreakDuration);
  setCurrentBreakDuration(defaultBreakDuration);
  setTimeLeft(defaultTimerMinutes * 60);
  setIsBreak(false);
  setSelectedTask('Assignment');
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pomodoro</Text>

      {/* Task line */}
      <View style={styles.taskLine}>
        <Text style={styles.taskLabel}>Task: </Text>
        <TouchableOpacity
          style={styles.taskButton}
          onPress={() => setShowTaskDropdown(true)}
        >
          <Text style={styles.taskButtonText}>{selectedTask} ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Timer display */}
      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        {isBreak && <Text style={{ color: '#8000ff', fontSize: 16, marginTop: 5 }}>Break</Text>}
      </View>

      {/* Combined Start button + dropdown */}
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TouchableOpacity
          style={[styles.mainButton, { borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
          onPress={handleStartPause}
        >
          <Text style={styles.mainButtonText}>
            {isRunning
              ? 'Pause'
              : timerMode === 'countdown'
              ? 'Start Countdown'
              : 'Start Stopwatch'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dropdownButton, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
          onPress={() => setShowTimerDropdown(true)}
        >
          <Text style={styles.mainButtonText}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Break duration selector */}
      <View style={styles.breakContainer}>
        <Text style={styles.breakLabel}>Select Break Duration:</Text>
        <View style={styles.breakOptions}>
          {[5, 10, 15].map(min => (
            <TouchableOpacity
              key={min}
              style={[
                styles.breakOption,
                breakDuration === min && styles.breakSelectedUnderline,
              ]}
              onPress={() => handleBreakSelect(min)}
            >
              <Text
                style={[
                  styles.breakText,
                  breakDuration === min && { color: '#25292e', fontWeight: '600' },
                ]}
              >
                {min}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leave button */}
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeave}
        >
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
      </View>

      {/* Timer mode dropdown */}
      <Modal
        transparent
        visible={showTimerDropdown}
        animationType="fade"
        onRequestClose={() => setShowTimerDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowTimerDropdown(false)}
        >
          <View style={styles.dropdown}>
            {timerModes.map(mode => (
              <TouchableOpacity
                key={mode.value}
                onPress={() => {
                  setTimerMode(mode.value as 'countdown' | 'countup');
                  setShowTimerDropdown(false);
                }}
                style={styles.dropdownItem}
              >
                <Text>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Task dropdown (empty) */}
      <Modal
        transparent
        visible={showTaskDropdown}
        animationType="fade"
        onRequestClose={() => setShowTaskDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowTaskDropdown(false)}
        >
          <View style={styles.dropdown}>
            <Text style={{ color: '#999', textAlign: 'center' }}>No tasks yet</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#d9d9d9', alignItems: 'center', paddingVertical: 30 },
  title: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 10 },
  taskLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  taskLabel: { fontSize: 16, color: '#333' },
  taskButton: { backgroundColor: '#d9d9d9', marginLeft: 10, borderWidth: 1, borderColor: '#999', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  taskButtonText: { color: '#25292e', fontSize: 16, fontWeight: '500' },
  timerBox: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 40, paddingHorizontal: 60, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3, marginBottom: 30, alignItems: 'center' },
  timerText: { fontSize: 60, fontWeight: 'bold', color: '#25292e' },
  mainButton: { backgroundColor: '#8000ff', borderRadius: 25, paddingVertical: 15, paddingHorizontal: 40 },
  mainButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  dropdownButton: { backgroundColor: '#8000ff', borderRadius: 25, paddingVertical: 15, paddingHorizontal: 15 },
  breakContainer: { alignItems: 'center', marginTop: 10 },
  breakLabel: { fontSize: 16, color: '#333', marginBottom: 10 },
  breakOptions: { flexDirection: 'row', gap: 20 },
  breakOption: { backgroundColor: '#d9d9d9', paddingVertical: 6, paddingHorizontal: 12 },
  breakSelectedUnderline: { borderBottomWidth: 2, borderBottomColor: '#25292e' },
  breakText: { fontSize: 16, color: '#333' },
  leaveButton: { marginTop: 20, backgroundColor: '#25292e', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12, alignItems: 'center' },
  leaveText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  dropdown: { backgroundColor: '#fff', borderRadius: 8, padding: 10, minWidth: 150 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 20 },
});
