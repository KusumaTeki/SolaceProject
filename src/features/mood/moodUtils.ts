import { moodOptions, type MoodEntry } from '@/features/mood/types';

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getMoodLabel(moodId: MoodEntry['mood']): string {
  return moodOptions.find((mood) => mood.id === moodId)?.label ?? 'Mood';
}

export function getMonthCells(year: number, month: number): Array<{ dateKey: string; day: number } | null> {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay; // Calendar weeks begin on Sunday.
  const count = Math.ceil((offset + daysInMonth) / 7) * 7;
  return Array.from({ length: count }, (_, index) => {
    const day = index - offset + 1;
    return day < 1 || day > daysInMonth ? null : { day, dateKey: toDateKey(new Date(year, month, day)) };
  });
}

export function averageIntensity(entries: MoodEntry[]): number | null {
  if (!entries.length) return null;
  return Math.round(entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length);
}

export function getLastSevenDays(entries: MoodEntry[], now = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const key = toDateKey(date);
    return {
      dateKey: key,
      day: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date).slice(0, 1),
      average: averageIntensity(entries.filter((entry) => entry.dateKey === key)),
    };
  });
}
