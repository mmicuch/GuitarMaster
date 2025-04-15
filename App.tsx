import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeAudio } from './src/utils/audioUtils';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  useEffect(() => {
    // Initialize audio system
    initializeAudio();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});
