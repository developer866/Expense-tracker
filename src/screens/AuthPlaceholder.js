import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { colors, APP_NAME } from '../theme';


export default function AuthPlaceholder({ onReplayOnboarding }) {
  const soon = () => Alert.alert('Coming next', 'Login and register are the next step.');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Logo size={80} />
        <Text style={styles.title}>{APP_NAME}</Text>
      </View>
      <TouchableOpacity style={styles.primary} onPress={soon}>
        <Text style={styles.primaryText}>Create account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondary} onPress={soon}>
        <Text style={styles.secondaryText}>I already have an account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onReplayOnboarding} style={{ padding: 16 }}>
        <Text style={styles.dev}>Dev: replay onboarding</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 20, fontSize: 26, fontWeight: '700', color: colors.text },
  primary: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  primaryText: { color: colors.white, fontSize: 17, fontWeight: '600' },
  secondary: { marginTop: 12, paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  secondaryText: { color: colors.text, fontSize: 16 },
  dev: { textAlign: 'center', color: colors.muted, fontSize: 13 },
});