import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WellnessProfile } from '@/types/profile';

const PROFILE_KEY = '@solace/profile-v1';

export async function getProfile(): Promise<WellnessProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as WellnessProfile; }
  catch { await AsyncStorage.removeItem(PROFILE_KEY); return null; }
}
export async function saveProfile(profile: WellnessProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
export async function clearProfile(): Promise<void> { await AsyncStorage.removeItem(PROFILE_KEY); }
