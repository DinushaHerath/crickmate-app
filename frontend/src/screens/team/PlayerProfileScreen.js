import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { MOCK_PLAYERS } from '../../data/mockData';

export default function PlayerProfileScreen({ route, navigation }) {
  const { playerId } = route.params;
  const player = MOCK_PLAYERS.find(p => p.id === playerId);

  if (!player) {
    return (
      <View style={styles.container}>
        <Text>Player not found</Text>
      </View>
    );
  }

  const handleInvite = () => {
    alert(`Invitation sent to ${player.name}`);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: player.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.position}>{player.position}</Text>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{player.age} years</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{player.district}</Text>
          </View>
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.stats.matches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.stats.runs}</Text>
            <Text style={styles.statLabel}>Runs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.stats.wickets}</Text>
            <Text style={styles.statLabel}>Wickets</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.stats.catches}</Text>
            <Text style={styles.statLabel}>Catches</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.stats.average}</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.stats.strikeRate}</Text>
            <Text style={styles.statLabel}>Strike Rate</Text>
          </View>
        </View>
      </View>

      {/* Teams Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teams</Text>
        {player.teams.length > 0 ? (
          player.teams.map((team, index) => (
            <View key={index} style={styles.teamItem}>
              <Ionicons name="people" size={20} color={Colors.primary} />
              <Text style={styles.teamName}>{team}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Not part of any team</Text>
        )}
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {player.achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Ionicons name="trophy" size={20} color={Colors.secondary} />
            <Text style={styles.achievementText}>{achievement}</Text>
          </View>
        ))}
      </View>

      {/* Invite Button */}
      <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
        <Ionicons name="mail-outline" size={24} color={Colors.white} />
        <Text style={styles.inviteButtonText}>Invite to Team</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  position: {
    fontSize: 18,
    color: Colors.secondary,
    marginBottom: 15,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
    backgroundColor: Colors.white,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statBox: {
    width: '30%',
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    marginBottom: 10,
    gap: 10,
  },
  teamName: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.softOrange,
    borderRadius: 8,
    marginBottom: 10,
    gap: 10,
  },
  achievementText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  inviteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
