import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const DANGER = '#C0392B';

export default function TextField({ label, error, secure, style, ...props }) {
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, error && { borderColor: DANGER }]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        {secure && (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 14, color: colors.text, marginBottom: 6, fontWeight: '500' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text },
  error: { color: DANGER, fontSize: 13, marginTop: 6 },
});