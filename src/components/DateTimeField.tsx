import React, { useState } from 'react';
import { Platform, Pressable, Text, View, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, fonts } from '@/theme/colors';
import { combineDateTime, parseIsoDate, toIsoDate, toTime } from '@/utils/dates';

interface DateTimeFieldProps {
  mode: 'date' | 'time';
  /** "YYYY-MM-DD" for dates, "HH:mm" for times, "" when unset. */
  value: string;
  display: string;
  placeholder: string;
  editable: boolean;
  onChange: (value: string) => void;
}

const toPickerDate = (mode: 'date' | 'time', value: string): Date => {
  if (mode === 'date') return parseIsoDate(value) ?? new Date();
  return (value && combineDateTime(toIsoDate(new Date()), value)) || new Date();
};

/** Shows a formatted value; when editable, tapping opens the native date or time picker. */
export const DateTimeField: React.FC<DateTimeFieldProps> = ({ mode, value, display, placeholder, editable, onChange }) => {
  const [iosOpen, setIosOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type !== 'set' || !date) return;
    onChange(mode === 'date' ? toIsoDate(date) : toTime(date));
  };

  const open = () => {
    if (!editable) return;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: toPickerDate(mode, value), mode, onChange: handleChange });
    } else {
      setIosOpen((o) => !o);
    }
  };

  return (
    <View>
      <Pressable onPress={open} disabled={!editable} hitSlop={8} accessibilityRole={editable ? 'button' : undefined}>
        <Text style={[styles.value, !value && styles.placeholder, editable && styles.editable]}>
          {value ? display : placeholder}
        </Text>
      </Pressable>
      {iosOpen && editable && Platform.OS === 'ios' && (
        <DateTimePicker
          value={toPickerDate(mode, value)}
          mode={mode}
          display="spinner"
          themeVariant="dark"
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  value: {
    fontFamily: fonts.regular,
    fontSize: 20,
    color: colors.textPrimary,
  },
  placeholder: {
    color: colors.textMuted,
  },
  editable: {
    textDecorationLine: 'underline',
    textDecorationColor: colors.primaryMutedBorder,
  },
});
