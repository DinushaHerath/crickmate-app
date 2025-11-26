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
            fontSize: 13,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: Colors.white,
            elevation: 2,
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 2,
            paddingVertical: 6,
            marginBottom: 6,
          },
          tabBarItemStyle: {
            paddingVertical: 6,
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
