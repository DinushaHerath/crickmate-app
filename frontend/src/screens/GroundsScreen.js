import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../../constants/theme';

export default function GroundsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cricket Grounds</Text>
        <Text style={styles.subtitle}>Find grounds near you</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search grounds..."
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🏟️</Text>
        <Text style={styles.emptyText}>No grounds nearby</Text>
        <Text style={styles.emptySubtext}>Try adjusting your search or location</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: Colors.darkSecondary,
    borderWidth: 1,
    borderColor: Colors.sportGreen,
    borderRadius: 12,
    padding: 15,
    color: Colors.white,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
