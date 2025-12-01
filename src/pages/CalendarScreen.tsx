import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../constants/colors';
import { calculateQuadrant } from '../utils/eisenhowerUtils';

interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  dueTime: string;
  importance: number;
  difficulty: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface CalendarScreenProps {
  tasks: Task[];
  onNavigateToNewTask: () => void;
}

export default function CalendarScreen({ tasks, onNavigateToNewTask }: CalendarScreenProps) {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasksByDate, setTasksByDate] = useState<{[key: string]: Task[]}>({});

  useEffect(() => {
    organizeTasksByDate();
  }, [tasks]);

  const organizeTasksByDate = () => {
    const organized: {[key: string]: Task[]} = {};
    
    tasks.forEach(task => {
      const dateKey = task.dueDate;
      if (!organized[dateKey]) {
        organized[dateKey] = [];
      }
      organized[dateKey].push(task);
    });

    // Sort tasks within each date by time
    Object.keys(organized).forEach(dateKey => {
      organized[dateKey].sort((a, b) => {
        return a.dueTime.localeCompare(b.dueTime);
      });
    });

    setTasksByDate(organized);
  };

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Days to show before first day (to fill the week)
    const startPadding = firstDay.getDay();
    
    // Total days to show
    const daysInMonth = lastDay.getDate();
    const totalDays = startPadding + daysInMonth;
    const weeksNeeded = Math.ceil(totalDays / 7);
    
    const days = [];
    
    // Add padding days from previous month
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Add padding days from next month
    const remainingDays = (weeksNeeded * 7) - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName} ${month}/${day}/${year}`;
  };

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatMonthYear = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getWeekLabel = () => {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - start.getDay());
    const month = (start.getMonth() + 1).toString().padStart(2, '0');
    const day = start.getDate().toString().padStart(2, '0');
    const year = start.getFullYear();
    return `Week of ${month}/${day}/${year}`;
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const getQuadrantColor = (task: Task) => {
    const quadrant = calculateQuadrant(task.difficulty, task.importance);
    const quadrantColors = {
      1: colors.quadrant1,
      2: colors.quadrant2,
      3: colors.quadrant3,
      4: colors.quadrant4,
    };
    return quadrantColors[quadrant] || colors.border;
  };

  const hasTasksOnDate = (dateKey: string) => {
    return tasksByDate[dateKey] && tasksByDate[dateKey].length > 0;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const renderTask = (task: Task) => (
    <View 
      key={task.id} 
      style={[
        styles.taskItem,
        { borderLeftColor: getQuadrantColor(task) },
        task.isCompleted && styles.taskCompleted
      ]}
    >
      <Text style={[styles.taskTime, task.isCompleted && styles.taskTextCompleted]}>
        {task.dueTime}
      </Text>
      <Text style={[styles.taskName, task.isCompleted && styles.taskTextCompleted]}>
        {task.name}
      </Text>
    </View>
  );

  const renderWeeklyView = () => {
    const weekDates = getWeekDates();

    return (
      <>
        <View style={styles.weekNavigation}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.navArrow}>
            <Text style={styles.navArrowText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.weekLabel}>{getWeekLabel()}</Text>
          <TouchableOpacity onPress={goToNextWeek} style={styles.navArrow}>
            <Text style={styles.navArrowText}>▶</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {weekDates.map((date, index) => {
            const dateKey = formatDateKey(date);
            const tasksForDate = tasksByDate[dateKey] || [];

            return (
              <View key={index} style={styles.dayContainer}>
                <Text style={styles.dayLabel}>{formatDate(date)}</Text>
                
                {tasksForDate.length === 0 ? (
                  <Text style={styles.noEvents}>No events</Text>
                ) : (
                  <View style={styles.tasksList}>
                    {tasksForDate.map(task => renderTask(task))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </>
    );
  };

  const renderMonthlyView = () => {
    const monthDays = getMonthDays();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <>
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navArrow}>
            <Text style={styles.navArrowText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{formatMonthYear(currentMonth)}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navArrow}>
            <Text style={styles.navArrowText}>▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.monthContainer}>
          {/* Day names header */}
          <View style={styles.dayNamesRow}>
            {dayNames.map((name, index) => (
              <View key={index} style={styles.dayNameCell}>
                <Text style={styles.dayNameText}>{name}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.monthGrid}>
            {monthDays.map((dayInfo, index) => {
              const dateKey = formatDateKey(dayInfo.date);
              const hasTasks = hasTasksOnDate(dateKey);
              const today = isToday(dayInfo.date);

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.monthDayCell}
                  onPress={() => setSelectedDate(dateKey)}
                >
                  <View style={[
                    styles.monthDayContent,
                    today && styles.monthDayToday,
                    selectedDate === dateKey && styles.monthDaySelected,
                  ]}>
                    <Text style={[
                      styles.monthDayNumber,
                      !dayInfo.isCurrentMonth && styles.monthDayNumberOther,
                      today && styles.monthDayNumberToday,
                      selectedDate === dateKey && styles.monthDayNumberSelected,
                    ]}>
                      {dayInfo.date.getDate()}
                    </Text>
                    {hasTasks && (
                      <View style={styles.taskDots}>
                        {tasksByDate[dateKey].slice(0, 3).map((task, i) => (
                          <View
                            key={i}
                            style={[
                              styles.taskDot,
                              { backgroundColor: getQuadrantColor(task) }
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected date tasks */}
          {selectedDate && tasksByDate[selectedDate] && (
            <View style={styles.selectedDateTasks}>
              <View style={styles.selectedDateHeader}>
                <Text style={styles.selectedDateTitle}>
                  {formatDate(new Date(selectedDate))}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDate(null)}>
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.selectedTasksList}>
                {tasksByDate[selectedDate].map(task => renderTask(task))}
              </ScrollView>
            </View>
          )}
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity onPress={onNavigateToNewTask}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'weekly' && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode('weekly')}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === 'weekly' && styles.viewModeTextActive,
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'monthly' && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode('monthly')}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === 'monthly' && styles.viewModeTextActive,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'weekly' ? renderWeeklyView() : renderMonthlyView()}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  viewModeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
  },
  viewModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  viewModeTextActive: {
    color: 'white',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  navArrow: {
    padding: 8,
  },
  navArrowText: {
    fontSize: 20,
    color: colors.primary,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dayContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  noEvents: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  tasksList: {
    gap: 8,
  },
  taskItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskCompleted: {
    opacity: 0.5,
  },
  taskTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 60,
  },
  taskName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  // Monthly View Styles
  monthContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    padding: 2,
  },
  monthDayContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  monthDayToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  monthDaySelected: {
    backgroundColor: colors.primary,
  },
  monthDayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  monthDayNumberOther: {
    color: colors.textSecondary,
    opacity: 0.4,
  },
  monthDayNumberToday: {
    color: colors.primary,
  },
  monthDayNumberSelected: {
    color: 'white',
  },
  taskDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedDateTasks: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  selectedTasksList: {
    maxHeight: 200,
  },
});