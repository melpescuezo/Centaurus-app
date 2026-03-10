// @ts-nocheck
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRadioPlayer } from '../player/RadioPlayerContext.js';

const LOGO_IMAGE = require('../../logo.png');

export default function MiniPlayer() {
  const { errorMessage, isBuffering, isPlaying, nowPlaying, togglePlayback } = useRadioPlayer();
  const statusLabel = isBuffering ? 'Conectando...' : isPlaying ? 'En directo' : 'Pausado';

  return (
    <View style={styles.wrap}>
      {!!errorMessage && (
        <View style={styles.errorRow}>
          <Text numberOfLines={1} style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      )}
      <View style={styles.miniPlayer}>
        <Image source={LOGO_IMAGE} style={styles.bgLogo} />
        <View style={styles.bgOverlay} />
        <View style={styles.miniLeft}>
          <View style={styles.miniInfo}>
            <Text style={styles.nowPlayingLabel}>Ahora suena...</Text>
            <Text style={styles.miniTitle} numberOfLines={1}>
              {nowPlaying.title}
            </Text>
            <View style={styles.miniMetaRow}>
              <View style={[styles.liveDot, { opacity: isPlaying ? 1 : 0.4 }]} />
              <Text style={styles.miniSubtitle} numberOfLines={1}>
                {nowPlaying.artist} · {statusLabel}
              </Text>
            </View>
          </View>
        </View>
        <Pressable onPress={togglePlayback} style={styles.miniButton}>
          <Text style={styles.miniButtonText}>{isPlaying ? '❚❚' : '▶'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 82,
    gap: 8,
  },

  errorRow: {
    backgroundColor: '#4e131c',
    borderColor: '#8f1d2f',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  errorText: {
    color: '#ffd8de',
    fontSize: 12,
    fontWeight: '600',
  },

  miniPlayer: {
    backgroundColor: '#0b0b10',
    borderTopWidth: 1,
    borderTopColor: '#14141a',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  miniLeft: {
    flexDirection: 'column',
    gap: 4,
    flex: 1,
    marginRight: 12,
  },

  miniInfo: {
    flex: 1,
    gap: 4,
  },

  nowPlayingLabel: {
    color: '#FFD200',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  miniTitle: {
    color: '#f2f2f2',
    fontSize: 15,
    fontWeight: '700',
  },

  miniMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },

  miniSubtitle: {
    color: '#9a9aa3',
    fontSize: 12,
    fontWeight: '600',
  },

  miniButton: {
    backgroundColor: '#7f2969',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  miniButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },

  bgLogo: {
    height: 180,
    opacity: 0.16,
    position: 'absolute',
    right: -26,
    top: -56,
    width: 180,
  },

  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
});
