import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '@/theme/colors';
import { getProfile } from '@/services/profileStorage';

export default function EntryRoute() {
  const [destination, setDestination] = useState<'onboarding' | '(tabs)' | null>(null);
  useEffect(() => {
    getProfile().then((profile) => setDestination(profile?.onboardingComplete ? '(tabs)' : 'onboarding')).catch(() => setDestination('onboarding'));
  }, []);
  if (destination) return <Redirect href={destination === '(tabs)' ? '/(tabs)' : '/onboarding'} />;
  return <View style={styles.container}><View style={styles.mark}><Text style={styles.markText}>s</Text></View><Text style={styles.name}>solace</Text><ActivityIndicator color={colors.forest} style={styles.loader} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas }, mark: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage }, markText: { color: colors.forest, fontSize: 34, fontWeight: '500', fontStyle: 'italic' }, name: { color: colors.ink, fontSize: 22, letterSpacing: 1, marginTop: 12, fontWeight: '500' }, loader: { marginTop: 24 } });
