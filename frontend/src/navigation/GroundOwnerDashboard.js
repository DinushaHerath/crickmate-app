import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants/theme';
import GroundOwnerHomeScreen from '../screens/GroundOwnerHomeScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function GroundOwnerDashboard() {
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
        name="Dashboard" 
        component={GroundOwnerHomeScreen}
        options={{
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏠</span>,
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📅</span>,
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
