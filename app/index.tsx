// Import necessary components from React Native
import { Text, View, StyleSheet, ScrollView } from "react-native";
// Import our custom Box component
import Box from "./components/Box";
import ProfileButton from "./components/ProfileButton";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Index Component - Home Screen
 * This is the main screen that displays 4 colored boxes
 * Each box allows users to type text into it
 */
export default function Index() {
  const { colors } = useTheme();

  return (
    // ScrollView allows the content to scroll if it doesn't fit on the screen
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Main container that holds all our content */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Profile button at the top left */}
        <View style={styles.profileButtonContainer}>
          <ProfileButton onPress={() => console.log("Profile button pressed")} />
        </View>

        {/* Theme toggle button at the top right */}
        <View style={styles.themeToggleContainer}>
          <ThemeToggle />
        </View>

        {/* Title text at the top of the screen */}
        <Text style={[styles.text, { color: colors.text }]}>Actions</Text>

        {/* Bright Red Box - Urgent and Important */}
        <Box color={colors.urgentImportant} title="Urgent and Important" />

        {/* Coral Box - Important */}
        <Box color={colors.important} title="Important" />

        {/* Orange Box - Urgent */}
        <Box color={colors.urgent} title="Urgent" />

        {/* Amber Box - To Do */}
        <Box color={colors.toDo} title="To Do" />
      </View>
    </ScrollView>
  );
}

// Define styles for our components
const styles = StyleSheet.create({
  // Style for the ScrollView's content container
  scrollContainer: {
    flexGrow: 1,                // Allows the container to grow to fill available space
  },
  // Style for the main container
  container: {
    flex: 1,                    // Takes up all available space
    justifyContent: "flex-start", // Aligns content to the top
    alignItems: "center",       // Centers content horizontally
    paddingVertical: 10,        // Adds vertical padding (top and bottom)
  },
  // Style for the profile button container
  profileButtonContainer: {
    position: "absolute",       // Position absolutely to place at top left
    top: 10,                    // 10 pixels from the top
    left: 10,                   // 10 pixels from the left
    zIndex: 10,                 // Ensure it appears above other content
  },
  // Style for the theme toggle button container
  themeToggleContainer: {
    position: "absolute",       // Position absolutely to place at top right
    top: 10,                    // 10 pixels from the top
    right: 10,                  // 10 pixels from the right
    zIndex: 10,                 // Ensure it appears above other content
  },
  // Style for the title text
  text: {
    fontSize: 30,               // Large font size
    fontWeight: "bold",         // Makes text bold
    marginBottom: 20,           // Space below the text
  },
});



