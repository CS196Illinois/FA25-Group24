import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>

        {/* Do Now - Important and Urgent */}
        {(!selectedQuadrant || selectedQuadrant === 'doNow') && (
        <TouchableOpacity
          style={[styles.quadrant, styles.doNow, selectedQuadrant === 'doNow' && styles.quadrantExpanded]}
          onPress={() => selectedQuadrant !== 'doNow' && setSelectedQuadrant('doNow')}
          activeOpacity={0.9}
          disabled={selectedQuadrant === 'doNow'}
          >
          {selectedQuadrant === 'doNow' ? (
            <>
              <View style={styles.expandedContainer}>
                <View style={styles.expandedHeader}>
                  <TouchableOpacity
                    onPress={() => setSelectedQuadrant(null)}
                  >
                    <Text style={styles.backButtonText}>{"< Back"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.menuButtonText}>• • •</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.expandedTitle}>Do Now.</Text>
                <Text style={styles.expandedSubtitle}>Important and Urgent.</Text>

              <ScrollView style={styles.expandedTaskList} showsVerticalScrollIndicator={true}>
                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
              </ScrollView>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.quadrantTitle}>Do Now.</Text>
              <Text style={styles.quadrantSubtitle}>Important and Urgent.</Text>

              <View style={styles.taskList}>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
        )}

        {/* Schedule Now - Important, but not Urgent */}
        {(!selectedQuadrant || selectedQuadrant === 'scheduleNow') && (
        <TouchableOpacity
          style={[styles.quadrant, styles.scheduleNow, selectedQuadrant === 'scheduleNow' && styles.quadrantExpanded]}
          onPress={() => selectedQuadrant !== 'scheduleNow' && setSelectedQuadrant('scheduleNow')}
          activeOpacity={0.9}
          disabled={selectedQuadrant === 'scheduleNow'}
          >
          {selectedQuadrant === 'scheduleNow' ? (
            <>
              <View style={styles.expandedContainer}>
                <View style={styles.expandedHeader}>
                  <TouchableOpacity
                    onPress={() => setSelectedQuadrant(null)}
                  >
                    <Text style={styles.backButtonText}>{"< Back"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.menuButtonText}>• • •</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.expandedTitle}>Schedule Now.</Text>
                <Text style={styles.expandedSubtitle}>Important, but not Urgent.</Text>

              <ScrollView style={styles.expandedTaskList} showsVerticalScrollIndicator={true}>
                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
              </ScrollView>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.quadrantTitle}>Schedule Now.</Text>
              <Text style={styles.quadrantSubtitle}>Important, but not Urgent.</Text>

              <View style={styles.taskList}>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
        )}

        {/* Keep This In Mind - Urgent, but not Important */}
        {(!selectedQuadrant || selectedQuadrant === 'keepInMind') && (
        <TouchableOpacity
          style={[styles.quadrant, styles.keepInMind, selectedQuadrant === 'keepInMind' && styles.quadrantExpanded]}
          onPress={() => selectedQuadrant !== 'keepInMind' && setSelectedQuadrant('keepInMind')}
          activeOpacity={0.9}
          disabled={selectedQuadrant === 'keepInMind'}
          >
          {selectedQuadrant === 'keepInMind' ? (
            <>
              <View style={styles.expandedContainer}>
                <View style={styles.expandedHeader}>
                  <TouchableOpacity
                    onPress={() => setSelectedQuadrant(null)}
                  >
                    <Text style={styles.backButtonText}>{"< Back"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.menuButtonText}>• • •</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.expandedTitle}>Keep This In Mind.</Text>
                <Text style={styles.expandedSubtitle}>Urgent, but not Important.</Text>

              <ScrollView style={styles.expandedTaskList} showsVerticalScrollIndicator={true}>
                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
              </ScrollView>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.quadrantTitle}>Keep This In Mind.</Text>
              <Text style={styles.quadrantSubtitle}>Urgent, but not Important.</Text>

              <View style={styles.taskList}>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
        )}

        {/* Eliminate This - Not Urgent or Important */}
        {(!selectedQuadrant || selectedQuadrant === 'eliminate') && (
        <TouchableOpacity
          style={[styles.quadrant, styles.eliminate, selectedQuadrant === 'eliminate' && styles.quadrantExpanded]}
          onPress={() => selectedQuadrant !== 'eliminate' && setSelectedQuadrant('eliminate')}
          activeOpacity={0.9}
          disabled={selectedQuadrant === 'eliminate'}
          >
          {selectedQuadrant === 'eliminate' ? (
            <>
              <View style={styles.expandedContainer}>
                <View style={styles.expandedHeader}>
                  <TouchableOpacity
                    onPress={() => setSelectedQuadrant(null)}
                  >
                    <Text style={styles.backButtonText}>{"< Back"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.menuButtonText}>• • •</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.expandedTitle}>Eliminate This.</Text>
                <Text style={styles.expandedSubtitle}>Not Urgent or Important.</Text>

              <ScrollView style={styles.expandedTaskList} showsVerticalScrollIndicator={true}>
                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskDivider} />

                <View style={styles.expandedTaskItem}>
                  <Text style={styles.expandedTaskName}>Task Name</Text>
                  <Text style={styles.expandedTaskDescription}>Task Description</Text>
                  <Text style={styles.expandedTaskDetail}>• Time Required: XX</Text>
                  <Text style={styles.expandedTaskDetail}>• Due Date: XX/XX/XXXX</Text>
                </View>
              </ScrollView>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.quadrantTitle}>Eliminate This.</Text>
              <Text style={styles.quadrantSubtitle}>Not Urgent or Important.</Text>

              <View style={styles.taskList}>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
                <View style={styles.taskRow}>
                  <Text style={styles.taskText}>• Task Name: Task Description</Text>
                  <Text style={styles.taskDate}>XX/XX/XXXX</Text>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
        )}

      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.navIcon}>
          <Text style={styles.navIconText}>?</Text>
        </View>
        <View style={styles.navIcon}>
          <Text style={styles.navIconText}>⊞</Text>
        </View>
        <View style={styles.navIcon}>
          <Text style={styles.navIconText}>⌂</Text>
        </View>
        <View style={styles.navIcon}>
          <Text style={styles.navIconText}>⏱</Text>
        </View>
        <View style={styles.navIcon}>
          <Text style={styles.navIconText}>+</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },
  quadrant: {
    borderRadius: 3,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    flex: 1,
    marginVertical: 5,
  },
  quadrantExpanded: {
    flex: 1,
    padding: 0,
  },
  expandedContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    marginTop: -5
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'normal',
  },
  menuButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'normal',
  },
  expandedTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    marginTop: -15
  },
  expandedSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  expandedTaskList: {
    flex: 1,
  },
  expandedTaskItem: {
    paddingVertical: 15,
  },
  expandedTaskName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  expandedTaskDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  expandedTaskDetail: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    marginBottom: 3,
  },
  taskDivider: {
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    marginVertical: 10,
    marginHorizontal: 8
  },
  doNow: {
    backgroundColor: '#7bd192',
  },
  scheduleNow: {
    backgroundColor: '#6CB2F4',
  },
  keepInMind: {
    backgroundColor: '#FFB98B',
  },
  eliminate: {
    backgroundColor: '#E78A8A',
  },
  quadrantTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  quadrantSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: 'bold'
  },
  taskList: {
    gap: 6,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
  taskDate: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    paddingVertical: 15,
    paddingBottom: 30,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  navIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconText: {
    fontSize: 32,
    color: '#000000',
    fontWeight: 'bold',
  },
  backButtonDoNow: {
    backgroundColor: '#41754f',
  },
  backButtonScheduleNow: {
    backgroundColor: '#6CB2F4',
  },
  backButtonKeepInMind: {
    backgroundColor: '#FFB98B',
  },
  backButtonEliminate: {
    backgroundColor: '#E78A8A',
  },
});
