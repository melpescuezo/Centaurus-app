import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';

type PlayerUIProps = {
  isPlaying: boolean;
  onPress?: () => void;
};

const LOGO_SOURCE: ImageSourcePropType = require('../../logo.png');

const LED_COLORS = [
  '#2bff88',
  '#2bff88',
  '#2bff88',
  '#2bff88',
  '#2bff88',
  '#2bff88',
  '#2bff88',
  '#2bff88',
  '#f4b400',
  '#f4b400',
  '#f4b400',
  '#f4b400',
  '#f43f5e',
  '#f43f5e',
  '#f43f5e',
  '#f43f5e',
];

export default function PlayerUI({ isPlaying, onPress }: PlayerUIProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.95)).current;
  const ledValues = useMemo(() => Array.from({ length: 16 }, () => new Animated.Value(0.35)), []);

  useEffect(() => {
    let spinLoop: Animated.CompositeAnimation | null = null;
    let ringLoop: Animated.CompositeAnimation | null = null;
    let ledLoop: Animated.CompositeAnimation | null = null;

    if (isPlaying) {
      spinLoop = Animated.loop(
        Animated.timing(spinValue, {
          duration: 4200,
          easing: Easing.linear,
          toValue: 1,
          useNativeDriver: true,
        }),
      );
      spinLoop.start();

      ringLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale, {
              duration: 950,
              easing: Easing.inOut(Easing.quad),
              toValue: 1.06,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              duration: 950,
              easing: Easing.inOut(Easing.quad),
              toValue: 1,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(ringScale, {
              duration: 950,
              easing: Easing.inOut(Easing.quad),
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              duration: 950,
              easing: Easing.inOut(Easing.quad),
              toValue: 0.95,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      ringLoop.start();

      const wavePattern = ledValues.map((value, index) =>
        Animated.sequence([
          Animated.timing(value, {
            duration: 170 + (index % 4) * 70,
            easing: Easing.inOut(Easing.ease),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            duration: 170 + ((15 - index) % 4) * 70,
            easing: Easing.inOut(Easing.ease),
            toValue: 0.25,
            useNativeDriver: true,
          }),
        ]),
      );
      ledLoop = Animated.loop(Animated.stagger(45, wavePattern));
      ledLoop.start();
    } else {
      spinValue.stopAnimation(() => spinValue.setValue(0));
      ringScale.stopAnimation(() => ringScale.setValue(1));
      ringOpacity.stopAnimation(() => ringOpacity.setValue(0.95));
      ledValues.forEach((value) => value.stopAnimation(() => value.setValue(0.35)));
    }

    return () => {
      spinLoop?.stop();
      ringLoop?.stop();
      ledLoop?.stop();
    };
  }, [isPlaying, ledValues, ringOpacity, ringScale, spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.visualArea}>
        <Pressable onPress={onPress} style={styles.vinylWrap}>
          <Animated.View
            style={[styles.vinylOuter, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
          >
            <View style={styles.vinylMid}>
              <Animated.View style={[styles.logoWrap, { transform: [{ rotate }] }]}>
                <Image source={LOGO_SOURCE} style={styles.logoImage} />
              </Animated.View>
            </View>
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.ledRows}>
        <View style={styles.ledRow}>
          {ledValues.map((value, index) => (
            <Animated.View
              key={`row-1-${index}`}
              style={[
                styles.led,
                {
                  backgroundColor: LED_COLORS[index],
                  opacity: value,
                  transform: [
                    {
                      scaleY: value.interpolate({
                        inputRange: [0.25, 1],
                        outputRange: [0.8, 1.4],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.ledRow}>
          {[...ledValues].reverse().map((value, index) => (
            <Animated.View
              key={`row-2-${index}`}
              style={[
                styles.led,
                {
                  backgroundColor: LED_COLORS[15 - index],
                  opacity: value,
                  transform: [
                    {
                      scaleY: value.interpolate({
                        inputRange: [0.25, 1],
                        outputRange: [0.8, 1.4],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  led: {
    borderRadius: 3,
    height: 13,
    width: 18,
  },
  ledRow: {
    flexDirection: 'row',
    gap: 4,
  },
  ledRows: {
    gap: 12,
    marginTop: 28,
  },
  logoImage: {
    borderRadius: 88,
    height: 176,
    width: 176,
  },
  logoWrap: {
    alignItems: 'center',
    borderRadius: 88,
    height: 176,
    justifyContent: 'center',
    width: 176,
  },
  visualArea: {
    alignItems: 'center',
    height: 350,
    justifyContent: 'center',
    width: 350,
  },
  vinylMid: {
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 117,
    height: 234,
    justifyContent: 'center',
    width: 234,
  },
  vinylOuter: {
    alignItems: 'center',
    backgroundColor: '#0000aa',
    borderRadius: 175,
    height: 350,
    justifyContent: 'center',
    width: 350,
  },
  vinylWrap: {
    borderRadius: 175,
  },
});
