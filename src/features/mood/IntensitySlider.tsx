import { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

export function IntensitySlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const track = useRef<React.ElementRef<typeof View>>(null);
  const bounds = useRef({ x: 0, width: 1 });
  const measure = () => track.current?.measureInWindow((x, _y, width) => { bounds.current = { x, width: Math.max(width, 1) }; });
  const updateFromPageX = (pageX: number) => {
    const ratio = Math.max(0, Math.min(1, (pageX - bounds.current.x) / bounds.current.width));
    onChange(Math.max(1, Math.min(10, Math.round(ratio * 9) + 1)));
  };
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: (_event, gesture) => updateFromPageX(gesture.x0),
    onPanResponderMove: (_event, gesture) => updateFromPageX(gesture.moveX),
  }), []);

  return <View style={styles.container}>
    <View ref={track} collapsable={false} onLayout={measure} {...panResponder.panHandlers} accessibilityRole="adjustable" accessibilityLabel="Mood intensity" accessibilityValue={{ min: 1, max: 10, now: value }} style={styles.touchTarget}>
      <View style={styles.track}><View style={[styles.fill, { width: `${((value - 1) / 9) * 100}%` }]} /><View style={[styles.thumb, { left: `${((value - 1) / 9) * 100}%` }]} /></View>
    </View>
    <View style={styles.labels}><Text style={styles.label}>A little</Text><Text style={styles.value}>{value}<Text style={styles.outOf}> / 10</Text></Text><Text style={styles.label}>A lot</Text></View>
  </View>;
}

const styles = StyleSheet.create({ container: { marginTop: 9 }, touchTarget: { height: 38, justifyContent: 'center' }, track: { height: 5, borderRadius: 3, backgroundColor: '#E6E6DE', justifyContent: 'center' }, fill: { position: 'absolute', left: 0, height: 5, borderRadius: 3, backgroundColor: colors.forest }, thumb: { position: 'absolute', width: 22, height: 22, borderRadius: 11, marginLeft: -11, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 2, shadowColor: '#24372B', shadowOpacity: 0.12, shadowRadius: 5, elevation: 2 }, labels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }, label: { color: colors.muted, fontSize: 10 }, value: { color: colors.forestDeep, fontSize: 13, fontWeight: '700' }, outOf: { color: colors.muted, fontSize: 10, fontWeight: '400' } });
