import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, Animated, TouchableOpacity, StyleSheet, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

const SLIDES = [
  { id: '1', icon: 'flash-outline', title: 'Log in 5 seconds', text: 'Type what you spent and the amount. We work out the rest.' },
  { id: '2', icon: 'wallet-outline', title: 'A budget that fits you', text: 'Build your own, or let us generate one from your salary.' },
  { id: '3', icon: 'calendar-outline', title: 'See every day in colour', text: 'Green when you are on track, red when you overspend.' },
];

export default function OnboardingScreen({ onDone }) {
  const { width } = useWindowDimensions();
  const listRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const next = () => {
  if (isLast) return onDone();
  const nextIndex = index + 1;
  const list = listRef.current?.getNode?.() ?? listRef.current;
  list?.scrollToOffset({ offset: width * nextIndex, animated: true });
  setIndex(nextIndex); // update right away instead of waiting for the swipe to finish
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        {!isLast && (
          <TouchableOpacity onPress={onDone} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={72} color={colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const range = [(i - 1) * width, i * width, (i + 1) * width];
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: scrollX.interpolate({ inputRange: range, outputRange: [8, 24, 8], extrapolate: 'clamp' }),
                  opacity: scrollX.interpolate({ inputRange: range, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' }),
                },
              ]}
            />
          );
        })}
      </View>

      <TouchableOpacity style={styles.btn} onPress={next} activeOpacity={0.85}>
        <Text style={styles.btnText}>{isLast ? 'Get started' : 'Next'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  top: { height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 24 },
  skip: { color: colors.muted, fontSize: 16 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 ,paddingVertical:150},
  iconWrap: {
    width: 160, height: 160, borderRadius: 80, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  title: { marginTop: 36, fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center' },
  text: { marginTop: 12, fontSize: 16, lineHeight: 24, color: colors.muted, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 24 },
  dot: { height: 8, borderRadius: 4, backgroundColor: colors.primary, marginHorizontal: 4 },
  btn: {
    backgroundColor: colors.primary, marginHorizontal: 24, marginVertical: 20,
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '600' },
});