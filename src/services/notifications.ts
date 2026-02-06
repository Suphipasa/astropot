import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  // SAFETY SHIELD: Wrap everything in try-catch
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted!');
        return;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  } catch (error) {
    // This catches the "Expo Go" error on Android so the app doesn't crash.
    console.log("⚠️ Notification Warning: Skipping setup (Likely Expo Go limitation). This will work in the built app.");
  }
}

export async function scheduleDailyReminder() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Astropot ☕",
        body: "Yıldızlar senin hakkında konuşuyor. Bakalım bugün ne dediler?",
        sound: true,
      },
      trigger: {
        hour: 9, 
        minute: 0,
        repeats: true,
      } as any, 
    });
    
    console.log("📅 Notification scheduled for 9:00 AM");
  } catch (error) {
    console.log("⚠️ Schedule Warning: Could not schedule notification.");
  }
}