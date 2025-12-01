import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Box Component
 * A reusable component that displays a colored box with a bulleted list of tasks
 *
 * @param {string} color - The background color of the box (e.g., 'red', 'blue', 'green', 'purple')
 * @param {string} title - The title displayed at the top of the box
 */
const Box = ({ color, title }) => {
  const { colors } = useTheme();
  // State to hold the list of tasks
  const [tasks, setTasks] = useState([]);
  // State to hold the current text being typed
  const [currentText, setCurrentText] = useState('');

  /**
   * Adds a new task to the list
   */
  const addTask = () => {
    if (currentText.trim() !== '') {
      setTasks([...tasks, { id: Date.now().toString(), text: currentText }]);
      setCurrentText(''); // Clear input after adding
    }
  };

  /**
   * Removes a task from the list
   */
  const removeTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <View style={[styles.box, { backgroundColor: color }]}>
      {/* Title at the top of the box */}
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Input field for adding new tasks */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.overlay }]}
          placeholder="Type a task..."
          placeholderTextColor={colors.textSecondary}
          value={currentText}
          onChangeText={setCurrentText}
          onSubmitEditing={addTask} // Add task when user presses Enter
          returnKeyType="done"
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.overlayStrong }]} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Display list of tasks */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.taskText}>{item.text}</Text>
            <TouchableOpacity onPress={() => removeTask(item.id)}>
              <Text style={styles.deleteButton}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tasks yet. Add one above!</Text>
        }
      />
    </View>
  );
};

// StyleSheet.create helps us define styles for our components
const styles = StyleSheet.create({
  box: {
    width: 300,           // Width of the box
    minHeight: 150,       // Minimum height of the box
    maxHeight: 300,       // Maximum height to prevent overflow
    margin: 5,            // Space around the box
    borderRadius: 8,      // Rounded corners
    padding: 15,          // Space inside the box
  },
  title: {
    color: '#fff',        // White text color
    fontSize: 15,         // Compact font size
    fontWeight: 'bold',   // Bold text
    marginBottom: 10,     // Small space below title
    textAlign: 'center',  // Center the title
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: '#fff',        // White text color
    fontSize: 16,         // Text size
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButton: {
    marginLeft: 8,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  bullet: {
    color: '#fff',
    fontSize: 20,
    marginRight: 8,
  },
  taskText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  deleteButton: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Box;