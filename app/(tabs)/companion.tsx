import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
export default function CompanionScreen() {
  return <SafeAreaView style={styles.page}><Text style={styles.label}>A LISTENING SPACE</Text><Text style={styles.title}>Your companion</Text><Text style={styles.copy}>Bring whatever’s on your mind. We can take it one thought at a time.</Text><View style={styles.card}><Text style={styles.cardTitle}>Conversation is being prepared</Text><Text style={styles.copy}>The next phase will connect this space to a private, context-aware wellness conversation.</Text></View></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.canvas, padding: 24, paddingTop: 46 }, label: { color: colors.muted, letterSpacing: 1.5, fontSize: 10, fontWeight: '700' }, title: { color: colors.ink, fontSize: 32, marginTop: 12, fontWeight: '500' }, copy: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 9 }, card: { marginTop: 28, padding: 20, borderRadius: 20, backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1 }, cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '600' } });
