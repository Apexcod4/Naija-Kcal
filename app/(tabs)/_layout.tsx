import { Tabs } from 'expo-router';
import TabBar from '../../src/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Tabs are peers, not a hierarchy — a cross-fade reads as switching
        // rather than navigating somewhere deeper.
        animation: 'fade',
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="diary" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
