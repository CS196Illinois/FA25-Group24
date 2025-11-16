import DateTimePicker from "@react-native-community/datetimepicker";
import {
  addDays,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const taskColors = ["#ffb98b", "#6db2f5", "#7bd192", "#e88a8a"];

type Task = {
  title: string;
  date: Date;
  color: string;
  startTime: Date;
  endTime: Date;
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    title: "",
    date: new Date(),
    color: taskColors[0],
    startTime: new Date(),
    endTime: new Date(),
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    setTasks([...tasks, newTask]);
    setModalVisible(false);
    setNewTask({
      title: "",
      date: new Date(),
      color: taskColors[0],
      startTime: new Date(),
      endTime: new Date(),
    });
  };

  const renderMonthlyView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows: React.ReactNode[] = [];
    let days: React.ReactNode[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayTasks = tasks.filter((t) => isSameDay(t.date, cloneDay));

        days.push(
          <TouchableOpacity
            key={day.toString()}
            onPress={() => setSelectedDate(cloneDay)}
            style={{
              flex: 1,
              alignItems: "center",
              padding: 5,
              borderWidth: 0.5,
              borderColor: "#ccc",
              backgroundColor: isSameMonth(day, monthStart) ? "white" : "#f0f0f0",
              margin: 1,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: isSameDay(day, selectedDate) ? "bold" : "normal",
                color: isSameDay(day, selectedDate) ? "blue" : "black",
              }}
            >
              {format(day, "d")}
            </Text>

            {dayTasks.map((task, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: task.color,
                  borderRadius: 4,
                  paddingHorizontal: 2,
                  paddingVertical: 1,
                  marginTop: 2,
                  width: "90%",
                }}
              >
                <Text style={{ color: "white", fontSize: 10 }} numberOfLines={1}>
                  {task.title}
                </Text>
              </View>
            ))}
          </TouchableOpacity>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <View key={day.toString()} style={{ flexDirection: "row" }}>
          {days}
        </View>
      );
      days = [];
    }

    return <View style={{ padding: 5 }}>{rows}</View>;
  };

  const renderWeeklyView = () => {
    const startOfCurrentWeek = startOfWeek(selectedDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

    return (
      <ScrollView style={{ padding: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <TouchableOpacity onPress={() => setSelectedDate(subWeeks(selectedDate, 1))}>
            <Text style={{ color: "blue", fontSize: 18 }}>◀</Text>
          </TouchableOpacity>

          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            Week of {format(startOfCurrentWeek, "MM/dd/yyyy")}
          </Text>

          <TouchableOpacity onPress={() => setSelectedDate(addWeeks(selectedDate, 1))}>
            <Text style={{ color: "blue", fontSize: 18 }}>▶</Text>
          </TouchableOpacity>
        </View>

        {days.map((day) => {
          const dayTasks = tasks.filter((t) => isSameDay(t.date, day));
          return (
            <View key={day.toString()} style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                {format(day, "EEEE MM/dd/yyyy")}
              </Text>

              {dayTasks.length > 0 ? (
                dayTasks.map((task, idx) => (
                  <View
                    key={idx}
                    style={{ backgroundColor: task.color, padding: 6, borderRadius: 6, marginBottom: 3 }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>{task.title}</Text>
                    <Text style={{ color: "white", fontSize: 12 }}>
                      {format(task.startTime, "hh:mm a")} - {format(task.endTime, "hh:mm a")}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: "#888", fontSize: 12 }}>No tasks</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 10 }}>
        <TouchableOpacity onPress={() => setViewMode("weekly")}>
          <Text style={{ fontWeight: "bold", color: viewMode === "weekly" ? "blue" : "gray" }}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode("monthly")}>
          <Text style={{ fontWeight: "bold", color: viewMode === "monthly" ? "blue" : "gray" }}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={{ fontWeight: "bold", color: "green" }}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {viewMode === "weekly" ? renderWeeklyView() : renderMonthlyView()}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <View style={{ backgroundColor: "white", marginHorizontal: 20, padding: 15, borderRadius: 12 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>Add Task</Text>

            <TextInput
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6, marginBottom: 10 }}
            />

            <Text style={{ fontWeight: "600" }}>Select Color:</Text>
            <View style={{ flexDirection: "row", marginVertical: 8 }}>
              {taskColors.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setNewTask({ ...newTask, color: c })}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    marginRight: 10,
                    backgroundColor: c,
                    borderWidth: newTask.color === c ? 2 : 0,
                    borderColor: "black",
                  }}
                />
              ))}
            </View>

            <Text style={{ fontWeight: "600" }}>Start Time:</Text>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              style={{ padding: 6, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginBottom: 8 }}
            >
              <Text>{format(newTask.startTime, "hh:mm a")}</Text>
            </TouchableOpacity>

            <Text style={{ fontWeight: "600" }}>End Time:</Text>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              style={{ padding: 6, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginBottom: 10 }}
            >
              <Text>{format(newTask.endTime, "hh:mm a")}</Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={newTask.startTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "spinner"}
                onChange={(_, time) => {
                  setShowStartPicker(false);
                  if (time) setNewTask({ ...newTask, startTime: time });
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={newTask.endTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "spinner"}
                onChange={(_, time) => {
                  setShowEndPicker(false);
                  if (time) setNewTask({ ...newTask, endTime: time });
                }}
              />
            )}

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight: 15 }}>
                <Text style={{ color: "#555", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddTask}>
                <Text style={{ color: "blue", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
