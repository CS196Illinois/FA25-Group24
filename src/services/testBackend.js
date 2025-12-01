import { addTask, getAllTasks, updateTask, deleteTask, toggleTaskComplete, getTasksByQuadrant } from './taskService';

/**
 * Test function to verify backend works
 */
export const testBackend = async () => {
  console.log('=== TESTING BACKEND ===\n');

  try {
    // Test 1: Add a task
    console.log('Test 1: Adding a task...');
    const newTask = await addTask({
      name: 'Study for ECE 120',
      description: 'Review LC-3 assembly',
      dueDate: '2025-12-05',
      dueTime: '14:00',
      importance: 5,
      difficulty: 4
    });
    console.log('✅ Task added:', newTask.name);
    console.log('   ID:', newTask.id);

    // Test 2: Get all tasks
    console.log('\nTest 2: Getting all tasks...');
    const allTasks = await getAllTasks();
    console.log('✅ Total tasks:', allTasks.length);

    // Test 3: Update the task
    console.log('\nTest 3: Updating task...');
    const updated = await updateTask(newTask.id, {
      importance: 4
    });
    console.log('✅ Task updated. New importance:', updated.importance);

    // Test 4: Get tasks by quadrant
    console.log('\nTest 4: Getting Quadrant 1 tasks...');
    const q1Tasks = await getTasksByQuadrant(1);
    console.log('✅ Quadrant 1 tasks:', q1Tasks.length);

    // Test 5: Toggle completion
    console.log('\nTest 5: Marking task complete...');
    const completed = await toggleTaskComplete(newTask.id);
    console.log('✅ Task completed:', completed.isCompleted);

    // Test 6: Delete the task
    console.log('\nTest 6: Deleting task...');
    await deleteTask(newTask.id);
    const remainingTasks = await getAllTasks();
    console.log('✅ Task deleted. Remaining tasks:', remainingTasks.length);

    console.log('\n=== ALL TESTS PASSED! ===');
    return true;

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return false;
  }
};