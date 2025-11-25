import React from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Colors } from '../../constants/theme';
import UpcomingMatchesScreen from '../screens/matches/UpcomingMatchesScreen';
import PastMatchesScreen from '../screens/matches/PastMatchesScreen';
import AvailableMatchesScreen from '../screens/matches/AvailableMatchesScreen';

const Tab = createMaterialTopTabNavigator();

export default function MatchesStack() {
  return (
    <View style={{ flex: 1, paddingTop: 0 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarIndicatorStyle: {
            backgroundColor: Colors.primary,
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: Colors.white,
            elevation: 4,
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 12,
          },
        }}
      >
      <Tab.Screen 
        name="Upcoming" 
        component={UpcomingMatchesScreen}
        options={{ title: 'Upcoming' }}
      />
      <Tab.Screen 
        name="Past" 
        component={PastMatchesScreen}
        options={{ title: 'Past' }}
      />
      <Tab.Screen 
        name="Available" 
        component={AvailableMatchesScreen}
        options={{ title: 'Available' }}
      />
    </Tab.Navigator>
    </View>
  );
}
