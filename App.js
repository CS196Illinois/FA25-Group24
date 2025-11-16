import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import NewTask from './screens/NewTask';

export default function App() {
  return (
    <View style={styles.container}>
      <NewTask />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});