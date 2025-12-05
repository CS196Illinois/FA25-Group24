# Claude Context

## Project Overview

This is a React Native project for FA25-Group24.

## Project Structure

- `src/` - Source code directory
  - `pages/auth/` - Authentication screens (Login, Signup)

## Current Status

- Backend integration in progress
- Authentication screens implemented
- Local storage functionality added
- Home screen completed

## Recent Changes

- Backend connected with minor errors to be fixed
- Local storage implementation
- Slides merged
- Home screen added
- Uncommented login and signup authentication code

## Technologies

- React Native
- TypeScript (assumed based on .tsx files)
- Supabase (Authentication backend)

## Notes for Development

- Main branch: `master`
- Modified files include authentication screens and package dependencies

---

## Deep Linking Setup for Email Confirmation

### Problem
Email confirmation links from Supabase open in browser and don't redirect back to the React Native app.

### Solution: Configure Deep Linking ✅ IMPLEMENTED

#### 1. Update `app.json`
Add deep linking configuration:

```json
{
  "expo": {
    "scheme": "testhomescreen",
    "ios": {
      "bundleIdentifier": "com.anushka.testhomescreen",
      "associatedDomains": ["applinks:zndrpbqlrnwzoggimdds.supabase.co"]
    },
    "android": {
      "package": "com.anushka.testhomescreen",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "zndrpbqlrnwzoggimdds.supabase.co",
              "pathPrefix": "/auth/v1/verify"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

#### 2. Update `src/services/supabase.ts`
Change `detectSessionInUrl` to `true`:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Changed from false
  },
});
```

#### 3. Add Deep Link Handler
Create a deep link handler in your main App component to handle auth callbacks:

```typescript
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

// In your App component
useEffect(() => {
  const handleDeepLink = async (event: { url: string }) => {
    const url = event.url;

    // Check if it's an auth callback
    if (url.includes('access_token') || url.includes('type=signup')) {
      // Supabase will automatically handle the session
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        // User is authenticated, navigate to home
        console.log('User authenticated via email confirmation');
      }
    }
  };

  // Listen for deep links
  const subscription = Linking.addEventListener('url', handleDeepLink);

  // Check if app was opened with a deep link
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink({ url });
    }
  });

  return () => {
    subscription.remove();
  };
}, []);
```

#### 4. Supabase Dashboard Configuration
In your Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add redirect URLs:
   - `testhomescreen://` (for app deep link)
   - `https://zndrpbqlrnwzoggimdds.supabase.co/auth/v1/callback` (for web fallback)
3. Set **Site URL** to your production URL or `http://localhost:19006` for development

#### 5. Test the Flow
1. Rebuild your app after making these changes: `npx expo prebuild` (if using bare workflow)
2. Sign up with a new email
3. Click the confirmation link in the email
4. The app should open and authenticate the user automatically

### What Was Implemented

✅ **Installed Dependencies**
- `expo-linking` package installed

✅ **Files Modified**
1. `app.json` - Added deep linking scheme and intent filters
2. `src/services/supabase.ts` - Enabled `detectSessionInUrl: true`
3. `App.tsx` - Added deep link handler with `expo-linking`

### Next Steps - Supabase Dashboard Configuration

⚠️ **Important:** You still need to configure the Supabase Dashboard:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add these redirect URLs:
   - `testhomescreen://` (for app deep link)
   - `https://zndrpbqlrnwzoggimdds.supabase.co/auth/v1/callback` (for web fallback)
4. Set **Site URL** to `http://localhost:19006` for development

### Alternative: Disable Email Confirmation (Development Only)
If you just want to test without email confirmation:
1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Disable **"Confirm email"** option
3. Users can sign up and log in immediately without email verification

---

## Pomodoro Timer Navigation Lock

### Problem
Users could navigate away from the Pomodoro/Focus page while a timer was running, losing their focus session progress.

### Solution: Implement Navigation Lock ✅ IMPLEMENTED

**How it works:**
1. When the Pomodoro timer starts, it notifies the parent App component
2. If user tries to navigate to another tab while timer is running, they see an alert
3. User must pause or complete the timer before leaving the Focus page

**Files Modified:**

1. **src/pages/AboutScreen.tsx**
   - Added `onTimerStateChange` callback prop to notify parent when timer starts/stops
   - Uses `useEffect` to trigger callback whenever `isRunning` state changes

2. **App.tsx**
   - Added `isPomodoroRunning` state to track timer status
   - Created `handleTabChange` function that checks if timer is running before allowing navigation
   - Shows alert "Timer is Running - Please pause or complete your focus session before leaving" if user tries to leave
   - Updated all bottom navigation buttons to use `handleTabChange` instead of directly setting tab
   - Passed `setIsPomodoroRunning` callback to PomodoroScreen component

**Code Markers:**
All new code is marked with `// Shreyas's code` comments for presentation purposes.

---

## Development Login Bypass

### Purpose
Allows developers to skip the login screen during development for faster testing.

### Implementation ✅ IMPLEMENTED

**File Modified:** `App.tsx`

Added a simple development bypass flag:
```typescript
// Development bypass - skip login (set to false to re-enable login)
const DEV_BYPASS_LOGIN = true;
```

**How to use:**
- Set `DEV_BYPASS_LOGIN = true` to skip login and go straight to the app
- Set `DEV_BYPASS_LOGIN = false` to re-enable the login screen

**Note:** This bypasses authentication but doesn't create a real session, so Supabase features that require authentication may not work. This is purely for UI/UX testing without needing to log in each time.

---

## Pomodoro Timer Persistence

### What is AsyncStorage?
AsyncStorage is a React Native library that provides a simple, unencrypted, asynchronous, persistent, key-value storage system. It's the mobile equivalent of web browser's localStorage, but designed for React Native apps.

**Key Features:**
- **Persistent**: Data survives app restarts and remains until explicitly deleted
- **Asynchronous**: Uses Promises/async-await, doesn't block the UI thread
- **Key-Value Store**: Stores data as string key-value pairs (objects must be JSON.stringify'd)
- **Cross-Platform**: Works on both iOS and Android
- **Global**: Data stored in AsyncStorage is accessible from anywhere in the app

**Common Use Cases:**
- User preferences and settings
- Authentication tokens (as used by Supabase in this project)
- Timer state (as implemented in Pomodoro feature)
- Cached data that should persist between sessions
- Application state that needs to survive app restarts

### Problem
When users navigate away from the Pomodoro page or close the app, their timer progress is lost, causing frustration if they accidentally leave mid-session.

### Solution: Timer State Persistence ✅ IMPLEMENTED

**How it works:**
1. Timer state (time remaining, whether it's running, work/break mode, selected task, elapsed time) is saved to AsyncStorage whenever it changes
2. When the user returns to the Pomodoro page, the timer state is automatically restored
3. Timer continues from where it left off, even after app restart

**Files Modified:**

1. **src/pages/AboutScreen.tsx**
   - Imported `AsyncStorage` from `@react-native-async-storage/async-storage`
   - Added storage key constant: `TIMER_STATE_KEY = '@pomodoro_timer_state'`
   - Created `loadTimerState()` function to restore timer on component mount
   - Created `saveTimerState()` function to persist timer whenever state changes
   - Added `useEffect` hook to load timer state on mount
   - Added `useEffect` hook to save timer state whenever key values change (timer, isRunning, isBreak, selectedTaskId, elapsedWorkTime)
   - Modified `resetTimer()` to clear saved state when user explicitly resets

**What Gets Saved:**
- `timer`: Time remaining in seconds
- `isRunning`: Whether the timer is actively counting down
- `isBreak`: Whether it's a work session or break session
- `selectedTaskId`: Which task the user is working on
- `elapsedWorkTime`: How long they've been working on the current session
- `workDuration`: Custom work duration setting
- `breakDuration`: Custom break duration setting
- `selectedQuadrant`: Which Eisenhower quadrant is selected

**Code Markers:**
All new code is marked with `// Shreyas's code` comments for presentation purposes.
