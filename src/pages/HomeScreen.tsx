import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, ScrollView, SafeAreaView } from 'react-native';
import NewTask from './NewTask';
import { colors } from '../constants/colors';

export type Task = {
  name: string;
  description?: string;
  dueDate?: string;
  quadrant: 'doNow' | 'scheduleNow' | 'keepInMind' | 'eliminate';
};

type HomeScreenProps = {
  tasks: Task[];
  addTask?: (task: Task) => void;
};

export default function HomeScreen({ tasks: initialTasks, addTask }: HomeScreenProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [showNewTask, setShowNewTask] = useState(false);
  const [currentQuadrant, setCurrentQuadrant] = useState<Task['quadrant']>('doNow');
  const [selectedQuadrant, setSelectedQuadrant] = useState<Task['quadrant'] | null>(null);

  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    addTask?.(task);
    setShowNewTask(false);
  };

  const quadrants: { key: Task['quadrant']; title: string; subtitle: string; color: string }[] = [
    { key: 'doNow', title: 'Do Now', subtitle: 'Important and Urgent', color: colors.doNow },
    { key: 'scheduleNow', title: 'Schedule', subtitle: 'Important, but not Urgent', color: colors.scheduleNow },
    { key: 'keepInMind', title: 'Keep in Mind', subtitle: 'Urgent, but not Important', color: colors.keepInMind },
    { key: 'eliminate', title: 'Eliminate', subtitle: 'Not Urgent or Important', color: colors.eliminate },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {selectedQuadrant === null && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Pressable style={styles.profileButton} onPress={() => {/* Handle profile press */}}>
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.content}>
        {quadrants.map(q => (
          (!selectedQuadrant || selectedQuadrant === q.key) && (
            <Pressable
              key={q.key}
              style={[
                styles.quadrant,
                { backgroundColor: q.color },
                selectedQuadrant === q.key && styles.quadrantExpanded
              ]}
              onPress={() => selectedQuadrant !== q.key && setSelectedQuadrant(q.key)}
              disabled={selectedQuadrant === q.key}
            >
              {selectedQuadrant === q.key ? (
                <View style={styles.expandedContainer}>
                  <View style={styles.expandedHeader}>
                    <Pressable onPress={() => setSelectedQuadrant(null)}>
                      <Text style={styles.backButtonText}>← Back</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setCurrentQuadrant(q.key);
                        setShowNewTask(true);
                      }}
                    >
                      <Text style={styles.addButtonText}>+</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.expandedTitle}>{q.title}</Text>
                  <Text style={styles.expandedSubtitle}>{q.subtitle}</Text>

                  <ScrollView style={styles.expandedTaskList} showsVerticalScrollIndicator={true}>
                    {tasks.filter(t => t.quadrant === q.key).length === 0 ? (
                      <Text style={styles.emptyTextExpanded}>No tasks yet</Text>
                    ) : (
                      tasks.filter(t => t.quadrant === q.key).map((item, idx) => (
                        <View key={idx}>
                          <View style={styles.expandedTaskItem}>
                            <Text style={styles.expandedTaskName}>{item.name}</Text>
                            {item.description && (
                              <Text style={styles.expandedTaskDescription}>{item.description}</Text>
                            )}
                            {item.dueDate && (
                              <Text style={styles.expandedTaskDetail}>• Due Date: {item.dueDate}</Text>
                            )}
                          </View>
                          {idx < tasks.filter(t => t.quadrant === q.key).length - 1 && (
                            <View style={styles.taskDivider} />
                          )}
                        </View>
                      ))
                    )}
                  </ScrollView>
                </View>
              ) : (
                <>
                  <Text style={styles.quadrantTitle}>{q.title}</Text>
                  <Text style={styles.quadrantSubtitle}>{q.subtitle}</Text>

                  <View style={styles.taskList}>
                    {tasks.filter(t => t.quadrant === q.key).slice(0, 3).map((item, idx) => (
                      <View key={idx} style={styles.taskRow}>
                        <Text style={styles.taskText} numberOfLines={1}>
                          • {item.name}
                        </Text>
                        {item.dueDate && (
                          <Text style={styles.taskDate}>{item.dueDate}</Text>
                        )}
                      </View>
                    ))}
                    {tasks.filter(t => t.quadrant === q.key).length === 0 && (
                      <Text style={styles.emptyTextCompact}>No tasks yet</Text>
                    )}
                  </View>
                </>
              )}
            </Pressable>
          )
        ))}
      </View>

      <Modal visible={showNewTask} animationType="slide" presentationStyle="pageSheet">
        <NewTask
          defaultQuadrant={currentQuadrant}
          addTask={handleAddTask}
          onClose={() => setShowNewTask(false)}
        />
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
  profileButton: {
    backgroundColor: colors.surface,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  profileIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  quadrant: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    flex: 1,
    marginVertical: 6,
  },
  quadrantExpanded: {
    flex: 1,
    padding: 0,
    marginVertical: 0,
  },
  expandedContainer: {
    flex: 1,
    padding: 20,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  expandedTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  expandedSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: '600',
    opacity: 0.9,
  },
  expandedTaskList: {
    flex: 1,
  },
  expandedTaskItem: {
    paddingVertical: 12,
  },
  expandedTaskName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  expandedTaskDescription: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.95,
  },
  expandedTaskDetail: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    marginBottom: 3,
    opacity: 0.9,
  },
  taskDivider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    marginVertical: 12,
  },
  emptyTextExpanded: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.7,
  },
  quadrantTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quadrantSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  taskList: {
    gap: 6,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  taskText: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '500',
  },
  taskDate: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 10,
    opacity: 0.9,
  },
  emptyTextCompact: {
    fontSize: 13,
    color: '#FFFFFF',
    fontStyle: 'italic',
    opacity: 0.7,
  },
});