import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Button({ title, onPress, loading, disabled, style }) {
  const off = loading || disabled;
  return (
    <TouchableOpacity
      style={[styles.btn, off && { opacity: 0.6 }, style]}
      onPress={onPress}
      disabled={off}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: colors.white, fontSize: 17, fontWeight: '600' },
});