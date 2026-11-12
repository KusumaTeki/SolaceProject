import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

type Props = PropsWithChildren<{ onPress: () => void; variant?: 'primary' | 'secondary' | 'quiet'; loading?: boolean; disabled?: boolean; trailing?: boolean }>;
export function AppButton({ children, onPress, variant = 'primary', loading = false, disabled = false, trailing = false }: Props) {
  const primary = variant === 'primary'; const quiet = variant === 'quiet';
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, primary ? styles.primary : quiet ? styles.quiet : styles.secondary, pressed && !disabled && styles.pressed, (disabled || loading) && styles.disabled]}>
    {loading ? <ActivityIndicator color={primary ? colors.white : colors.forest} /> : <View style={styles.inner}><Text style={[styles.text, primary ? styles.primaryText : styles.secondaryText]}>{children}</Text>{trailing && <ChevronRight size={18} color={primary ? colors.white : colors.forest} />}</View>}
  </Pressable>;
}
const styles = StyleSheet.create({ button: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: spacing.xl }, primary: { backgroundColor: colors.forest }, secondary: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, quiet: { backgroundColor: 'transparent' }, pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }, disabled: { opacity: 0.5 }, inner: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, text: { fontSize: 14, lineHeight: 20, fontWeight: '600', textAlign: 'center' }, primaryText: { color: colors.white }, secondaryText: { color: colors.forest } });
