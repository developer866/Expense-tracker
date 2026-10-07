import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { colors } from '../theme';

// Placeholder logo: three rising bars. Replace with your real logo later.
const HEIGHTS = [16, 28, 42];

export default function Logo({ size = 96, animate = false }) {
  const bars = useRef(HEIGHTS.map(() => new Animated.Value(animate ? 0 : 1))).current;
  const k = size / 96;

  useEffect(() => {
    if (!animate) return;
    Animated.stagger(
      150,
      bars.map((b) =>
        Animated.timing(b, { toValue: 1, duration: 450, useNativeDriver: false })
      )
    ).start();
  }, []);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 42 * k }}>
        {bars.map((b, i) => (
          <Animated.View
            key={i}
            style={{
              width: 12 * k,
              marginHorizontal: 3 * k,
              borderRadius: 4 * k,
              backgroundColor: colors.white,
              height: b.interpolate({
                inputRange: [0, 1],
                outputRange: [0, HEIGHTS[i] * k],
              }),
            }}
          />
        ))}
      </View>
    </View>
  );
}