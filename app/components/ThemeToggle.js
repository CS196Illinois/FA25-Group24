import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * ThemeToggle Component
 * A button to toggle between light and dark themes
 */
export default function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.profileButton, shadowColor: colors.shadow }]}
      onPress={toggleTheme}
    >
      <Ionicons
        name={theme === 'light' ? 'moon' : 'sunny'}
        size={24}
        color={theme === 'light' ? '#000' : '#fff'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
  },
});
