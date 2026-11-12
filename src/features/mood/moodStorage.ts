import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MoodEntry } from '@/features/mood/types';

const MOOD_ENTRIES_KEY = '@solace/mood-entries-v1';

export async function getMoodEntries(): Promise<MoodEntry[]> {
  const raw = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as MoodEntry[]).filter((entry) =>
      typeof entry.id === 'string' && typeof entry.dateKey === 'string' &&
      typeof entry.intensity === 'number' && typeof entry.createdAt === 'string' &&
      typeof entry.note === 'string' && typeof entry.mood === 'string'
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function addMoodEntry(entry: MoodEntry): Promise<MoodEntry[]> {
  const entries = await getMoodEntries();
  const next = [entry, ...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(next));
  return next;
}
