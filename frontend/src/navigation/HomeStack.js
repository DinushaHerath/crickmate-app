import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import PlayerHomeScreen from '../screens/PlayerHomeScreen';
import FindPlayersScreen from '../screens/team/FindPlayersScreen';
import PlayerProfileScreen from '../screens/team/PlayerProfileScreen';
import FindTeamsScreen from '../screens/team/FindTeamsScreen';
import TeamInvitationsScreen from '../screens/team/TeamInvitationsScreen';

const Stack = createNativeStackNavigator();

// Notification Bell Component
const NotificationBell = ({ navigation, hasNotifications = true }) => (
  <TouchableOpacity 
    style={styles.notificationButton}
    onPress={() => navigation.navigate('TeamInvitations')}
  >
    <Ionicons name="notifications" size={24} color={Colors.primary} />
    {hasNotifications && <View style={styles.notificationBadge} />}
  </TouchableOpacity>
);

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTintColor: Colors.primary,
        headerRight: () => <NotificationBell navigation={navigation} />,
      })}
    >
      <Stack.Screen 
        name="PlayerHome" 
        component={PlayerHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FindPlayers" 
        component={FindPlayersScreen}
        options={{ title: 'Find Players' }}
      />
      <Stack.Screen 
        name="PlayerProfile" 
        component={PlayerProfileScreen}
        options={{ title: 'Player Profile' }}
      />
      <Stack.Screen 
        name="FindTeams" 
        component={FindTeamsScreen}
        options={{ title: 'Find Teams' }}
      />
      <Stack.Screen 
        name="TeamInvitations" 
        component={TeamInvitationsScreen}
        options={{ title: 'Team Invitations' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    marginRight: 15,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
});
