export const moodOptions = [
  { id: 'joyful', label: 'Joyful', face: '☀️', color: '#F5EBD4', ink: '#9A7841', intensityLabel: 'Bright and energized' },
  { id: 'calm', label: 'Calm', face: '🌿', color: '#E7EEE4', ink: '#55705B', intensityLabel: 'Peaceful and settled' },
  { id: 'okay', label: 'Okay', face: '☁️', color: '#ECEAF3', ink: '#77718F', intensityLabel: 'Somewhere in between' },
  { id: 'anxious', label: 'Anxious', face: '🫧', color: '#E8EEF1', ink: '#627985', intensityLabel: 'Restless or worried' },
  { id: 'low', label: 'Low', face: '🌧️', color: '#E9E9EE', ink: '#74788A', intensityLabel: 'A little heavy' },
  { id: 'overwhelmed', label: 'Overwhelmed', face: '🌊', color: '#F2E7E4', ink: '#A16E63', intensityLabel: 'A lot to hold' },
] as const;

export type MoodId = (typeof moodOptions)[number]['id'];
export type MoodEntry = {
  id: string;
  mood: MoodId;
  intensity: number;
  note: string;
  dateKey: string;
  createdAt: string;
};
