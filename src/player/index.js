// @ts-nocheck
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
} from 'react-native-track-player';

let isPlayerReady = false;
const BASE_CAPS = [Capability.Play, Capability.Pause, Capability.Stop];
const DEFAULT_ARTWORK = require('../../frecuenciafm.png');

export async function setupPlayer() {
  if (isPlayerReady) return;

  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: BASE_CAPS,
    compactCapabilities: BASE_CAPS,
    notificationCapabilities: BASE_CAPS,
    stopWithApp: false,
  });
  await TrackPlayer.setRepeatMode(RepeatMode.Off);

  isPlayerReady = true;
}

export async function playStream(url, title = 'Live Stream', artist = '') {
  await setupPlayer();
  await TrackPlayer.reset();
  await TrackPlayer.add({
    isLiveStream: true,
    title,
    artist,
    album: 'En Directo',
    artwork: DEFAULT_ARTWORK,
    url,
  });
  await TrackPlayer.play();
}

export async function stopStream() {
  if (!isPlayerReady) return;
  await TrackPlayer.stop();
  await TrackPlayer.reset();
}
