import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { RadioPlayerProvider } from '../../src/player/RadioPlayerContext.js';

export default function TabsLayout() {
  return (
    <RadioPlayerProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#0000fe',
          tabBarInactiveTintColor: '#9a9a9a',
          tabBarStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 72,
            backgroundColor: '#000',
            borderTopWidth: 0,
            height: 60,
            paddingTop: 8,
            paddingBottom: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons color={focused ? '#0000fe' : color} name="home" size={28} />
            ),
          }}
        />
        <Tabs.Screen
          name="contact"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                color={focused ? '#0000fe' : color}
                name="dots-horizontal"
                size={30}
              />
            ),
          }}
        />
      </Tabs>
    </RadioPlayerProvider>
  );
}
