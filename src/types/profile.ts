export type WellnessGoal = 'Feel calmer' | 'Understand my feelings' | 'Build healthy habits' | 'Sleep more easily' | 'Make space for myself';
export type EmotionalPreference = 'Gentle encouragement' | 'Practical ideas' | 'A quiet place to reflect' | 'Help naming my feelings';
export interface WellnessProfile {
  name: string;
  goals: WellnessGoal[];
  preferences: EmotionalPreference[];
  reminderEnabled: boolean;
  reminderTime: string;
  onboardingComplete: true;
}
