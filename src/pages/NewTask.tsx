import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Task } from './HomeScreen';
import { colors } from '../constants/colors';

type NewTaskProps = {
  defaultQuadrant: Task['quadrant'];
  addTask: (task: Task) => void;
  onClose: () => void;
};

export default function NewTask({ defaultQuadrant, addTask, onClose }: NewTaskProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [importance, setImportance] = useState(3);
  const [difficulty, setDifficulty] = useState(3);

  const handleSave = () => {
    if (!name.trim()) return;
    addTask({
      name,
      description,
      dueDate: dueDate.toLocaleDateString(),
      quadrant: defaultQuadrant,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onClose}>
          <Text style={styles.headerButton}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>New Task</Text>
        <Pressable onPress={handleSave}>
          <Text style={[styles.headerButton, { color: colors.primary }]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            placeholder="Enter task name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Enter description"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Date</Text>
          <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.inputText}>{dueDate.toLocaleDateString()}</Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker value={dueDate} mode="date" onChange={handleDateChange} />
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Time</Text>
          <Pressable style={styles.input} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.inputText}>{dueDate.toLocaleTimeString()}</Text>
          </Pressable>
        </View>

        {showTimePicker && (
          <DateTimePicker value={dueDate} mode="time" onChange={handleTimeChange} />
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Importance: {importance}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={importance}
            onValueChange={setImportance}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Difficulty: {difficulty}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={difficulty}
            onValueChange={setDifficulty}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: { 
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: { 
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  slider: { 
    width: '100%', 
    height: 40,
  },
});