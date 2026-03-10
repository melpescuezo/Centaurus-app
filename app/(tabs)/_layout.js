import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import MiniPlayer from '../../src/components/MiniPlayer.js';
import { RadioPlayerProvider } from '../../src/player/RadioPlayerContext.js';

export default function TabsLayout() {
  return (
    <RadioPlayerProvider>
      <View style={{ flex: 1, backgroundColor: '#020406' }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: {
              backgroundColor: '#020406',
              paddingBottom: 170,
            },
            tabBarShowLabel: true,
            tabBarActiveTintColor: '#1a78ff',
            tabBarInactiveTintColor: '#8f9ab2',
            tabBarStyle: {
              backgroundColor: '#070c14',
              borderTopColor: '#172136',
              borderTopWidth: 1,
              height: 72,
              paddingBottom: 10,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '700',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons color={color} name="home" size={24} />
              ),
              title: 'Inicio',
            }}
          />
          <Tabs.Screen
            name="programacion"
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons color={color} name="calendar-clock" size={24} />
              ),
              title: 'Programación',
            }}
          />
          <Tabs.Screen
            name="noticias"
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons color={color} name="newspaper" size={24} />
              ),
              title: 'Noticias',
            }}
          />
          <Tabs.Screen
            name="web"
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons color={color} name="web" size={24} />
              ),
              title: 'Web',
            }}
          />
        </Tabs>
        <MiniPlayer />
      </View>
    </RadioPlayerProvider>
  );
}
