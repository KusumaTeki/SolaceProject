import { router } from 'expo-router';
import { ArrowUpRight, Heart, Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { AppButton } from '@/components/AppButton';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function WelcomeScreen() {
  const { height } = useWindowDimensions();
  return <Screen contentStyle={styles.content}>
    <View style={styles.brand}><View style={styles.brandMark}><Heart size={17} color={colors.forest} fill={colors.sageDark} /></View><Text style={styles.brandName}>solace</Text></View>
    <View style={[styles.artWrap, { minHeight: Math.min(300, Math.max(220, height * 0.35)) }]}>
      <LinearGradient colors={['#E7EDE2', '#F1ECE5', '#EAE8F0']} style={styles.art}>
        <View style={styles.sun} /><View style={styles.hillBack} /><View style={styles.hillFront} />
        <View style={styles.artCaption}><Sparkles size={14} color={colors.forest} /><Text style={styles.artCaptionText}>a softer place to land</Text></View>
      </LinearGradient>
    </View>
    <Text style={styles.eyebrow}>YOUR WELLNESS, AT YOUR PACE</Text>
    <Text style={styles.title}>Come as you{ '\n' }are.</Text>
    <Text style={styles.copy}>A little space to notice how you feel, find your footing, and take the next small step.</Text>
    <View style={styles.bottom}><AppButton onPress={() => router.push('/onboarding/goals')} trailing>Get started</AppButton><Text style={styles.privacy}>Your reflections stay yours. You’re always in control.</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({ content: { paddingTop: spacing.md }, brand: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: spacing.lg }, brandMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }, brandName: { fontSize: 18, letterSpacing: 0.4, color: colors.ink, fontWeight: '500' }, artWrap: { width: '100%', marginBottom: spacing.xl }, art: { flex: 1, minHeight: 220, borderRadius: 30, overflow: 'hidden' }, sun: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: '#F9F3E5', top: '13%', alignSelf: 'center', opacity: 0.9 }, hillBack: { position: 'absolute', height: '45%', left: '-10%', right: '-12%', bottom: '7%', borderRadius: 160, backgroundColor: '#CBD8C8', transform: [{ rotate: '-8deg' }] }, hillFront: { position: 'absolute', height: '39%', left: '-14%', right: '-10%', bottom: '-10%', borderRadius: 150, backgroundColor: '#A9BEA8', transform: [{ rotate: '5deg' }] }, artCaption: { position: 'absolute', left: 18, bottom: 18, flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: 'rgba(255,253,249,0.83)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }, artCaptionText: { color: colors.forestDeep, fontSize: 11, fontWeight: '500' }, eyebrow: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.6, marginBottom: spacing.sm }, title: { color: colors.ink, fontSize: 42, lineHeight: 47, letterSpacing: -1.4, fontWeight: '500' }, copy: { color: '#737A71', fontSize: 14, lineHeight: 22, marginTop: spacing.md, maxWidth: 330 }, bottom: { marginTop: 'auto', paddingTop: spacing['3xl'] }, privacy: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 14 } });
