import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthPlaceholder from './src/screens/AuthPlaceholder';
import Register from './src/screens/Register';
import { AuthProvider } from './src/context/Authcontext';

const MIN_SPLASH_MS = 2200;
const SEEN_KEY = 'hasSeenOnboarding';

export default function App() {
  const [stage, setStage] = useState('splash'); // splash | onboarding | auth | register

  useEffect(() => {
    let alive = true;
    (async () => {
      // Run the storage check and the minimum splash time together
      const [seen] = await Promise.all([
        AsyncStorage.getItem(SEEN_KEY),
        new Promise((r) => setTimeout(r, MIN_SPLASH_MS)),
      ]);
      if (alive) setStage(seen === 'true' ? 'auth' : 'onboarding');
    })();
    return () => { alive = false; };
  }, []);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(SEEN_KEY, 'true');
    setStage('auth');
  };

  const replayOnboarding = async () => {
    await AsyncStorage.removeItem(SEEN_KEY);
    setStage('onboarding');
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        {stage === 'splash' && <SplashScreen />}
        {stage === 'onboarding' && <OnboardingScreen onDone={finishOnboarding} />}
        {stage === 'auth' && (
          <AuthPlaceholder
            onRegister={() => setStage('register')}
            onReplayOnboarding={replayOnboarding}
          />
        )}
        {stage === 'register' && (
          <Register
            onBack={() => setStage('auth')}
            onSuccess={() => setStage('auth')}
          />
        )}
      </AuthProvider>
    </SafeAreaProvider>
  );
}