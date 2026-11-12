import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ArrowLeft, Bell, Check } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { ProgressDots } from '@/components/ProgressDots';
import { Screen } from '@/components/Screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useOnboarding } from '@/context/OnboardingContext';

const times = ['8:00 AM', '12:00 PM', '8:00 PM'];
export default function ReminderScreen() {
  const { reminderEnabled, setReminderEnabled, reminderTime, setReminderTime, finish } = useOnboarding();
  const [saving, setSaving] = useState(false);
  const complete = async (skipReminder = false) => {
    setSaving(true);
    try { await finish(skipReminder ? false : undefined); router.replace('/(tabs)'); }
    catch { Alert.alert('Could not save your setup', 'Please try again. Your choices have not been saved yet.'); }
    finally { setSaving(false); }
  };
  return <Screen contentStyle={styles.content}>
    <Pressable onPress={() => router.back()} style={styles.back}><ArrowLeft size={19} color={colors.ink} /><Text style={styles.backText}>Back</Text></Pressable>
    <ProgressDots step={4} />
    <View style={styles.hero}><View style={styles.bell}><Bell size={23} color={colors.forest} /></View></View>
    <Text style={styles.eyebrow}>A GENTLE NUDGE, IF YOU’D LIKE</Text>
    <Text style={styles.title}>Make a little{ '\n' }space in your day.</Text>
    <Text style={styles.copy}>Would a daily reminder help you pause and check in? You can change this anytime.</Text>
    <View style={styles.toggleCard}>
      <View style={styles.toggleCopy}><Text style={styles.toggleTitle}>Daily reminder</Text><Text style={styles.toggleSub}>Choose a time that suits you</Text></View>
      <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: '#D9DBD3', true: '#9DB39F' }} thumbColor={colors.white} accessibilityLabel="Enable daily reminder" />
    </View>
    {reminderEnabled && <View style={styles.timeChoices}>{times.map((time) => {
      const selected = reminderTime === time;
      return <Pressable key={time} onPress={() => setReminderTime(time)} style={[styles.time, selected && styles.timeSelected]} accessibilityRole="radio" accessibilityState={{ selected }}>
        <Text style={[styles.timeText, selected && styles.timeTextSelected]}>{time}</Text>{selected && <Check size={14} color={colors.forest} />}
      </Pressable>;
    })}</View>}
    {reminderEnabled && <Text style={styles.disclaimer}>This saves your preferred time on this device. Notifications will be available in a later update.</Text>}
    <View style={styles.bottom}><AppButton onPress={() => complete()} loading={saving}>Let’s begin</AppButton><Pressable onPress={() => complete(true)} disabled={saving} style={styles.skip}><Text style={styles.skipText}>I’ll decide later</Text></Pressable></View>
  </Screen>;
}
const styles = StyleSheet.create({ content: { paddingTop: spacing.sm }, back: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg }, backText: { color: colors.muted, fontSize: 13 }, hero: { height: 94, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg }, bell: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }, eyebrow: { color: colors.forest, letterSpacing: 1.5, fontSize: 9, fontWeight: '700', marginTop: spacing.xl, marginBottom: spacing.sm }, title: { color: colors.ink, fontSize: 31, lineHeight: 37, letterSpacing: -0.7, fontWeight: '500' }, copy: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.md }, toggleCard: { marginTop: spacing.xl, paddingHorizontal: 16, minHeight: 72, borderRadius: 18, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center' }, toggleCopy: { flex: 1 }, toggleTitle: { color: colors.ink, fontSize: 13, fontWeight: '600' }, toggleSub: { color: colors.muted, fontSize: 10, marginTop: 4 }, timeChoices: { flexDirection: 'row', gap: 8, marginTop: 12 }, time: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 14, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, timeSelected: { backgroundColor: colors.sage, borderColor: colors.forest }, timeText: { color: colors.muted, fontSize: 11 }, timeTextSelected: { color: colors.forestDeep, fontWeight: '600' }, disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 10 }, bottom: { marginTop: 'auto', paddingTop: spacing.xl }, skip: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 4 }, skipText: { color: colors.muted, fontSize: 12, fontWeight: '500' } });
