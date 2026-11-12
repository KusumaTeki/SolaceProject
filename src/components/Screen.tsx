import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

type Props = PropsWithChildren<{ scroll?: boolean; bottomInset?: boolean; contentStyle?: object }>;
export function Screen({ children, scroll = true, bottomInset = true, contentStyle }: Props) {
  const { width } = useWindowDimensions();
  const horizontal = Math.min(28, Math.max(20, width * 0.058));
  return <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
    {scroll ? <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: horizontal, paddingBottom: bottomInset ? 30 : 16 }, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      : <View style={[styles.content, { paddingHorizontal: horizontal }, contentStyle]}>{children}</View>}
  </SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { flexGrow: 1, paddingTop: 16 } });
