import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { MOCK_PLAYERS } from '../../data/mockData';

export default function FindPlayersScreen({ navigation }) {
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [players, setPlayers] = useState(MOCK_PLAYERS);

  const filteredPlayers = players.filter(player => {
    const matchesName = player.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesLocation = searchLocation === '' || 
      player.district?.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesName && matchesLocation;
  });

  const handleInvitePlayer = (playerId) => {
    // Will be implemented with state management
    alert(`Invitation sent to player ${playerId}`);
  };

  const renderPlayer = ({ item }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => navigation.navigate('PlayerProfile', { playerId: item.id })}
    >
      <Image 
        source={{ uri: item.avatar }} 
        style={styles.playerAvatar}
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerPosition}>{item.position}</Text>
        <View style={styles.playerMeta}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.playerDistrict}>{item.district || 'Colombo'}</Text>
        </View>
        <View style={styles.playerStats}>
          <Text style={styles.statText}>Matches: {item.stats.matches}</Text>
          <Text style={styles.statText}>Avg: {item.stats.average}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.inviteButton}
        onPress={() => handleInvitePlayer(item.id)}
      >
        <Ionicons name="add-circle" size={32} color={Colors.accent} />
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
            placeholder="Search by name..."
            value={searchName}
            onChangeText={setSearchName}
          />
        </View>
        
        <View style={styles.searchInputWrapper}>
          <Ionicons name="location" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter by location..."
            value={searchLocation}
            onChangeText={setSearchLocation}
          />
        </View>
      </View>

      {/* Players List */}
      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No players found</Text>
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
  playerCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 4,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerDistrict: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inviteButton: {
    padding: 5,
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
