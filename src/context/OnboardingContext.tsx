import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { EmotionalPreference, WellnessGoal, WellnessProfile } from '@/types/profile';
import { saveProfile } from '@/services/profileStorage';

type Draft = { name: string; goals: WellnessGoal[]; preferences: EmotionalPreference[]; reminderEnabled: boolean; reminderTime: string };
type ContextValue = Draft & {
  setName: (value: string) => void;
  toggleGoal: (value: WellnessGoal) => void;
  togglePreference: (value: EmotionalPreference) => void;
  setReminderEnabled: (value: boolean) => void;
  setReminderTime: (value: string) => void;
  finish: (reminderOverride?: boolean) => Promise<void>;
};
const OnboardingContext = createContext<ContextValue | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [name, setName] = useState('');
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [preferences, setPreferences] = useState<EmotionalPreference[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('8:00 AM');
  const value = useMemo<ContextValue>(() => ({
    name, goals, preferences, reminderEnabled, reminderTime, setName, setReminderEnabled, setReminderTime,
    toggleGoal: (goal) => setGoals((current) => current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]),
    togglePreference: (preference) => setPreferences((current) => current.includes(preference) ? current.filter((item) => item !== preference) : [...current, preference]),
    finish: async (reminderOverride) => {
      const profile: WellnessProfile = { name: name.trim(), goals, preferences, reminderEnabled: reminderOverride ?? reminderEnabled, reminderTime, onboardingComplete: true };
      await saveProfile(profile);
    },
  }), [name, goals, preferences, reminderEnabled, reminderTime]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}
