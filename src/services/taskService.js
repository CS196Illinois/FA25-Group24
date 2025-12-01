import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTask, completeTask, shouldDeleteCompletedTask } from '../utils/taskModel';
import { calculateQuadrant } from '../utils/eisenhowerUtils';

// Storage key for tasks
const TASKS_KEY = '@tasks';

/**
 * Get all tasks from AsyncStorage
 * @returns {Promise<Array>} Array of all tasks
 */
export const getAllTasks = async () => {
  try {
    const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
    
    if (tasksJson === null) {
      // No tasks stored yet, return empty array
      return [];
    }
    
    return JSON.parse(tasksJson);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

/**
 * Save tasks array to AsyncStorage
 * @param {Array} tasks - Array of task objects
 * @returns {Promise<boolean>} Success status
 */
export const saveTasks = async (tasks) => {
  try {
    const tasksJson = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, tasksJson);
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

/**
 * Add a new task
 * @param {Object} taskData - Task information
 * @returns {Promise<Object>} The created task
 */
export const addTask = async (taskData) => {
  try {
    // Create new task with all required fields
    const newTask = createTask(taskData);
    
    // Get existing tasks
    const tasks = await getAllTasks();
    
    // Add new task to array
    tasks.push(newTask);
    
    // Save back to storage
    await saveTasks(tasks);
    
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {string} taskId - ID of task to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated task or null if not found
 */
export const updateTask = async (taskId, updates) => {
  try {
    const tasks = await getAllTasks();
    
    // Find task index
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      console.error('Task not found:', taskId);
      return null;
    }
    
    // Update task (merge old data with updates)
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates
    };
    
    // Save back to storage
    await saveTasks(tasks);
    
    return tasks[taskIndex];
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} taskId - ID of task to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteTask = async (taskId) => {
  try {
    const tasks = await getAllTasks();
    
    // Filter out the task to delete
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    
    // Save back to storage
    await saveTasks(updatedTasks);
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

/**
 * Toggle task completion status
 * @param {string} taskId - ID of task to toggle
 * @returns {Promise<Object|null>} Updated task or null if not found
 */
export const toggleTaskComplete = async (taskId) => {
  try {
    const tasks = await getAllTasks();
    
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      console.error('Task not found:', taskId);
      return null;
    }
    
    const task = tasks[taskIndex];
    
    if (task.isCompleted) {
      // Uncomplete the task
      tasks[taskIndex] = {
        ...task,
        isCompleted: false,
        completedAt: null
      };
    } else {
      // Complete the task
      tasks[taskIndex] = completeTask(task);
    }
    
    await saveTasks(tasks);
    
    return tasks[taskIndex];
  } catch (error) {
    console.error('Error toggling task completion:', error);
    throw error;
  }
};

/**
 * Delete tasks that have been completed for more than 24 hours
 * @returns {Promise<number>} Number of tasks deleted
 */
export const cleanupOldCompletedTasks = async () => {
  try {
    const tasks = await getAllTasks();
    
    // Filter out old completed tasks
    const tasksToKeep = tasks.filter(task => !shouldDeleteCompletedTask(task));
    
    const deletedCount = tasks.length - tasksToKeep.length;
    
    if (deletedCount > 0) {
      await saveTasks(tasksToKeep);
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up tasks:', error);
    return 0;
  }
};

/**
 * Get all tasks in a specific quadrant, sorted by due date
 * @param {number} quadrant - Quadrant number (1-4)
 * @returns {Promise<Array>} Array of tasks in that quadrant
 */
export const getTasksByQuadrant = async (quadrant) => {
  try {
    const tasks = await getAllTasks();
    
    // Filter tasks by quadrant
    const quadrantTasks = tasks.filter(task => {
      const taskQuadrant = calculateQuadrant(task.difficulty, task.importance);
      return taskQuadrant === quadrant;
    });
    
    // Sort by due date (earliest first)
    quadrantTasks.sort((a, b) => {
      const dateA = new Date(`${a.dueDate} ${a.dueTime}`);
      const dateB = new Date(`${b.dueDate} ${b.dueTime}`);
      return dateA - dateB;
    });
    
    return quadrantTasks;
  } catch (error) {
    console.error('Error getting tasks by quadrant:', error);
    return [];
  }
};

/**
 * Get all tasks sorted by due date
 * @returns {Promise<Array>} Array of all tasks sorted by due date
 */
export const getTasksSortedByDate = async () => {
  try {
    const tasks = await getAllTasks();
    
    // Sort by due date
    tasks.sort((a, b) => {
      const dateA = new Date(`${a.dueDate} ${a.dueTime}`);
      const dateB = new Date(`${b.dueDate} ${b.dueTime}`);
      return dateA - dateB;
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting sorted tasks:', error);
    return [];
  }
};