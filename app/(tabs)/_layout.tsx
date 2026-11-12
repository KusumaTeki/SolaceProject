import { Tabs } from 'expo-router';
import { House, MessageCircle, MoonStar, Smile } from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.forest,
      tabBarInactiveTintColor: colors.muted,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
      tabBarStyle: { height: 68, paddingTop: 8, backgroundColor: colors.paper, borderTopColor: colors.line, elevation: 0 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color }) => <House size={20} color={color} /> }} />
      <Tabs.Screen name="mood" options={{ title: 'Mood', tabBarIcon: ({ color }) => <Smile size={20} color={color} /> }} />
      <Tabs.Screen name="companion" options={{ title: 'Companion', tabBarIcon: ({ color }) => <MessageCircle size={20} color={color} /> }} />
      <Tabs.Screen name="breathe" options={{ title: 'Breathe', tabBarIcon: ({ color }) => <MoonStar size={20} color={color} /> }} />
    </Tabs>
  );
}
