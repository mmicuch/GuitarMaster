import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export class NotificationService {
  private static instance: NotificationService;
  private notificationListener: any;
  private responseListener: any;

  private constructor() {
    this.setupNotificationChannels();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Set up notification channels for Android
   */
  private async setupNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('practice-reminders', {
        name: 'Practice Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
      });

      await Notifications.setNotificationChannelAsync('general', {
        name: 'General Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }

  /**
   * Register for push notifications
   */
  public async registerForPushNotifications() {
    if (!Device.isDevice) {
      throw new Error('Push notifications are only supported on physical devices');
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permission to send notifications was denied');
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  }

  /**
   * Schedule a practice reminder
   */
  public async schedulePracticeReminder(
    days: number[],  // 0 = Sunday, 1 = Monday, etc.
    hour: number,
    minute: number
  ) {
    const triggers = days.map(day => ({
      hour,
      minute,
      weekday: day + 1, // Notifications API uses 1-7 for weekdays
      repeats: true,
    }));

    const notifications = await Promise.all(
      triggers.map(trigger =>
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Time to Practice! 🎸",
            body: "Don't forget your daily guitar practice session.",
            data: { type: 'practice-reminder' },
          },
          trigger,
        })
      )
    );

    return notifications;
  }

  /**
   * Cancel all practice reminders
   */
  public async cancelPracticeReminders() {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const practiceReminders = scheduledNotifications.filter(
      notification => notification.content.data?.type === 'practice-reminder'
    );

    await Promise.all(
      practiceReminders.map(reminder =>
        Notifications.cancelScheduledNotificationAsync(reminder.identifier)
      )
    );
  }

  /**
   * Send an immediate notification
   */
  public async sendNotification(
    title: string,
    body: string,
    data?: any,
    channelId: string = 'general'
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // null means send immediately
    });
  }

  /**
   * Setup notification handlers
   */
  public setupNotificationHandlers(
    onNotification?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        if (onNotification) {
          onNotification(notification);
        }
      }
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );
  }

  /**
   * Clean up notification listeners
   */
  public cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Get all pending notifications
   */
  public async getPendingNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Cancel all notifications
   */
  public async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Cancel a specific notification
   */
  public async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Check if notifications are enabled
   */
  public async areNotificationsEnabled() {
    const settings = await Notifications.getPermissionsAsync();
    return settings.granted;
  }
}