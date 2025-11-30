import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '../../constants/theme';
import CalendarScreen from '../screens/groundowner/CalendarScreen';
import PlaceBookingScreen from '../screens/groundowner/PlaceBookingScreen';

const Stack = createStackNavigator();

export default function CalendarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="CalendarMain" 
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PlaceBooking" 
        component={PlaceBookingScreen}
        options={{ 
          title: 'Place a Booking',
          headerBackTitle: 'Back'
        }}
      />
    </Stack.Navigator>
  );
}
