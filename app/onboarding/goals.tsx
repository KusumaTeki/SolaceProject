import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { ChoiceChip } from '@/components/ChoiceChip';
import { ProgressDots } from '@/components/ProgressDots';
import { Screen } from '@/components/Screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useOnboarding } from '@/context/OnboardingContext';
import type { WellnessGoal } from '@/types/profile';

const goals: WellnessGoal[] = ['Feel calmer', 'Understand my feelings', 'Build healthy habits', 'Sleep more easily', 'Make space for myself'];
export default function GoalsScreen() {
  const { name, setName, goals: selected, toggleGoal } = useOnboarding();
  return <Screen contentStyle={styles.content}>
    <Pressable onPress={() => router.back()} style={styles.back}><ArrowLeft size={19} color={colors.ink} /><Text style={styles.backText}>Back</Text></Pressable>
    <ProgressDots step={2} />
    <Text style={styles.eyebrow}>FIRST, A LITTLE ABOUT YOU</Text>
    <Text style={styles.title}>What would feel{ '\n' }good to work on?</Text>
    <Text style={styles.copy}>Pick any that resonate. Your choices help shape your space.</Text>
    <View style={styles.chips}>{goals.map((goal) => <ChoiceChip key={goal} label={goal} selected={selected.includes(goal)} onPress={() => toggleGoal(goal)} />)}</View>
    <Text style={styles.fieldLabel}>What should we call you? <Text style={styles.optional}>OPTIONAL</Text></Text>
    <TextInput accessibilityLabel="Your name" placeholder="First name" placeholderTextColor="#A3A59B" value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="done" style={styles.input} maxLength={40} />
    <View style={styles.bottom}><AppButton onPress={() => router.push('/onboarding/preferences')} trailing>Continue</AppButton><Text style={styles.footnote}>You can change these anytime.</Text></View>
  </Screen>;
}
const styles = StyleSheet.create({ content: { paddingTop: spacing.sm }, back: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg }, backText: { color: colors.muted, fontSize: 13 }, eyebrow: { color: colors.forest, letterSpacing: 1.5, fontSize: 9, fontWeight: '700', marginTop: spacing['2xl'], marginBottom: spacing.sm }, title: { color: colors.ink, fontSize: 31, lineHeight: 37, letterSpacing: -0.7, fontWeight: '500' }, copy: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.md, maxWidth: 310 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: spacing.xl }, fieldLabel: { color: colors.ink, fontSize: 12, fontWeight: '600', marginTop: spacing['3xl'], marginBottom: spacing.sm }, optional: { color: colors.muted, fontSize: 9, letterSpacing: 1 }, input: { height: 52, paddingHorizontal: 16, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, fontSize: 14, color: colors.ink }, bottom: { marginTop: 'auto', paddingTop: spacing['3xl'] }, footnote: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 13 } });
