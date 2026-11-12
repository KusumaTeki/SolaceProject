import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ArrowUpRight, ChevronRight, Flower2, Heart, MoonStar, Sparkles, Sun } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { Surface } from '@/components/Surface';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getProfile } from '@/services/profileStorage';

const today = new Date();
const todayIndex = (today.getDay() + 6) % 7;
const sampleScores = [3, 4, 2, 3, 4, 2, 3];
const week = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(today);
  date.setDate(today.getDate() - todayIndex + index);
  return {
    day: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date).slice(0, 1),
    score: index <= todayIndex ? sampleScores[index] : 0,
  };
});
const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase();

function SectionLabel({ children }: { children: string }) { return <Text style={styles.sectionLabel}>{children}</Text>; }

export default function HomeScreen() {
  const [name, setName] = useState('');
  useEffect(() => { getProfile().then((profile) => setName(profile?.name ?? '')).catch(() => setName('')); }, []);
  const greeting = name ? `A little space,\n${name}.` : 'A little space\nfor you.';
  return <Screen contentStyle={styles.content}>
    <View style={styles.topline}>
      <View style={styles.heading}><Text style={styles.eyebrow}>{dateLabel}</Text><Text style={styles.greeting}>{greeting}</Text></View>
      <View style={styles.avatar}><Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : <Heart size={17} color={colors.forest} />}</Text></View>
    </View>

    <LinearGradient colors={['#E5EDE2', '#EEF0E8']} style={styles.checkin}>
      <View style={styles.checkinTop}><View style={styles.iconWash}><Sparkles size={16} color={colors.forest} /></View><Text style={styles.kicker}>A MOMENT TO CHECK IN</Text></View>
      <Text style={styles.cardTitle}>How are you arriving{ '\n' }in this moment?</Text>
      <Text style={styles.cardBody}>There’s no right answer. Just notice what’s here.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push('/mood')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonText}>Check in with yourself</Text><ArrowUpRight size={16} color={colors.white} />
      </Pressable>
      <View style={styles.orbOne} /><View style={styles.orbTwo} />
    </LinearGradient>

    <View style={styles.sectionHeader}><SectionLabel>GENTLE STARTS</SectionLabel><Text style={styles.smallNote}>Choose what feels right</Text></View>
    <View style={styles.actionsRow}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/companion')} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
        <View style={[styles.actionIcon, { backgroundColor: colors.peach }]}><Flower2 size={18} color={colors.peachInk} /></View>
        <ChevronRight size={15} color={colors.muted} style={styles.actionArrow} /><Text style={styles.actionTitle}>Talk it out</Text><Text style={styles.actionCaption}>A listening ear</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.push('/breathe')} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
        <View style={[styles.actionIcon, { backgroundColor: colors.lavender }]}><MoonStar size={18} color={colors.lavenderInk} /></View>
        <ChevronRight size={15} color={colors.muted} style={styles.actionArrow} /><Text style={styles.actionTitle}>Take a breath</Text><Text style={styles.actionCaption}>Find your pace</Text>
      </Pressable>
    </View>

    <Surface style={styles.weekCard}>
      <View style={styles.weekHeader}><View><SectionLabel>YOUR WEEK, AT A GLANCE</SectionLabel><Text style={styles.weekTitle}>A little more steady</Text></View><View style={styles.weekIcon}><Sun size={17} color="#A07C45" /></View></View>
      <Text style={styles.chartContext}>Sample week · Mood check-ins</Text>
      <View style={styles.chart} accessibilityLabel="Sample mood trend for this week; future days have no entries">
        {week.map((item, index) => <View key={`${item.day}-${index}`} style={styles.barColumn}>
          <View style={styles.barArea}>{item.score > 0 && <View style={[styles.bar, { height: item.score * 19 }, index === 4 && styles.todayBar]} />}</View>
          <Text style={[styles.dayLabel, index === todayIndex && styles.todayLabel]}>{item.day}</Text>
        </View>)}
      </View>
      <View style={styles.weekFooter}><Text style={styles.weekFootnote}>Some days, just noticing is enough.</Text><Text style={styles.sampleTag}>PREVIEW DATA</Text></View>
    </Surface>

    <View style={styles.reflection}>
      <View style={styles.reflectionIcon}><Text style={styles.sunGlyph}>✳</Text></View>
      <View style={styles.reflectionBody}><SectionLabel>A THOUGHT FOR TODAY</SectionLabel><Text style={styles.reflectionText}>You don’t have to have it all figured out to take the next small step.</Text></View>
    </View>

    <View style={styles.note}><Text style={styles.noteText}>Solace supports your wellbeing and does not replace professional care.</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 24 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 21 }, heading: { flex: 1 },
  eyebrow: { fontSize: 9, letterSpacing: 1.45, color: colors.muted, fontWeight: '700', marginBottom: 9 },
  greeting: { fontSize: 32, lineHeight: 37, letterSpacing: -1.1, color: colors.ink, fontWeight: '500' },
  avatar: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#E3E9DE', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D5DED0', marginLeft: 12 },
  avatarText: { color: colors.forest, fontSize: 14, fontWeight: '600' },
  checkin: { borderRadius: 25, padding: 20, overflow: 'hidden', marginBottom: 25, minHeight: 232 },
  checkinTop: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 15, zIndex: 1 },
  iconWash: { width: 29, height: 29, borderRadius: 15, backgroundColor: '#F8F7F0', alignItems: 'center', justifyContent: 'center' },
  kicker: { fontSize: 9, letterSpacing: 1.3, color: colors.forest, fontWeight: '700' },
  cardTitle: { fontSize: 23, lineHeight: 28, letterSpacing: -0.5, color: colors.ink, fontWeight: '500', marginBottom: 7, zIndex: 1 },
  cardBody: { color: '#697269', fontSize: 11, lineHeight: 17, marginBottom: 16, zIndex: 1 },
  primaryButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.forest, borderRadius: 24, paddingVertical: 11, paddingHorizontal: 15, zIndex: 1 },
  primaryButtonText: { fontSize: 11, color: colors.white, fontWeight: '600' }, pressed: { opacity: 0.78 },
  orbOne: { position: 'absolute', width: 144, height: 144, borderRadius: 72, right: -62, top: 25, backgroundColor: 'rgba(255,255,255,0.18)' },
  orbTwo: { position: 'absolute', width: 88, height: 88, borderRadius: 44, right: 17, top: 102, backgroundColor: 'rgba(255,255,255,0.13)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  sectionLabel: { fontSize: 9, letterSpacing: 1.35, color: colors.muted, fontWeight: '700' }, smallNote: { fontSize: 9, color: '#9A9D93' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 19 },
  actionCard: { flex: 1, minHeight: 106, borderRadius: 18, padding: 13, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  actionIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionTitle: { color: colors.ink, fontSize: 12, fontWeight: '600', marginBottom: 2 }, actionCaption: { color: colors.muted, fontSize: 9 }, actionArrow: { position: 'absolute', top: 16, right: 12 },
  weekCard: { padding: 17, marginBottom: 17 }, weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekTitle: { color: colors.ink, fontSize: 16, lineHeight: 22, fontWeight: '600', marginTop: 6 }, weekIcon: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#F3EEE3', alignItems: 'center', justifyContent: 'center' },
  chartContext: { color: '#9A9D93', fontSize: 9, marginTop: 3 }, chart: { flexDirection: 'row', height: 100, marginTop: 5 },
  barColumn: { flex: 1, alignItems: 'center' }, barArea: { height: 78, justifyContent: 'flex-end', alignItems: 'center', width: '100%' }, bar: { width: 17, maxWidth: '62%', borderRadius: 9, backgroundColor: '#CBD9C7' }, todayBar: { backgroundColor: colors.forest },
  dayLabel: { color: '#A0A297', fontSize: 9, marginTop: 7 }, todayLabel: { color: colors.forest, fontWeight: '700' },
  weekFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 11, marginTop: 4 },
  weekFootnote: { color: colors.muted, fontSize: 9 }, sampleTag: { color: '#8A8C82', fontSize: 7, letterSpacing: 0.8, fontWeight: '700', backgroundColor: '#F2F0E8', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  reflection: { flexDirection: 'row', gap: 12, padding: 15, borderRadius: 19, backgroundColor: '#F1EFE7', marginBottom: 14 },
  reflectionIcon: { width: 31, height: 31, borderRadius: 11, backgroundColor: '#E6DFD0', alignItems: 'center', justifyContent: 'center' }, sunGlyph: { color: '#A37E45', fontSize: 18 },
  reflectionBody: { flex: 1 }, reflectionText: { color: colors.ink, fontSize: 12, lineHeight: 18, marginTop: 7, paddingRight: 2 },
  note: { paddingHorizontal: 14, paddingVertical: 5 }, noteText: { textAlign: 'center', color: '#A0A297', fontSize: 9, lineHeight: 14 },
});
