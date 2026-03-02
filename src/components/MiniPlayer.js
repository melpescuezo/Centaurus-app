import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRadioPlayer } from '../player/RadioPlayerContext.js';

export default function MiniPlayer() {
  const { isBuffering, isPlaying, nowPlaying, togglePlayback } = useRadioPlayer();
  const statusLabel = isBuffering ? 'Conectando...' : isPlaying ? 'En directo' : 'Pausado';

  return (
    <View style={styles.miniPlayer}>
      <View style={styles.miniLeft}>
        <View style={styles.miniInfo}>
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
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0b0b10',
    borderTopWidth: 1,
    borderTopColor: '#14141a',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  miniTitle: {
    color: '#f2f2f2',
    fontSize: 16,
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
    backgroundColor: '#0000fe',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  miniButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
});
