import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new task object with all required fields
 * @param {Object} taskData - The task information
 * @returns {Object} Complete task object
 */
export const createTask = (taskData) => {
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(), // Generate unique ID
    name: taskData.name || '',
    description: taskData.description || '',
    dueDate: taskData.dueDate || '',
    dueTime: taskData.dueTime || '',
    importance: taskData.importance || 3,
    difficulty: taskData.difficulty || 3,
    isCompleted: false,
    completedAt: null,
    createdAt: now
  };
};

/**
 * Marks a task as completed
 * @param {Object} task - The task to complete
 * @returns {Object} Updated task object
 */
export const completeTask = (task) => {
  return {
    ...task,
    isCompleted: true,
    completedAt: new Date().toISOString()
  };
};

/**
 * Checks if a completed task should be deleted (>24 hours old)
 * @param {Object} task - The task to check
 * @returns {boolean} True if task should be deleted
 */
export const shouldDeleteCompletedTask = (task) => {
  if (!task.isCompleted || !task.completedAt) {
    return false;
  }
  
  const completedTime = new Date(task.completedAt);
  const now = new Date();
  const hoursSinceCompletion = (now - completedTime) / (1000 * 60 * 60);
  
  return hoursSinceCompletion >= 24;
};