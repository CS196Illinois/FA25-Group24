# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StickerSmash is a React Native mobile application built with Expo. It uses Expo Router for file-based routing and supports iOS, Android, and web platforms.

## Technology Stack

- **Framework**: Expo ~54.0.20 with React Native 0.81.5
- **React**: 19.1.0
- **Routing**: Expo Router ~6.0.13 (file-based routing)
- **Language**: TypeScript 5.9.2 with strict mode enabled
- **Navigation**: React Navigation with bottom tabs support
- **Animations**: react-native-reanimated ~4.1.1 with worklets support
- **Gestures**: react-native-gesture-handler ~2.28.0

## Development Commands

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npx expo start
# or
npm start
```

Platform-specific starts:
```bash
npm run android  # Start on Android emulator
npm run ios      # Start on iOS simulator
npm run web      # Start web version
```

Lint code:
```bash
npm run lint
```

Reset project (moves starter code to app-example and creates blank app directory):
```bash
npm run reset-project
```

## Architecture

### File-Based Routing

The app uses Expo Router with file-based routing. Routes are defined by the file structure in the `app/` directory:
- `app/_layout.tsx` - Root layout component using Stack navigator
- `app/index.tsx` - Home screen (main entry point)
- `app/components/` - Reusable React components

### Configuration

- **Expo Config** (`app.json`): Defines app metadata, splash screen, icons, and platform-specific settings
  - New Architecture enabled (`newArchEnabled: true`)
  - Typed routes enabled (`experiments.typedRoutes: true`)
  - React Compiler enabled (`experiments.reactCompiler: true`)
  - Edge-to-edge display on Android

- **TypeScript** (`tsconfig.json`): Extends Expo's base config with strict mode
  - Path alias `@/*` configured to reference project root

### Project Structure

```
StickerSmash/
├── app/                  # Application code (file-based routing)
│   ├── _layout.tsx      # Root layout with Stack navigator
│   ├── index.tsx        # Home screen
│   └── components/      # Reusable components
├── assets/              # Static assets (images, fonts)
│   └── images/         # App icons, splash screens
└── node_modules/       # Dependencies
```

## Key Features

- Cross-platform support (iOS, Android, Web)
- Automatic light/dark mode support (`userInterfaceStyle: "automatic"`)
- Static web output (`web.output: "static"`)
- Gesture handling with react-native-gesture-handler
- Smooth animations with Reanimated
- Safe area handling for modern devices

## Enabling the Box Component to Handle Task Information

This section documents the changes made to transform the Box component from a single-input field to a task management system with bulleted lists.

### 1. Import Changes

**Change**: Added `Text`, `TouchableOpacity`, and `FlatList` to imports
```javascript
// Old
import { View, TextInput, StyleSheet } from 'react-native';

// New
import { View, TextInput, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
```

**Rationale**:
- `Text`: Required to display bullet points, task text, and empty state messages
- `TouchableOpacity`: Provides interactive buttons (add task "+" and delete task "×") with touch feedback
- `FlatList`: Efficiently renders a scrollable list of tasks with performance optimization for large lists

### 2. State Management Changes

**Change**: Replaced single text state with tasks array and currentText
```javascript
// Old
const [text, setText] = useState('');

// New
const [tasks, setTasks] = useState([]);
const [currentText, setCurrentText] = useState('');
```

**Rationale**:
- `tasks`: Array stores multiple task objects, each with a unique `id` and `text` property, enabling management of multiple tasks per box
- `currentText`: Separates the input field state from the stored tasks, allowing users to type without modifying the task list until they explicitly add it
- This separation enables proper form submission behavior (clear input after adding task)

### 3. Task Management Functions

**Change**: Added `addTask()` and `removeTask()` functions

**addTask() Function**:
```javascript
const addTask = () => {
  if (currentText.trim() !== '') {
    setTasks([...tasks, { id: Date.now().toString(), text: currentText }]);
    setCurrentText('');
  }
};
```

**Rationale**:
- Validates input using `trim()` to prevent empty or whitespace-only tasks
- Uses `Date.now()` for unique task IDs, ensuring each task can be individually identified and removed
- Spreads existing tasks `[...tasks]` to maintain immutability (React best practice)
- Clears input field after adding for better UX

**removeTask() Function**:
```javascript
const removeTask = (taskId) => {
  setTasks(tasks.filter(task => task.id !== taskId));
};
```

**Rationale**:
- Uses `filter()` to create new array without the removed task (immutable update pattern)
- Accepts `taskId` parameter for precise task removal without affecting other tasks
- Provides users ability to delete completed or incorrect tasks

### 4. UI Structure Changes

**Change**: Replaced single TextInput with input container + task list layout

**Input Container**:
```javascript
<View style={styles.inputContainer}>
  <TextInput
    style={styles.input}
    placeholder="Type a task..."
    placeholderTextColor="#999"
    value={currentText}
    onChangeText={setCurrentText}
    onSubmitEditing={addTask}
    returnKeyType="done"
  />
  <TouchableOpacity style={styles.addButton} onPress={addTask}>
    <Text style={styles.addButtonText}>+</Text>
  </TouchableOpacity>
</View>
```

**Rationale**:
- Horizontal layout (`flexDirection: 'row'`) places input and button side-by-side
- `onSubmitEditing={addTask}`: Allows keyboard "Enter/Done" key to add tasks (mobile-friendly)
- `returnKeyType="done"`: Shows appropriate keyboard button on mobile devices
- Visual "+" button provides clear affordance for adding tasks, accessible for users who may not know keyboard shortcuts

**Task List with FlatList**:
```javascript
<FlatList
  data={tasks}
  keyExtractor={(item) => item.id}
  style={styles.taskList}
  renderItem={({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.taskText}>{item.text}</Text>
      <TouchableOpacity onPress={() => removeTask(item.id)}>
        <Text style={styles.deleteButton}>×</Text>
      </TouchableOpacity>
    </View>
  )}
  ListEmptyComponent={
    <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
  }
/>
```

**Rationale**:
- `FlatList` chosen over `map()` for performance optimization (lazy loading, recycling views)
- `keyExtractor`: Uses unique `id` for React's reconciliation algorithm
- Each task displays: bullet (•), task text, delete button (×) in horizontal layout
- `ListEmptyComponent`: Provides helpful feedback when no tasks exist, improving user understanding
- Delete button per task enables granular task management

### 5. Styling Changes

**Box Style Changes**:
```javascript
// Old
box: {
  width: 300,
  height: 100,
  margin: 5,
  borderRadius: 8,
  padding: 20,
  justifyContent: 'center',
}

// New
box: {
  width: 300,
  minHeight: 150,
  maxHeight: 300,
  margin: 5,
  borderRadius: 8,
  padding: 15,
}
```

**Rationale**:
- Replaced fixed `height: 100` with `minHeight: 150` and `maxHeight: 300` for dynamic sizing
- Allows box to grow as tasks are added (up to max height)
- Prevents box from being too small for input + tasks
- `maxHeight` prevents overflow and ensures FlatList scrolling activates
- Reduced padding from 20 to 15 to accommodate more content

**New Styles Added**:
- `inputContainer`: Horizontal layout for input + button
- `addButton`: Circular button (35×35px) with semi-transparent background
- `taskItem`: Horizontal layout aligning bullet, text, and delete button
- `bullet`: Large white bullet point (•) with right margin
- `taskText`: Flexible text that wraps, takes remaining space
- `deleteButton`: Large "×" symbol with reduced opacity for subtle appearance
- `emptyText`: Italicized, semi-transparent text for empty state

**Rationale for Semi-Transparent Backgrounds**:
- `backgroundColor: 'rgba(255, 255, 255, 0.2)'` for input
- `backgroundColor: 'rgba(255, 255, 255, 0.3)'` for button
- Maintains visibility against colored box backgrounds (red, green, blue, purple)
- Provides visual hierarchy while preserving the colored box aesthetic

### Summary of Changes

The Box component evolved from a simple text input to a full task management system:
1. **Multi-task support**: Store and display multiple tasks per box
2. **CRUD operations**: Create (add), Read (display), Delete tasks
3. **Improved UX**: Keyboard submission, visual buttons, empty states
4. **Performance**: FlatList for efficient rendering
5. **Responsive design**: Dynamic height based on content
6. **Visual clarity**: Bullet points clearly indicate list structure matching productivity app requirements
