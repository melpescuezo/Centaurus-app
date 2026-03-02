// @ts-nocheck
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
} from 'react-native-track-player';

let isPlayerReady = false;

export async function setupPlayer() {
  if (isPlayerReady) return;

  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    stopWithApp: false,
  });
  await TrackPlayer.setRepeatMode(RepeatMode.Off);

  isPlayerReady = true;
}

export async function playStream(url, title = 'Live Stream') {
  await setupPlayer();
  await TrackPlayer.reset();
  await TrackPlayer.add({
    isLiveStream: true,
    title,
    url,
  });
  await TrackPlayer.play();
}

export async function stopStream() {
  if (!isPlayerReady) return;
  await TrackPlayer.stop();
  await TrackPlayer.reset();
}
