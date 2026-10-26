import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GEMMA_MODEL } from '@/services/ai/gemmaModelFile';
import { useModelStore } from '@/store/modelStore';
import { colors, fonts, layout } from '@/theme/colors';

const sizeMb = Math.round(GEMMA_MODEL.sizeBytes / 1e6);

/** One-time download of the local Gemma model. Hidden once the model is on the device. */
export const ModelDownloadCard: React.FC = () => {
  const status = useModelStore((s) => s.status);
  const progress = useModelStore((s) => s.progress);
  const error = useModelStore((s) => s.error);
  const download = useModelStore((s) => s.download);
  const cancel = useModelStore((s) => s.cancel);

  if (status === 'ready') return null;
  const downloading = status === 'downloading';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="hardware-chip-outline" size={22} color={colors.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {downloading ? `Downloading ${GEMMA_MODEL.name}…` : `Get ${GEMMA_MODEL.name} on this phone`}
          </Text>
          <Text style={styles.body}>
            {downloading
              ? `${Math.round(progress * sizeMb)} of ${sizeMb} MB · keep the app open`
              : `One-time ${sizeMb} MB download. After that, screenshots are read fully offline.`}
          </Text>
        </View>
      </View>

      {downloading && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(progress * 100, 2)}%` }]} />
        </View>
      )}

      {status === 'error' && error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.button, downloading && styles.buttonSecondary]}
        onPress={downloading ? cancel : download}
        accessibilityRole="button"
      >
        <Ionicons
          name={downloading ? 'close' : status === 'error' ? 'refresh' : 'download-outline'}
          size={18}
          color={downloading ? colors.textPrimary : colors.onPrimaryContainer}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.buttonText, downloading && { color: colors.textPrimary }]}>
          {downloading ? 'Cancel' : status === 'error' ? 'Try again' : `Download (${sizeMb} MB)`}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutralSurface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.secondaryMutedBorder,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutralSurfaceActive,
    overflow: 'hidden',
    marginBottom: 14,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.danger,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
  },
  buttonSecondary: {
    backgroundColor: colors.neutralSurfaceActive,
  },
  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.onPrimaryContainer,
  },
});
