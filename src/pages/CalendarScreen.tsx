import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDays, addWeeks, subWeeks, startOfWeek, isSameDay, format } from 'date-fns';
import { colors } from '../constants/colors';

const taskColors = [colors.doNow, colors.scheduleNow, colors.keepInMind, colors.eliminate];

export type Task = {
  title: string;
  date: Date;
  color: string;
  startTime: Date;
  endTime: Date;
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    title: '',
    date: new Date(),
    color: taskColors[0],
    startTime: new Date(),
    endTime: new Date(),
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    setTasks([...tasks, newTask]);
    setModalVisible(false);
    setNewTask({
      title: '',
      date: new Date(),
      color: taskColors[0],
      startTime: new Date(),
      endTime: new Date(),
    });
  };

  const renderWeeklyView = () => {
    const startOfCurrentWeek = startOfWeek(selectedDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

    return (
      <ScrollView style={styles.weeklyContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.weekNavigation}>
          <TouchableOpacity onPress={() => setSelectedDate(subWeeks(selectedDate, 1))}>
            <Text style={styles.weekNavButton}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.weekTitle}>
            Week of {format(startOfCurrentWeek, 'MM/dd/yyyy')}
          </Text>
          <TouchableOpacity onPress={() => setSelectedDate(addWeeks(selectedDate, 1))}>
            <Text style={styles.weekNavButton}>▶</Text>
          </TouchableOpacity>
        </View>

        {days.map(day => {
          const dayTasks = tasks.filter(t => isSameDay(t.date, day));
          return (
            <View key={day.toString()} style={styles.dayCard}>
              <Text style={styles.dayHeader}>{format(day, 'EEEE MM/dd/yyyy')}</Text>
              {dayTasks.length > 0 ? (
                dayTasks.map((task, idx) => (
                  <View
                    key={idx}
                    style={[styles.eventCard, { borderLeftColor: task.color }]}
                  >
                    <Text style={styles.eventTitle}>{task.title}</Text>
                    <Text style={styles.eventTime}>
                      {format(task.startTime, 'hh:mm a')} - {format(task.endTime, 'hh:mm a')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No events</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={[styles.headerButton, { color: colors.primary }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewModeContainer}>
        <TouchableOpacity 
          style={[styles.viewModeButton, viewMode === 'weekly' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('weekly')}
        >
          <Text style={[styles.viewModeText, viewMode === 'weekly' && styles.viewModeTextActive]}>
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewModeButton, viewMode === 'monthly' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('monthly')}
        >
          <Text style={[styles.viewModeText, viewMode === 'monthly' && styles.viewModeTextActive]}>
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'weekly' ? renderWeeklyView() : (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Monthly view coming soon</Text>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Event</Text>
            
            <TextInput
              placeholder="Event Title"
              value={newTask.title}
              onChangeText={t => setNewTask({ ...newTask, title: t })}
              style={styles.input}
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.modalLabel}>Select Color:</Text>
            <View style={styles.colorPicker}>
              {taskColors.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setNewTask({ ...newTask, color: c })}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    newTask.color === c && styles.colorOptionSelected
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              style={styles.input}
            >
              <Text style={styles.inputText}>Start: {format(newTask.startTime, 'hh:mm a')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              style={styles.input}
            >
              <Text style={styles.inputText}>End: {format(newTask.endTime, 'hh:mm a')}</Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={newTask.startTime}
                mode="time"
                display="spinner"
                onChange={(_, time) => {
                  setShowStartPicker(false);
                  if (time) setNewTask({ ...newTask, startTime: time });
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={newTask.endTime}
                mode="time"
                display="spinner"
                onChange={(_, time) => {
                  setShowEndPicker(false);
                  if (time) setNewTask({ ...newTask, endTime: time });
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAddTask}
                style={[styles.modalButton, styles.modalButtonPrimary]}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: colors.surface,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  viewModeTextActive: {
    color: '#fff',
  },
  weeklyContainer: {
    flex: 1,
    padding: 16,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
  },
  weekNavButton: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});