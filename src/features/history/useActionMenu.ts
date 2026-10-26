import { useCallback } from 'react';
import { Alert } from 'react-native';
import { actionService } from '@/features/actions/actionService';
import { useHistoryStore } from '@/store/historyStore';
import type { ActionRecord } from '@/types/action';

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');

/** Archive, calendar and delete actions for a history card. */
export function useActionMenu() {
  const update = useHistoryStore((s) => s.update);
  const remove = useHistoryStore((s) => s.remove);

  const toggleArchive = useCallback(
    (record: ActionRecord) => {
      update(record.id, { status: record.status === 'archived' ? 'done' : 'archived' }).catch((e) =>
        Alert.alert("Couldn't update", errorMessage(e)),
      );
    },
    [update],
  );

  const showMenu = useCallback(
    (record: ActionRecord) => {
      const canAddToCalendar = !!record.dueDate && !record.calendarEventId;
      Alert.alert(record.title, undefined, [
        ...(canAddToCalendar
          ? [
              {
                text: 'Add to calendar',
                onPress: async () => {
                  try {
                    const calendarEventId = await actionService.addToCalendar(record);
                    useHistoryStore.setState((s) => ({
                      items: s.items.map((i) => (i.id === record.id ? { ...i, calendarEventId } : i)),
                    }));
                  } catch (e) {
                    Alert.alert("Couldn't add to calendar", errorMessage(e));
                  }
                },
              },
            ]
          : []),
        {
          text: 'Delete',
          style: 'destructive' as const,
          onPress: () => remove(record).catch((e) => Alert.alert("Couldn't delete", errorMessage(e))),
        },
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    },
    [remove],
  );

  return { toggleArchive, showMenu };
}
