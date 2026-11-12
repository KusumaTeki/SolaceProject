import { Pressable, StyleSheet, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
export function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
    {selected && <Check size={15} color={colors.forest} />}<Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ chip: { flexDirection: 'row', minHeight: 46, alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 15, borderRadius: radius.pill, backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1 }, selected: { backgroundColor: colors.sage, borderColor: colors.forest }, label: { color: colors.ink, fontSize: 13, fontWeight: '500' }, selectedLabel: { color: colors.forestDeep, fontWeight: '600' }, pressed: { opacity: 0.78 } });
