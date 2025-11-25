import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { MOCK_TEAMS } from '../../data/mockData';

export default function FindTeamsScreen({ navigation }) {
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Filter teams that are accepting players
  const availableTeams = MOCK_TEAMS.filter(team => team.members < 15); // Assuming max 15 members

  const filteredTeams = availableTeams.filter(team => {
    const matchesName = team.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesLocation = searchLocation === '' || 
      team.district?.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesName && matchesLocation;
  });

  const handleRequestToJoin = (teamId) => {
    alert(`Join request sent to team ${teamId}`);
  };

  const renderTeam = ({ item }) => (
    <TouchableOpacity style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamLogo}>{item.logo}</Text>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <View style={styles.teamMeta}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.teamDistrict}>{item.district}</Text>
          </View>
          <Text style={styles.teamCaptain}>Captain: {item.captain}</Text>
        </View>
      </View>
      
      <View style={styles.teamStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.members}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.matches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.wins}/{item.losses}</Text>
          <Text style={styles.statLabel}>W/L</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.requestButton}
        onPress={() => handleRequestToJoin(item.id)}
      >
        <Ionicons name="person-add" size={20} color={Colors.white} />
        <Text style={styles.requestButtonText}>Request to Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search team name..."
            value={searchName}
            onChangeText={setSearchName}
          />
        </View>
        
        <View style={styles.searchInputWrapper}>
          <Ionicons name="location" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter by district..."
            value={searchLocation}
            onChangeText={setSearchLocation}
          />
        </View>
      </View>

      {/* Teams List */}
      <FlatList
        data={filteredTeams}
        renderItem={renderTeam}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No teams available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  listContainer: {
    padding: 15,
  },
  teamCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  teamLogo: {
    fontSize: 48,
    marginRight: 15,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  teamDistrict: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  teamCaptain: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 10,
  },
});
