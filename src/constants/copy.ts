import type { ActionCategory, ActionType } from '@/types/action';

export const copy = {
  privacy: {
    processedOnDevice: 'Processed on device',
    onDeviceAi: 'On-device AI enabled',
    offlineVault: '100% Offline Vault',
    offline: 'Offline · still works',
  },
  home: {
    chooseTitle: 'Choose Screenshot',
    chooseSubtitle: 'Select a bill, ticket, appointment, or chat screenshot to auto-extract tasks & events.',
    dropTitle: 'Tap to browse screenshots',
    dropSubtitle: 'Instant local OCR parsing & action generation',
    openPhotos: 'Open Photos',
    takePhoto: 'Take Photo /\nScan',
    recent: 'Recent actions',
    viewAll: 'View all',
    ramNotice: 'Screenshots are scrubbed & analyzed purely in phone RAM',
  },
  review: {
    screenTitle: 'Screenshot Review',
    sandbox: 'SECURE SANDBOX',
    readingText: 'Reading text on your device…',
    gemmaReading: 'Gemma is reading your screenshot',
    foundDetails: 'AI found these details',
    needsReviewTitle: 'Needs review',
    needsReviewBody: "Gemma couldn't read this one reliably. Check the details and fill in anything missing.",
    ocrFailedTitle: "Couldn't read this screenshot",
    tryAnother: 'Try another screenshot',
    enterManually: 'Enter manually',
    editManually: 'Edit manually',
    doneEditing: 'Done editing',
    noImageTitle: 'No screenshot selected',
    noImageBody: 'Choose a screenshot from Home to get started.',
    backHome: 'Back to Home',
    footer: 'Extracted completely offline via on-device Gemma AI.',
    demoMode: 'Demo mode is on: sample bill text is used instead of reading your screenshot. Turn it off in Settings.',
    fields: {
      title: 'Title',
      date: 'Date',
      time: 'Time',
      amount: 'Amount',
      notes: 'Notes',
      notSet: 'Not set',
    },
  },
  success: {
    eyebrow: 'EXTRACTED TASK',
    dueDate: 'Due Date',
    alertSchedule: 'Alert Schedule',
    target: 'Saved to',
    viewReminder: 'View in history',
    addToCalendar: 'Add to calendar',
    addedToCalendar: 'In calendar',
    processAnother: 'Process another screenshot',
    privacy: 'No screenshot or personal data left your device.',
  },
  history: {
    title: 'History',
    subtitle: 'Intelligent local timeline',
    search: 'Search screenshots, bills, bookings...',
    emptyTitle: 'No actions yet',
    emptyBody: 'Choose a screenshot to get started.',
    noMatches: 'No matches in your timeline.',
    selectScreenshot: 'Select Screenshot',
    footer: 'Timeline stored 100% on this device',
    loadError: "Couldn't load your history.",
    retry: 'Try again',
  },
} as const;

export const actionTypeCopy: Record<ActionType, { label: string; cta: string; done: string; doneBody: string }> = {
  reminder: {
    label: 'Reminder',
    cta: 'Create reminder',
    done: 'Reminder created',
    doneBody: "You're all set! We'll alert you before the due date.",
  },
  calendar_event: {
    label: 'Calendar',
    cta: 'Add to calendar',
    done: 'Event added',
    doneBody: "It's in your calendar with an alert before it starts.",
  },
  task: {
    label: 'Task',
    cta: 'Create task',
    done: 'Task saved',
    doneBody: 'Saved to your SnapDone tasks on this device.',
  },
};

export const categoryCopy: Record<ActionCategory, string> = {
  bill: 'Bill',
  appointment: 'Appointment',
  delivery: 'Delivery',
  task: 'Task',
};
