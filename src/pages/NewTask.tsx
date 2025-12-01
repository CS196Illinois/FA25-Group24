import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../constants/colors';

interface NewTaskProps {
  addTask: (task: any) => Promise<void>;
  onClose: () => void;
}

export default function NewTask({ addTask, onClose }: NewTaskProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState(new Date());
  const [importance, setImportance] = useState(3);
  const [difficulty, setDifficulty] = useState(3);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    const taskData = {
      name: name.trim(),
      description: description.trim(),
      dueDate: formatDate(dueDate),
      dueTime: formatTime(dueTime),
      importance,
      difficulty,
    };

    try {
      await addTask(taskData);
      Alert.alert('Success', 'Task added successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Task</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter task name"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.inputText}>{formatDate(dueDate)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDueDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Due Time</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.inputText}>{formatTime(dueTime)}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={dueTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) setDueTime(selectedTime);
            }}
          />
        )}

        <Text style={styles.label}>Importance: {importance}</Text>
        <View style={styles.sliderContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.sliderButton,
                importance === value && styles.sliderButtonActive,
              ]}
              onPress={() => setImportance(value)}
            >
              <Text
                style={[
                  styles.sliderButtonText,
                  importance === value && styles.sliderButtonTextActive,
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Difficulty: {difficulty}</Text>
        <View style={styles.sliderContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.sliderButton,
                difficulty === value && styles.sliderButtonActive,
              ]}
              onPress={() => setDifficulty(value)}
            >
              <Text
                style={[
                  styles.sliderButtonText,
                  difficulty === value && styles.sliderButtonTextActive,
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
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
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  sliderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sliderButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sliderButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
});