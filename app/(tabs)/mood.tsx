import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, ArrowRight, Check, CloudSun, Heart, Info, Save } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { Surface } from '@/components/Surface';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { IntensitySlider } from '@/features/mood/IntensitySlider';
import { addMoodEntry, getMoodEntries } from '@/features/mood/moodStorage';
import { averageIntensity, fromDateKey, getLastSevenDays, getMonthCells, getMoodLabel, toDateKey } from '@/features/mood/moodUtils';
import { moodOptions, type MoodEntry, type MoodId } from '@/features/mood/types';

const todayKey = toDateKey(new Date());
const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const monthFormatter = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });
const selectedDateFormatter = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' });

export default function MoodScreen() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    getMoodEntries()
      .then(setEntries)
      .catch(() => setLoadError('Your saved check-ins could not be loaded. Please close and reopen this screen.'))
      .finally(() => setLoading(false));
  }, []);

  const monthCells = useMemo(() => getMonthCells(visibleMonth.getFullYear(), visibleMonth.getMonth()), [visibleMonth]);
  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, MoodEntry[]>();
    entries.forEach((entry) => grouped.set(entry.dateKey, [...(grouped.get(entry.dateKey) ?? []), entry]));
    return grouped;
  }, [entries]);
  const selectedEntries = entriesByDate.get(selectedDateKey) ?? [];
  const trend = useMemo(() => getLastSevenDays(entries), [entries]);
  const weekEntries = entries.filter((entry) => trend.some((day) => day.dateKey === entry.dateKey));
  const weeklyAverage = averageIntensity(weekEntries);

  const selectMood = (id: MoodId) => {
    setSelectedMood(id);
    setValidationError('');
    setSavedMessage('');
  };

  const saveCheckIn = async () => {
    if (!selectedMood) {
      setValidationError('Choose the feeling that fits best before saving.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setValidationError('');
    setSavedMessage('');
    const entry: MoodEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mood: selectedMood,
      intensity,
      note: note.trim(),
      dateKey: todayKey,
      createdAt: new Date().toISOString(),
    };
    try {
      const next = await addMoodEntry(entry);
      setEntries(next);
      setSelectedDateKey(todayKey);
      setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
      setSavedMessage(`Check-in saved: ${getMoodLabel(entry.mood).toLowerCase()}, ${entry.intensity} out of 10.`);
      setSelectedMood(null);
      setIntensity(5);
      setNote('');
    } catch {
      setSaveError('We couldn’t save this check-in. Your entry is still here; please try again.');
    } finally {
      setSaving(false);
    }
  };

  const moveMonth = (delta: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  return <Screen contentStyle={styles.content}>
    <View style={styles.header}>
      <View style={styles.headerIcon}><CloudSun size={20} color={colors.forest} /></View>
      <Text style={styles.eyebrow}>YOUR INNER WEATHER</Text>
    </View>
    <Text style={styles.title}>Mood check-in</Text>
    <Text style={styles.intro}>A moment to notice what’s here, just as it is.</Text>

    <Surface style={styles.formCard}>
      <View style={styles.formHeading}>
        <View style={{ flex: 1 }}><Text style={styles.formTitle}>How are you feeling?</Text><Text style={styles.formDate}>Today · {selectedDateFormatter.format(new Date())}</Text></View>
        <View style={styles.heartWash}><Heart size={16} color={colors.peachInk} /></View>
      </View>

      <View style={styles.moodGrid}>
        {moodOptions.map((mood) => {
          const selected = selectedMood === mood.id;
          return <Pressable key={mood.id} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={`${mood.label}, ${mood.intensityLabel}`} onPress={() => selectMood(mood.id)} style={({ pressed }) => [styles.moodChoice, { backgroundColor: selected ? mood.color : colors.canvas, borderColor: selected ? mood.ink : 'transparent' }, pressed && styles.pressed]}>
            <Text style={styles.moodEmoji}>{mood.face}</Text>
            <Text numberOfLines={1} style={[styles.moodLabel, selected && { color: mood.ink }]}>{mood.label}</Text>
            {selected && <View style={[styles.selectedCheck, { backgroundColor: mood.ink }]}><Check size={11} color={colors.white} /></View>}
          </Pressable>;
        })}
      </View>
      {!!validationError && <Text accessibilityRole="alert" style={styles.validation}>{validationError}</Text>}

      <View style={styles.intensityHeading}><Text style={styles.fieldTitle}>How strong is that feeling?</Text><Text style={styles.intensityHint}>1 is subtle · 10 is intense</Text></View>
      <IntensitySlider value={intensity} onChange={setIntensity} />

      <View style={styles.noteHeading}><Text style={styles.fieldTitle}>Anything around it?</Text><Text style={styles.optional}>OPTIONAL</Text></View>
      <TextInput accessibilityLabel="Optional context or note" placeholder="A thought, moment, or small detail…" placeholderTextColor="#A0A297" value={note} onChangeText={(value) => { setNote(value); setSavedMessage(''); }} multiline maxLength={300} textAlignVertical="top" style={styles.noteInput} />
      <Text style={styles.charCount}>{note.length}/300</Text>

      {!!saveError && <Text accessibilityRole="alert" style={styles.errorText}>{saveError}</Text>}
      <AppButton onPress={saveCheckIn} loading={saving} trailing>Save check-in</AppButton>
    </Surface>

    {!!savedMessage && <View accessibilityRole="alert" style={styles.success}><View style={styles.successIcon}><Check size={14} color={colors.forestDeep} /></View><Text style={styles.successText}>{savedMessage}</Text></View>}
    {!!loadError && <View style={styles.errorBox}><Info size={16} color={colors.danger} /><Text style={styles.errorText}>{loadError}</Text></View>}

    <View style={styles.sectionHeading}><View><Text style={styles.sectionLabel}>A GENTLE LOOK BACK</Text><Text style={styles.sectionTitle}>Your week</Text></View><Text style={styles.weeklyAvg}>{weeklyAverage === null ? '—' : `${weeklyAverage}/10`}</Text></View>
    <Surface style={styles.trendCard}>
      <View style={styles.trendHeading}><Text style={styles.cardTitle}>Mood intensity</Text><Text style={styles.trendLegend}>DAILY AVERAGE</Text></View>
      {weekEntries.length === 0 ? <View style={styles.chartEmpty}><View style={styles.emptyGlyph}><CloudSun size={20} color={colors.forest} /></View><Text style={styles.emptyTitle}>Your week will take shape here</Text><Text style={styles.emptyCopy}>Save a check-in and your mood pattern will appear.</Text></View> : <>
        <View style={styles.chart} accessibilityLabel="Daily average mood intensity for the last seven days, from one to ten">
          {trend.map((day, index) => <View key={day.dateKey} style={styles.chartColumn}>
            <View style={styles.chartBarSpace}>
              {day.average !== null && <View style={[styles.chartBar, { height: `${day.average * 10}%` }, index === 6 && styles.chartBarToday]} />}
            </View>
            <Text style={[styles.chartDay, index === 6 && styles.chartDayToday]}>{day.day}</Text>
          </View>)}
        </View>
        <View style={styles.trendFoot}><Text style={styles.trendFootnote}>Intensity, from 1 to 10</Text><Text style={styles.entryCount}>{weekEntries.length} {weekEntries.length === 1 ? 'check-in' : 'check-ins'}</Text></View>
      </>}
    </Surface>

    <View style={styles.sectionHeading}><View><Text style={styles.sectionLabel}>YOUR CHECK-IN HISTORY</Text><Text style={styles.sectionTitle}>Calendar</Text></View><Text style={styles.historyTotal}>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</Text></View>
    <Surface style={styles.calendarCard}>
      <View style={styles.monthHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => moveMonth(-1)} hitSlop={12} style={styles.monthArrow}><ArrowLeft size={17} color={colors.forest} /></Pressable>
        <Text style={styles.monthTitle}>{monthFormatter.format(visibleMonth)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => moveMonth(1)} hitSlop={12} style={styles.monthArrow}><ArrowRight size={17} color={colors.forest} /></Pressable>
      </View>
      <View style={styles.calendarGrid}>
        {weekdays.map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}
        {monthCells.map((cell, index) => {
          if (!cell) return <View key={`blank-${index}`} style={styles.dayCell} />;
          const isSelected = selectedDateKey === cell.dateKey;
          const isToday = todayKey === cell.dateKey;
          const dayEntries = entriesByDate.get(cell.dateKey) ?? [];
          return <Pressable key={cell.dateKey} accessibilityRole="button" accessibilityLabel={`${selectedDateFormatter.format(fromDateKey(cell.dateKey))}${dayEntries.length ? `, ${dayEntries.length} check-ins` : ', no check-ins'}`} accessibilityState={{ selected: isSelected }} onPress={() => setSelectedDateKey(cell.dateKey)} style={({ pressed }) => [styles.dayCell, isSelected && styles.daySelected, isToday && !isSelected && styles.dayToday, pressed && styles.pressed]}>
            <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected, isToday && !isSelected && styles.dayNumberToday]}>{cell.day}</Text>
            {dayEntries.length > 0 && <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />}
          </Pressable>;
        })}
      </View>
    </Surface>

    <View style={styles.selectedDayHeading}><Text style={styles.selectedDayTitle}>{selectedDateFormatter.format(fromDateKey(selectedDateKey))}</Text>{selectedDateKey === todayKey && <Text style={styles.todayPill}>TODAY</Text>}</View>
    {loading ? <Surface style={styles.historyEmpty}><Text style={styles.emptyCopy}>Loading your private check-ins…</Text></Surface> : selectedEntries.length === 0 ? <Surface style={styles.historyEmpty}>
      <View style={styles.emptyGlyph}><Heart size={18} color={colors.peachInk} /></View><Text style={styles.emptyTitle}>A quiet day</Text><Text style={styles.emptyCopy}>No check-ins saved for this date.</Text>
    </Surface> : <View style={styles.entryList}>
      {selectedEntries.map((entry) => {
        const mood = moodOptions.find((option) => option.id === entry.mood)!;
        return <Surface key={entry.id} style={styles.entryCard}>
          <View style={[styles.entryEmoji, { backgroundColor: mood.color }]}><Text style={styles.entryEmojiText}>{mood.face}</Text></View>
          <View style={styles.entryContent}><View style={styles.entryTop}><Text style={styles.entryMood}>{mood.label}</Text><Text style={styles.entryTime}>{timeFormatter.format(new Date(entry.createdAt))}</Text></View><Text style={styles.entryIntensity}>Intensity · {entry.intensity}/10</Text>{!!entry.note && <Text style={styles.entryNote}>{entry.note}</Text>}</View>
        </Surface>;
      })}
    </View>}

    <View style={styles.privacyNote}><Info size={13} color={colors.muted} /><Text style={styles.privacyText}>Your mood check-ins are saved on this device.</Text></View>
    <View style={styles.bottomSpace} />
  </Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9 }, headerIcon: { width: 30, height: 30, borderRadius: 12, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: colors.forest, letterSpacing: 1.4, fontSize: 9, fontWeight: '700' }, title: { color: colors.ink, fontSize: 31, lineHeight: 37, letterSpacing: -0.8, fontWeight: '500', marginTop: 12 }, intro: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 17 },
  formCard: { padding: 17 }, formHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 }, formTitle: { color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: '600' }, formDate: { color: colors.muted, fontSize: 10, marginTop: 3 }, heartWash: { width: 34, height: 34, borderRadius: 13, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, moodChoice: { width: '31%', minHeight: 77, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, paddingVertical: 8, position: 'relative' }, pressed: { opacity: 0.8 }, moodEmoji: { fontSize: 21, marginBottom: 4 }, moodLabel: { color: colors.ink, fontSize: 10, fontWeight: '600' }, selectedCheck: { position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  validation: { color: colors.danger, fontSize: 11, lineHeight: 16, marginTop: 9 }, intensityHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20 }, fieldTitle: { color: colors.ink, fontSize: 12, fontWeight: '600' }, intensityHint: { color: colors.muted, fontSize: 9 },
  noteHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 21, marginBottom: 8 }, optional: { color: colors.muted, fontSize: 8, letterSpacing: 1.1, fontWeight: '600' }, noteInput: { minHeight: 76, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.canvas, paddingHorizontal: 12, paddingVertical: 11, color: colors.ink, fontSize: 12, lineHeight: 18 }, charCount: { alignSelf: 'flex-end', color: colors.muted, fontSize: 9, marginTop: 4, marginBottom: 12 },
  errorText: { color: colors.danger, fontSize: 11, lineHeight: 16, flex: 1 }, success: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 14, backgroundColor: colors.sage }, successIcon: { width: 23, height: 23, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, successText: { color: colors.forestDeep, fontSize: 11, fontWeight: '500', flex: 1 }, errorBox: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, marginTop: 12, borderRadius: 13, backgroundColor: '#F7EAE7' },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 27, marginBottom: 11 }, sectionLabel: { color: colors.muted, fontSize: 8, letterSpacing: 1.3, fontWeight: '700' }, sectionTitle: { color: colors.ink, fontSize: 20, lineHeight: 26, fontWeight: '500', marginTop: 4 }, weeklyAvg: { color: colors.forest, fontSize: 14, fontWeight: '700', paddingBottom: 3 },
  trendCard: { padding: 16 }, trendHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, cardTitle: { color: colors.ink, fontSize: 13, fontWeight: '600' }, trendLegend: { color: colors.muted, fontSize: 7, letterSpacing: 1, fontWeight: '700' }, chart: { flexDirection: 'row', height: 116, marginTop: 6 }, chartColumn: { flex: 1, alignItems: 'center' }, chartBarSpace: { height: 88, width: '100%', justifyContent: 'flex-end', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line }, chartBar: { width: 17, maxWidth: '65%', minHeight: 7, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: '#C7D6C4' }, chartBarToday: { backgroundColor: colors.forest }, chartDay: { color: '#9A9D93', fontSize: 9, marginTop: 8 }, chartDayToday: { color: colors.forest, fontWeight: '700' }, trendFoot: { flexDirection: 'row', justifyContent: 'space-between', borderTopColor: colors.line, borderTopWidth: 1, paddingTop: 10, marginTop: 1 }, trendFootnote: { color: colors.muted, fontSize: 9 }, entryCount: { color: colors.forest, fontSize: 9, fontWeight: '600' }, chartEmpty: { alignItems: 'center', paddingTop: 19, paddingBottom: 12 }, emptyGlyph: { width: 37, height: 37, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage, marginBottom: 8 }, emptyTitle: { color: colors.ink, fontSize: 12, fontWeight: '600', textAlign: 'center' }, emptyCopy: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 4 },
  historyTotal: { color: colors.muted, fontSize: 10, paddingBottom: 5 }, calendarCard: { paddingHorizontal: 12, paddingVertical: 13 }, monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 7, marginBottom: 8 }, monthArrow: { width: 32, height: 32, borderRadius: 12, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }, monthTitle: { color: colors.ink, fontSize: 13, fontWeight: '600' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: `${100 / 7}%`, height: 30, textAlign: 'center', textAlignVertical: 'center', color: colors.muted, fontSize: 9, fontWeight: '600' }, dayCell: { width: `${100 / 7}%`, height: 41, alignItems: 'center', justifyContent: 'center', borderRadius: 13, position: 'relative' }, daySelected: { backgroundColor: colors.forest }, dayToday: { borderColor: colors.forest, borderWidth: 1 }, dayNumber: { color: colors.ink, fontSize: 11 }, dayNumberSelected: { color: colors.white, fontWeight: '700' }, dayNumberToday: { color: colors.forest, fontWeight: '700' }, dayDot: { position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.peachInk }, dayDotSelected: { backgroundColor: colors.white },
  selectedDayHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 9 }, selectedDayTitle: { color: colors.ink, fontSize: 13, fontWeight: '600' }, todayPill: { color: colors.forest, fontSize: 7, letterSpacing: 0.8, fontWeight: '700', backgroundColor: colors.sage, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 }, historyEmpty: { alignItems: 'center', padding: 17 }, entryList: { gap: 9 }, entryCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 13, gap: 11 }, entryEmoji: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, entryEmojiText: { fontSize: 18 }, entryContent: { flex: 1 }, entryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, entryMood: { color: colors.ink, fontSize: 12, fontWeight: '600' }, entryTime: { color: colors.muted, fontSize: 9 }, entryIntensity: { color: colors.forest, fontSize: 10, marginTop: 3 }, entryNote: { color: '#71776E', fontSize: 11, lineHeight: 16, marginTop: 7 },
  privacyNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 17 }, privacyText: { color: colors.muted, fontSize: 9 }, bottomSpace: { height: 4 },
});
