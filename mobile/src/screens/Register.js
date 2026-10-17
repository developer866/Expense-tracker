import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { colors, APP_NAME } from '../theme';
import { useAuth } from '../context/Authcontext';
import { registerRequest } from '../api/client';

export default function Register({ onBack, onLogin, onSuccess }) {
  const auth = useAuth?.();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errs.name = 'Full name is required';
    } else if (trimmedName.length > 80) {
      errs.name = 'Name must be 80 characters or fewer';
    }

    if (!trimmedEmail) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else if (password.length > 72) {
      errs.password = 'Password must be 72 characters or fewer';
    }

    // if (!confirmPassword) {
    //   errs.confirmPassword = 'Please confirm your password';
    // } else if (password !== confirmPassword) {
    //   errs.confirmPassword = 'Passwords do not match';
    // }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      if (auth?.register) {
        await auth.register(payload);
      } else {
        await registerRequest(payload);
      }

      Alert.alert(
        'Account Created',
        `Welcome to ${APP_NAME}! Your account has been registered successfully.`,
        [
          {
            text: 'Get Started',
            onPress: () => {
              if (onSuccess) onSuccess();
              else if (onBack) onBack();
            },
          },
        ]
      );
    } catch (err) {
      if (err?.fields && typeof err.fields === 'object') {
        setErrors((prev) => ({ ...prev, ...err.fields }));
      }
      const message = err?.message || 'Unable to register. Please check your details and try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{APP_NAME}</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Sign up to track your expenses, manage budgets, and achieve your financial goals.
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="Full Name"
              placeholder="e.g. Ayeni Joseph"
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError('name');
              }}
              autoCapitalize="words"
              error={errors.name}
            />

            <TextField
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <TextField
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError('password');
              }}
              secure
              error={errors.password}
            />

            <TextField
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError('confirmPassword');
              }}
              secure
              error={errors.confirmPassword}
            />

            <Button
              title="Create account"
              onPress={handleRegister}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onLogin || onBack} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted,
  },
  backPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  form: {
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 15,
    color: colors.muted,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});