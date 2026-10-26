import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, layout } from '@/theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface StateCardProps {
  icon: IconName;
  tone?: 'neutral' | 'warning' | 'error';
  title: string;
  body?: string;
  action?: { label: string; icon?: IconName; onPress: () => void };
}

const toneColors = {
  neutral: { fg: colors.primarySoft, bg: colors.neutralSurfaceActive },
  warning: { fg: colors.tertiary, bg: colors.tertiaryMuted },
  error: { fg: colors.danger, bg: colors.dangerMuted },
};

/** Empty, error and offline states share this card. */
export const StateCard: React.FC<StateCardProps> = ({ icon, tone = 'neutral', title, body, action }) => {
  const { fg, bg } = toneColors[tone];
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={30} color={fg} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body && <Text style={styles.body}>{body}</Text>}
      {action && (
        <Pressable style={styles.button} onPress={action.onPress} accessibilityRole="button">
          {action.icon && (
            <Ionicons name={action.icon} size={20} color={colors.onPrimaryContainer} style={{ marginRight: 10 }} />
          )}
          <Text style={styles.buttonText}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutralSurface,
    borderRadius: layout.cardRadius + 6,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 24,
    height: 50,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.onPrimaryContainer,
  },
});
