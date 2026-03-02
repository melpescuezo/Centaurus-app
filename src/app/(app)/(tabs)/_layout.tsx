import { type IconProps } from '@expo/vector-icons/build/createIconSet.js';
import _MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons.js';
import { Tabs } from 'expo-router';
import { FC } from 'react';
import { View } from 'react-native';
import MiniPlayer from '../../../components/MiniPlayer.js';
import { RadioPlayerProvider } from '../../../player/RadioPlayerContext.js';

const MaterialCommunityIcons = _MaterialCommunityIcons as unknown as FC<IconProps<string>>;

export default function TabLayout() {
  return (
    <RadioPlayerProvider>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: {
              backgroundColor: '#000',
              paddingBottom: 136,
            },
            tabBarStyle: {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 64,
              backgroundColor: '#000',
              borderTopWidth: 0,
              height: 60,
              paddingTop: 8,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: '#0000fe',
            tabBarInactiveTintColor: '#9a9a9a',
            tabBarShowLabel: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <MaterialCommunityIcons
                  color={focused ? '#0000fe' : '#9a9a9a'}
                  name="home"
                  size={28}
                />
              ),
              title: 'Home',
            }}
          />
          <Tabs.Screen
            name="contacto"
            options={{
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <MaterialCommunityIcons
                  color={focused ? '#0000fe' : '#9a9a9a'}
                  name="dots-horizontal"
                  size={30}
                />
              ),
              title: 'Contacto',
            }}
          />
        </Tabs>

        <MiniPlayer />
      </View>
    </RadioPlayerProvider>
  );
}
