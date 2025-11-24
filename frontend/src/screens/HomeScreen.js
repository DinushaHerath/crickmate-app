import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

// This is a fallback home screen - should not be used with role-based navigation
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CrickMate</Text>
      <Text style={styles.subtitle}>Your cricket companion app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.darkBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.neonGreen,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
