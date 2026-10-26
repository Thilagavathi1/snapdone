import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { PermissionDeniedError } from '@/services/errors';

const CHANNEL_ID = 'reminders';

export interface ScheduledAlert {
  id: string;
  at: Date;
}

export const notificationService = {
  /** Show alerts even when the app is open. Call once at startup. */
  configure() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  },

  async ensurePermission() {
    // Android 13+ only shows the permission prompt once a channel exists.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Reminders',
        // Re-exported via `export *`, which eslint-plugin-import can't follow.
        // eslint-disable-next-line import/namespace
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    const { granted } = current.granted ? current : await Notifications.requestPermissionsAsync();
    if (!granted) throw new PermissionDeniedError('Allow notifications in Settings so SnapDone can remind you.');
  },

  /** Schedule an alert at each future time. Times already in the past are skipped. */
  async schedule(title: string, body: string, times: Date[]): Promise<ScheduledAlert[]> {
    await this.ensurePermission();
    const now = Date.now();
    const alerts: ScheduledAlert[] = [];
    for (const at of times.filter((t) => t.getTime() > now)) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL_ID },
      });
      alerts.push({ id, at });
    }
    return alerts;
  },

  async cancel(ids: string[]) {
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  },
};
