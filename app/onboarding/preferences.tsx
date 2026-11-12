import { router } from 'expo-router';
import { ArrowLeft, HeartHandshake, Lightbulb, MessagesSquare, ScanFace } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { ProgressDots } from '@/components/ProgressDots';
import { Screen } from '@/components/Screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useOnboarding } from '@/context/OnboardingContext';
import type { EmotionalPreference } from '@/types/profile';

const options: { title: EmotionalPreference; subtitle: string; icon: typeof HeartHandshake; color: string }[] = [
  { title: 'Gentle encouragement', subtitle: 'Kind words, at your pace', icon: HeartHandshake, color: colors.peachInk },
  { title: 'Practical ideas', subtitle: 'Small steps I can try', icon: Lightbulb, color: '#A07C45' },
  { title: 'A quiet place to reflect', subtitle: 'Space to sort through things', icon: MessagesSquare, color: colors.lavenderInk },
  { title: 'Help naming my feelings', subtitle: 'Words for what’s going on', icon: ScanFace, color: colors.forest },
];
export default function PreferencesScreen() {
  const { preferences, togglePreference } = useOnboarding();
  return <Screen contentStyle={styles.content}>
    <Pressable onPress={() => router.back()} style={styles.back}><ArrowLeft size={19} color={colors.ink} /><Text style={styles.backText}>Back</Text></Pressable>
    <ProgressDots step={3} />
    <Text style={styles.eyebrow}>YOUR SPACE, YOUR WAY</Text>
    <Text style={styles.title}>What feels{ '\n' }supportive to you?</Text>
    <Text style={styles.copy}>Choose what you’d like more of. There’s no wrong combination.</Text>
    <View style={styles.list}>{options.map(({ title, subtitle, icon: Icon, color }) => {
      const selected = preferences.includes(title);
      return <Pressable key={title} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => togglePreference(title)} style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}>
        <View style={[styles.icon, { backgroundColor: selected ? colors.white : colors.canvas }]}><Icon size={19} color={color} /></View>
        <View style={styles.optionText}><Text style={styles.optionTitle}>{title}</Text><Text style={styles.optionSubtitle}>{subtitle}</Text></View>
        <View style={[styles.check, selected && styles.checked]}>{selected && <View style={styles.checkInner} />}</View>
      </Pressable>;
    })}</View>
    <View style={styles.bottom}><AppButton onPress={() => router.push('/onboarding/reminder')} trailing>Continue</AppButton><Text style={styles.footnote}>Your preferences stay on this device for now.</Text></View>
  </Screen>;
}
const styles = StyleSheet.create({ content: { paddingTop: spacing.sm }, back: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg }, backText: { color: colors.muted, fontSize: 13 }, eyebrow: { color: colors.forest, letterSpacing: 1.5, fontSize: 9, fontWeight: '700', marginTop: spacing['2xl'], marginBottom: spacing.sm }, title: { color: colors.ink, fontSize: 31, lineHeight: 37, letterSpacing: -0.7, fontWeight: '500' }, copy: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.md, maxWidth: 320 }, list: { gap: 10, marginTop: spacing.xl }, option: { minHeight: 76, borderRadius: 18, backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, optionSelected: { borderColor: colors.forest, backgroundColor: colors.sage }, pressed: { opacity: 0.8 }, icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, optionText: { flex: 1 }, optionTitle: { color: colors.ink, fontSize: 13, fontWeight: '600' }, optionSubtitle: { color: colors.muted, fontSize: 10, marginTop: 4 }, check: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#D4D6CE', alignItems: 'center', justifyContent: 'center' }, checked: { borderColor: colors.forest, backgroundColor: colors.forest }, checkInner: { width: 6, height: 6, backgroundColor: colors.white, borderRadius: 3 }, bottom: { marginTop: 'auto', paddingTop: spacing.xl }, footnote: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 13 } });
