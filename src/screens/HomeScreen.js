console.log('🔥 INDEX TABS ACTIVO');

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRadioPlayer } from '../player/RadioPlayerContext.js';

const VINYL_SIZE = 300;
const WAVE_BARS = 21;
const BAR_HEIGHT = 36;

export default function HomeScreen() {
  const { isPlaying, togglePlayback } = useRadioPlayer();

  const rotation = useRef(new Animated.Value(0)).current;
  const waveScale = useRef(new Animated.Value(1)).current;
  const isActiveRef = useRef(false);

  const rotationLoop = useRef(null);
  const waveLoop = useRef(null);

  const bars = useMemo(() => Array.from({ length: WAVE_BARS }, () => new Animated.Value(0.2)), []);

  const animateBar = useCallback((bar) => {
    if (!isActiveRef.current) return;
    const peak = 0.25 + Math.random() * 0.75;
    const low = 0.15 + Math.random() * 0.25;
    const rise = 220 + Math.random() * 200;
    const fall = 220 + Math.random() * 220;

    Animated.sequence([
      Animated.timing(bar, {
        toValue: peak,
        duration: rise,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bar, {
        toValue: low,
        duration: fall,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && isActiveRef.current) {
        animateBar(bar);
      }
    });
  }, []);

  useEffect(() => {
    if (isPlaying) {
      isActiveRef.current = true;
      rotation.setValue(0);

      rotationLoop.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );

      waveLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(waveScale, {
            toValue: 1.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );

      rotationLoop.current.start();
      waveLoop.current.start();
      bars.forEach((bar) => animateBar(bar));
    } else {
      isActiveRef.current = false;
      rotationLoop.current?.stop();
      waveLoop.current?.stop();

      rotation.setValue(0);
      waveScale.setValue(1);
      bars.forEach((bar) => bar.setValue(0.2));
    }
  }, [animateBar, bars, isPlaying, rotation, waveScale]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const onTogglePlayback = useCallback(async () => {
    await togglePlayback();
  }, [togglePlayback]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.centerStage}>
          <Pressable onPress={onTogglePlayback}>
            <View style={styles.stage}>
              {/* 🌊 Onda */}
              <Animated.View style={[styles.wave, { transform: [{ scale: waveScale }] }]} />

              {/* 💿 Vinilo */}
              <Animated.View style={[styles.vinyl, { transform: [{ rotate: rotateInterpolate }] }]}>
                <View style={styles.ring1} />
                <View style={styles.ring2} />
                <View style={styles.centerOuter} />
                <View style={styles.centerInner} />

                <Image source={require('../../frecuenciafm.png')} style={styles.logo} />
              </Animated.View>
            </View>
          </Pressable>

          {/* 🎚 Waveform */}
          <View style={styles.waveformWrap}>
            <View style={styles.waveformRow}>
              {bars.map((bar, index) => (
                <Animated.View
                  key={`bar-${index}`}
                  style={[
                    styles.waveBar,
                    {
                      transform: [
                        { translateY: BAR_HEIGHT / 2 },
                        {
                          scaleY: bar.interpolate({
                            inputRange: [0.1, 1],
                            outputRange: [0.2, 1.6],
                          }),
                        },
                        { translateY: -BAR_HEIGHT / 2 },
                      ],
                      opacity: bar.interpolate({
                        inputRange: [0.1, 1],
                        outputRange: [0.35, 1],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1 },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 90,
  },

  stage: {
    width: 360,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },

  wave: {
    position: 'absolute',
    width: VINYL_SIZE,
    height: VINYL_SIZE,
    borderRadius: VINYL_SIZE / 2,
    backgroundColor: '#0000fe',
    opacity: 0.25,
  },

  vinyl: {
    width: VINYL_SIZE,
    height: VINYL_SIZE,
    borderRadius: VINYL_SIZE / 2,
    backgroundColor: '#050507',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ring1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: '#111',
  },

  ring2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#111',
  },

  centerOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f0f18',
  },

  centerInner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0000fe',
  },

  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },

  waveformWrap: {
    marginTop: 110,
    alignItems: 'center',
    transform: [{ translateY: 36 }],
  },

  waveformRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
  },

  waveBar: {
    width: 7,
    height: BAR_HEIGHT,
    borderRadius: 3,
    backgroundColor: '#8aa7ff',
  },
});
