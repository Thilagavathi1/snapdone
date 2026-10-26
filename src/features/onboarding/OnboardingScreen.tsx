import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/theme/colors';
import { AppLogo } from '@/components/AppLogo';

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: 'document-text-outline',
    iconColor: colors.primarySoft,
    title: 'Extract details',
    tag: 'Instant',
    description: 'On-device OCR & Gemma AI parse text from any screenshot',
  },
  {
    icon: 'notifications-outline',
    iconColor: colors.tertiary,
    title: 'Create reminders',
    tag: 'Smart',
    description: 'Auto-populates dates, amounts & action items',
  },
  {
    icon: 'cloud-offline-outline',
    iconColor: colors.secondary,
    title: 'Works offline',
    tag: 'Local',
    description: '100% private. Zero data ever leaves your phone',
  },
] as const;

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onGetStarted }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Glow backdrop behind logo */}
        <View style={styles.glowAura} />

        <View style={styles.headerSection}>
          <AppLogo size="lg" />

          <View style={styles.titleRow}>
            <Text style={styles.appTitle}>SnapDone</Text>
            <View style={styles.versionBadge}>
              <Ionicons name="shield-checkmark-outline" size={13} color={colors.secondary} style={{ marginRight: 5 }} />
              <Text style={styles.versionText}>v1.0</Text>
            </View>
          </View>

          <Text style={styles.heroHeadline}>
            Turn screenshots{'\n'}
            into <Text style={styles.heroAccent}>done.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Capture a bill, booking, or plan. SnapDone extracts the details and creates a reminder for you.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {features.map((feature) => {
            const isLocal = feature.tag === 'Local';
            return (
              <View key={feature.title} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={26} color={feature.iconColor} />
                </View>
                <View style={styles.featureTextCol}>
                  <View style={styles.featureHeaderRow}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <View style={[styles.tagBadge, isLocal && styles.localTagBadge]}>
                      {isLocal && (
                        <Ionicons name="lock-closed-outline" size={11} color={colors.secondary} style={{ marginRight: 4 }} />
                      )}
                      <Text style={[styles.tagBadgeText, isLocal && { color: colors.secondary }]}>{feature.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.featureDescription} numberOfLines={1}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSection}>
          <Pressable
            style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.85 }]}
            onPress={onGetStarted}
            accessibilityRole="button"
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={styles.ctaButtonText.color} style={{ marginLeft: 10 }} />
          </Pressable>

          <View style={styles.privacyRow}>
            <Ionicons name="shield-half" size={16} color={colors.secondary} style={{ marginRight: 8 }} />
            <Text style={styles.privacyText}>Your screenshots stay on your device.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutralBackground,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  glowAura: {
    position: 'absolute',
    top: 0,
    width: 260,
    height: 200,
    borderRadius: 130,
    backgroundColor: 'rgba(96, 120, 180, 0.08)',
    alignSelf: 'center',
  },
  headerSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 22,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 22,
  },
  appTitle: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    color: colors.textPrimary,
    marginRight: 8,
    letterSpacing: -0.4,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  versionText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.secondary,
  },
  heroHeadline: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroAccent: {
    color: colors.primarySoft,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  featuresSection: {
    width: '100%',
    gap: 8,
    marginBottom: 18,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralSurface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.neutralSurfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextCol: {
    flex: 1,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  featureTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralSurfaceActive,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  localTagBadge: {
    backgroundColor: colors.secondaryMuted,
  },
  tagBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  featureDescription: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    height: 46,
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 18,
  },
  ctaButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: '#EDE9FE',
    letterSpacing: -0.2,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
});
