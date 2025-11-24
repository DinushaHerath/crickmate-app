import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants/theme';
import PlayerHomeScreen from '../screens/PlayerHomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import GroundsScreen from '../screens/GroundsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();

export default function PlayerDashboard() {
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.darkBackground,
        },
        headerTintColor: Colors.neonGreen,
        tabBarStyle: {
          backgroundColor: Colors.darkSecondary,
          borderTopColor: Colors.sportGreen,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.neonGreen,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={PlayerHomeScreen}
        options={{
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏠</span>,
        }}
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchesScreen}
        options={{
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>⚡</span>,
        }}
      />
      <Tab.Screen 
        name="Grounds" 
        component={GroundsScreen}
        options={{
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏟️</span>,
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>💬</span>,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>👤</span>,
        }}
      />
    </Tab.Navigator>
  );
}
