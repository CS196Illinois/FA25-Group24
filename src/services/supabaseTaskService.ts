import { supabase } from './supabase';
import { calculateQuadrant } from '../utils/eisenhowerUtils';

export interface Task {
  id: string;
  user_id: string;
  name: string;
  description: string;
  due_date: string;
  due_time: string;
  importance: number;
  difficulty: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Convert snake_case from database to camelCase for app
const convertTaskFromDB = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    user_id: dbTask.user_id,
    name: dbTask.name,
    description: dbTask.description || '',
    dueDate: dbTask.due_date,
    dueTime: dbTask.due_time,
    importance: dbTask.importance,
    difficulty: dbTask.difficulty,
    isCompleted: dbTask.is_completed,
    completedAt: dbTask.completed_at,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
  } as any;
};

// Convert camelCase from app to snake_case for database
const convertTaskToDB = (task: any) => {
  return {
    name: task.name,
    description: task.description || '',
    due_date: task.dueDate,
    due_time: task.dueTime,
    importance: task.importance,
    difficulty: task.difficulty,
    is_completed: task.isCompleted || false,
    completed_at: task.completedAt || null,
  };
};

/**
 * Get all tasks for the current user
 */
export const getAllTasks = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user logged in');
      return [];
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return (data || []).map(convertTaskFromDB);
  } catch (error) {
    console.error('Error in getAllTasks:', error);
    return [];
  }
};

/**
 * Add a new task
 */
export const addTask = async (taskData: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user logged in');
    }

    const taskForDB = {
      ...convertTaskToDB(taskData),
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskForDB])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    }

    return convertTaskFromDB(data);
  } catch (error) {
    console.error('Error in addTask:', error);
    throw error;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId: string, updates: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user logged in');
    }

    const updatesForDB = convertTaskToDB(updates);

    const { data, error } = await supabase
      .from('tasks')
      .update(updatesForDB)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return convertTaskFromDB(data);
  } catch (error) {
    console.error('Error in updateTask:', error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user logged in');
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTask:', error);
    return false;
  }
};

/**
 * Toggle task completion status
 */
export const toggleTaskComplete = async (taskId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user logged in');
    }

    // Get current task
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !currentTask) {
      console.error('Error fetching task:', fetchError);
      return null;
    }

    const newCompletedState = !currentTask.is_completed;
    const completedAt = newCompletedState ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        is_completed: newCompletedState,
        completed_at: completedAt,
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling task:', error);
      return null;
    }

    return convertTaskFromDB(data);
  } catch (error) {
    console.error('Error in toggleTaskComplete:', error);
    return null;
  }
};

/**
 * Delete tasks completed more than 24 hours ago
 */
export const cleanupOldCompletedTasks = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }

    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .lt('completed_at', oneDayAgo.toISOString())
      .select();

    if (error) {
      console.error('Error cleaning up tasks:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in cleanupOldCompletedTasks:', error);
    return 0;
  }
};

/**
 * Get tasks by quadrant
 */
export const getTasksByQuadrant = async (quadrant: number) => {
  try {
    const tasks = await getAllTasks();
    
    const quadrantTasks = tasks.filter((task: any) => {
      const taskQuadrant = calculateQuadrant(task.difficulty, task.importance);
      return taskQuadrant === quadrant;
    });

    // Sort by due date
    quadrantTasks.sort((a: any, b: any) => {
      const dateA = new Date(`${a.dueDate} ${a.dueTime}`);
      const dateB = new Date(`${b.dueDate} ${b.dueTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    return quadrantTasks;
  } catch (error) {
    console.error('Error in getTasksByQuadrant:', error);
    return [];
  }
};

/**
 * Get all tasks sorted by due date
 */
export const getTasksSortedByDate = async () => {
  try {
    const tasks = await getAllTasks();
    
    tasks.sort((a: any, b: any) => {
      const dateA = new Date(`${a.dueDate} ${a.dueTime}`);
      const dateB = new Date(`${b.dueDate} ${b.dueTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    return tasks;
  } catch (error) {
    console.error('Error in getTasksSortedByDate:', error);
    return [];
  }
};