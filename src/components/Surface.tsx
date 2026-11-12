import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
export function Surface({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) { return <View style={[styles.surface, style]}>{children}</View>; }
const styles = StyleSheet.create({ surface: { backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1, borderRadius: radius.lg, padding: spacing.xl } });
