import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import TrackPlayer from 'react-native-track-player';
import { playStream, setupPlayer, stopStream } from './index.js';

type NowPlaying = {
  artist: string;
  title: string;
};

type RadioPlayerContextValue = {
  isBuffering: boolean;
  isPlaying: boolean;
  nowPlaying: NowPlaying;
  togglePlayback: () => Promise<void>;
};

const STREAM_URL = 'https://server1.easystreaming.pro:8443/95.5';
const NOW_PLAYING_URL = 'https://server1.easystreaming.pro:8443/status-json.xsl';
const STATION_NAME = 'Frecuencia FM';
const METADATA_POLL_MS = 15000;
const BUFFER_TIMEOUT_MS = 9000;
const RECONNECT_BASE_MS = 1500;
const RECONNECT_MAX_MS = 15000;

const DEFAULT_NOW_PLAYING: NowPlaying = {
  artist: '95.5 Murcia',
  title: STATION_NAME,
};

const EVT_PLAYBACK_STATE = 'playback-state';
const EVT_PLAYBACK_METADATA = 'playback-metadata-received';
const EVT_METADATA_COMMON = 'metadata-common-received';
const EVT_PLAYBACK_ERROR = 'playback-error';
const STATE_PLAYING = 'playing';
const STATE_BUFFERING = 'buffering';
const STATE_LOADING = 'loading';

const RadioPlayerContext = createContext<RadioPlayerContextValue | null>(null);

const parseArtistTitle = (value: string): NowPlaying | null => {
  const clean = value.trim();
  if (!clean) return null;
  const parts = clean
    .split(' - ')
    .map((item) => item.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { artist: parts[0], title: parts.slice(1).join(' - ') };
  }
  return { artist: STATION_NAME, title: clean };
};

const parseNowPlayingJson = (payload: unknown): NowPlaying | null => {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  const icestats = data.icestats as Record<string, unknown> | undefined;
  if (!icestats) return null;
  const source = icestats.source as
    | Record<string, unknown>
    | Array<Record<string, unknown>>
    | undefined;
  const active = Array.isArray(source) ? source[0] : source;
  if (!active) return null;
  const rawTitle =
    (active.title as string | undefined) ||
    (active.yp_currently_playing as string | undefined) ||
    '';
  const clean = rawTitle.trim();
  if (!clean) return null;
  return parseArtistTitle(clean);
};

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>(DEFAULT_NOW_PLAYING);

  const shouldBePlayingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufferTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const clearBufferTimeout = useCallback(() => {
    if (bufferTimeoutRef.current) {
      clearTimeout(bufferTimeoutRef.current);
      bufferTimeoutRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(async () => {
    if (!shouldBePlayingRef.current) return;
    clearReconnectTimeout();
    const attempt = reconnectAttemptsRef.current + 1;
    reconnectAttemptsRef.current = attempt;
    const delay = Math.min(RECONNECT_BASE_MS * attempt, RECONNECT_MAX_MS);
    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        await playStream(STREAM_URL, STATION_NAME);
        reconnectAttemptsRef.current = 0;
      } catch {
        scheduleReconnect();
      }
    }, delay);
  }, [clearReconnectTimeout]);

  const applyNowPlaying = useCallback(async (next: NowPlaying) => {
    setNowPlaying(next);
    try {
      const activeIndex = await TrackPlayer.getActiveTrackIndex();
      if (activeIndex !== undefined) {
        await TrackPlayer.updateMetadataForTrack(activeIndex, {
          artist: next.artist,
          title: next.title,
        });
      }
    } catch {
      // Ignore metadata notification update errors.
    }
  }, []);

  const refreshStreamMetadata = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(NOW_PLAYING_URL, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) return;
      const payload = (await response.json()) as unknown;
      const metadata = parseNowPlayingJson(payload);
      if (metadata) await applyNowPlaying(metadata);
    } catch {
      // Ignore transient metadata/network failures.
    }
  }, [applyNowPlaying]);

  useEffect(() => {
    void setupPlayer();

    const stateSub = TrackPlayer.addEventListener(EVT_PLAYBACK_STATE as never, (event: any) => {
      const state = event?.state;
      const playing = state === STATE_PLAYING;
      const buffering = state === STATE_BUFFERING || state === STATE_LOADING;
      setIsPlaying(playing);
      setIsBuffering(buffering);

      if (playing) {
        clearBufferTimeout();
        clearReconnectTimeout();
        reconnectAttemptsRef.current = 0;
      }

      if (buffering && shouldBePlayingRef.current) {
        clearBufferTimeout();
        bufferTimeoutRef.current = setTimeout(() => {
          scheduleReconnect();
        }, BUFFER_TIMEOUT_MS);
      } else {
        clearBufferTimeout();
      }
    });

    const errorSub = TrackPlayer.addEventListener(EVT_PLAYBACK_ERROR as never, () => {
      if (shouldBePlayingRef.current) {
        scheduleReconnect();
      }
    });

    const metaSub = TrackPlayer.addEventListener(EVT_PLAYBACK_METADATA as never, (event: any) => {
      const withArtist = event?.artist?.trim() && event?.title?.trim();
      if (withArtist) {
        void applyNowPlaying({
          artist: event.artist.trim(),
          title: event.title.trim(),
        });
        return;
      }

      const fallbackTitle = event?.title?.trim();
      if (fallbackTitle) {
        const parsed = parseArtistTitle(fallbackTitle);
        if (parsed) {
          void applyNowPlaying(parsed);
        }
      }
    });

    const commonMetaSub = TrackPlayer.addEventListener(
      EVT_METADATA_COMMON as never,
      (event: any) => {
        const title = event?.metadata?.title?.trim();
        if (!title) return;

        const artist = event?.metadata?.artist?.trim();
        if (artist) {
          void applyNowPlaying({ artist, title });
          return;
        }

        const parsed = parseArtistTitle(title);
        if (parsed) {
          void applyNowPlaying(parsed);
        }
      },
    );

    void refreshStreamMetadata();
    const interval = setInterval(() => {
      void refreshStreamMetadata();
    }, METADATA_POLL_MS);

    return () => {
      clearInterval(interval);
      clearReconnectTimeout();
      clearBufferTimeout();
      stateSub.remove();
      errorSub.remove();
      metaSub.remove();
      commonMetaSub.remove();
    };
  }, [
    applyNowPlaying,
    clearBufferTimeout,
    clearReconnectTimeout,
    refreshStreamMetadata,
    scheduleReconnect,
  ]);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      shouldBePlayingRef.current = false;
      clearReconnectTimeout();
      clearBufferTimeout();
      await stopStream();
      setIsPlaying(false);
      setIsBuffering(false);
      return;
    }

    shouldBePlayingRef.current = true;
    setIsBuffering(true);
    await playStream(STREAM_URL, STATION_NAME);
    setIsPlaying(true);
    setIsBuffering(false);
    void refreshStreamMetadata();
  }, [clearBufferTimeout, clearReconnectTimeout, isPlaying, refreshStreamMetadata]);

  const value = useMemo(
    () => ({
      isBuffering,
      isPlaying,
      nowPlaying,
      togglePlayback,
    }),
    [isBuffering, isPlaying, nowPlaying, togglePlayback],
  );

  return <RadioPlayerContext.Provider value={value}>{children}</RadioPlayerContext.Provider>;
}

export function useRadioPlayer() {
  const context = useContext(RadioPlayerContext);
  if (!context) {
    throw new Error('useRadioPlayer must be used inside RadioPlayerProvider');
  }
  return context;
}
