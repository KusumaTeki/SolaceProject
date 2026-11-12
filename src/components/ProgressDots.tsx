import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
export function ProgressDots({ step, total = 4 }: { step: number; total?: number }) {
  return <View accessibilityLabel={`Step ${step} of ${total}`} style={styles.row}>{Array.from({ length: total }, (_, index) => <View key={index} style={[styles.dot, index + 1 === step && styles.active, index + 1 < step && styles.done]} />)}</View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 6, alignItems: 'center' }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D8D9D2' }, active: { width: 23, backgroundColor: colors.forest }, done: { backgroundColor: '#A8B9A8' } });
