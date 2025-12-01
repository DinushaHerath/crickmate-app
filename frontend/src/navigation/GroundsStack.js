import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import GroundsScreen from '../screens/player/GroundsScreen';
import GroundDetailsScreen from '../screens/player/GroundDetailsScreen';
import MyBookingsScreen from '../screens/player/MyBookingsScreen';

const Stack = createStackNavigator();

export default function GroundsStack() {
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
        name="GroundsList" 
        component={GroundsScreen}
        options={({ navigation }) => ({
          title: 'Find Grounds',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('MyBookings')}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="calendar" size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="GroundDetails" 
        component={GroundDetailsScreen}
        options={{
          title: 'Ground Details',
        }}
      />
      <Stack.Screen 
        name="MyBookings" 
        component={MyBookingsScreen}
        options={{
          title: 'My Bookings',
        }}
      />
    </Stack.Navigator>
  );
}
