import 'expo-router/entry';
import TrackPlayer from 'react-native-track-player';
import playbackService from './src/player/service';

TrackPlayer.registerPlaybackService(() => playbackService);
