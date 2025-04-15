import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../services/notifications.service';
import { SyncService } from '../services/sync.service';

interface PracticeSchedule {
  days: number[];
  hour: number;
  minute: number;
}

interface Preferences {
  darkMode: boolean;
  notificationsEnabled: boolean;
  practiceSchedule: PracticeSchedule;
  cloudSync: boolean;
  defaultTuning: string;
  metronomeSettings: {
    defaultTempo: number;
    defaultBeatsPerMeasure: number;
  };
}

const DEFAULT_PREFERENCES: Preferences = {
  darkMode: true,
  notificationsEnabled: true,
  practiceSchedule: {
    days: [1, 2, 3, 4, 5], // Monday to Friday
    hour: 18, // 6 PM
    minute: 0,
  },
  cloudSync: true,
  defaultTuning: 'standard',
  metronomeSettings: {
    defaultTempo: 100,
    defaultBeatsPerMeasure: 4,
  },
};

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const notificationService = NotificationService.getInstance();
  const syncService = SyncService.getInstance();

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    // Handle notification scheduling when preferences change
    if (preferences.notificationsEnabled) {
      schedulePracticeReminders();
    } else {
      notificationService.cancelPracticeReminders();
    }
  }, [preferences.notificationsEnabled, preferences.practiceSchedule]);

  useEffect(() => {
    // Handle cloud sync when preference changes
    if (preferences.cloudSync) {
      syncService.startAutoSync();
    } else {
      syncService.stopAutoSync();
    }
  }, [preferences.cloudSync]);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('preferences');
      if (stored) {
        const parsedPrefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        setPreferences(parsedPrefs);
        
        // Initialize services based on preferences
        if (parsedPrefs.notificationsEnabled) {
          await notificationService.registerForPushNotifications();
        }
        if (parsedPrefs.cloudSync) {
          syncService.startAutoSync();
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<Preferences>) => {
    try {
      const newPreferences = { ...preferences, ...updates };
      await AsyncStorage.setItem('preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      return true;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  };

  const schedulePracticeReminders = async () => {
    try {
      await notificationService.cancelPracticeReminders(); // Clear existing reminders
      if (preferences.notificationsEnabled) {
        await notificationService.schedulePracticeReminder(
          preferences.practiceSchedule.days,
          preferences.practiceSchedule.hour,
          preferences.practiceSchedule.minute
        );
      }
    } catch (error) {
      console.error('Failed to schedule practice reminders:', error);
    }
  };

  const updatePracticeSchedule = async (schedule: Partial<PracticeSchedule>) => {
    const updatedSchedule = { ...preferences.practiceSchedule, ...schedule };
    return await updatePreferences({
      practiceSchedule: updatedSchedule
    });
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      try {
        await notificationService.registerForPushNotifications();
      } catch (error) {
        console.error('Failed to enable notifications:', error);
        return false;
      }
    }
    return await updatePreferences({ notificationsEnabled: enabled });
  };

  const toggleCloudSync = async (enabled: boolean) => {
    return await updatePreferences({ cloudSync: enabled });
  };

  const resetPreferences = async () => {
    try {
      await AsyncStorage.setItem('preferences', JSON.stringify(DEFAULT_PREFERENCES));
      setPreferences(DEFAULT_PREFERENCES);
      
      // Reset services
      await notificationService.cancelAllNotifications();
      syncService.stopAutoSync();
      
      if (DEFAULT_PREFERENCES.notificationsEnabled) {
        await schedulePracticeReminders();
      }
      if (DEFAULT_PREFERENCES.cloudSync) {
        syncService.startAutoSync();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to reset preferences:', error);
      return false;
    }
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    updatePracticeSchedule,
    toggleNotifications,
    toggleCloudSync,
    resetPreferences,
  };
};