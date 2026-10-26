import { Tabs } from 'expo-router/js-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/theme/colors';

const tabs = [
  { name: 'home', title: 'Home', icon: 'home', iconInactive: 'home-outline' },
  { name: 'history', title: 'History', icon: 'time', iconInactive: 'time-outline' },
  { name: 'settings', title: 'Settings', icon: 'settings', iconInactive: 'settings-outline' },
] as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.neutralBackground },
        tabBarActiveTintColor: colors.primarySoft,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.neutralSurfaceInput,
          borderTopColor: colors.borderSubtle,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? tab.icon : tab.iconInactive} size={24} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
