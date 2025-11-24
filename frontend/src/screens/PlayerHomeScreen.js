import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Mock data - will be replaced with API calls
const mockTeams = [
  { id: 1, name: 'Thunder Strikers', role: 'Captain', members: 11, wins: 8, matches: 12 },
  { id: 2, name: 'Lightning Warriors', role: 'All-Rounder', members: 11, wins: 5, matches: 10 },
];

const mockUpcomingMatches = [
  {
    id: 1,
    team1: 'Thunder Strikers',
    team2: 'Blazing Legends',
    date: '2025-11-28',
    time: '10:00 AM',
    ground: 'Central Cricket Ground',
    distance: '2.3 km',
  },
  {
    id: 2,
    team1: 'Lightning Warriors',
    team2: 'Storm Riders',
    date: '2025-11-30',
    time: '2:00 PM',
    ground: 'Victory Stadium',
    distance: '5.1 km',
  },
];

export default function PlayerHomeScreen() {
  const user = useSelector((state) => state.auth.user);

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'Player'}! 👋</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>15</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>10</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
      </View>

      {/* Upcoming Matches Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Matches</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        
        {mockUpcomingMatches.map((match) => (
          <TouchableOpacity key={match.id} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchDate}>📅 {match.date}</Text>
              <Text style={styles.matchDistance}>📍 {match.distance}</Text>
            </View>
            <View style={styles.matchTeams}>
              <Text style={styles.teamName}>{match.team1}</Text>
              <Text style={styles.vs}>VS</Text>
              <Text style={styles.teamName}>{match.team2}</Text>
            </View>
            <View style={styles.matchDetails}>
              <Text style={styles.matchInfo}>⏰ {match.time}</Text>
              <Text style={styles.matchInfo}>🏟️ {match.ground}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* My Teams Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Teams</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        
        {mockTeams.map((team) => (
          <TouchableOpacity key={team.id} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.teamRole}>Your Role: {team.role}</Text>
              </View>
              <View style={styles.teamBadge}>
                <Text style={styles.badgeText}>{team.members}</Text>
                <Text style={styles.badgeLabel}>Members</Text>
              </View>
            </View>
            <View style={styles.teamStats}>
              <View style={styles.teamStat}>
                <Text style={styles.teamStatValue}>{team.wins}</Text>
                <Text style={styles.teamStatLabel}>Wins</Text>
              </View>
              <View style={styles.teamStat}>
                <Text style={styles.teamStatValue}>{team.matches}</Text>
                <Text style={styles.teamStatLabel}>Matches</Text>
              </View>
              <View style={styles.teamStat}>
                <Text style={styles.teamStatValue}>
                  {((team.wins / team.matches) * 100).toFixed(0)}%
                </Text>
                <Text style={styles.teamStatLabel}>Win Rate</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.createTeamButton}>
          <Text style={styles.createTeamText}>+ Create New Team</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.neonGreen,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.darkSecondary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sportGreen + '40',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neonGreen,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.neonGreen,
  },
  matchCard: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.neonGreen,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  matchDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  matchDistance: {
    fontSize: 12,
    color: Colors.neonYellow,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  vs: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.neonGreen,
    marginHorizontal: 10,
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  teamCard: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.sportGreen + '40',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  teamRole: {
    fontSize: 12,
    color: Colors.neonYellow,
    marginTop: 5,
  },
  teamBadge: {
    backgroundColor: Colors.sportGreen + '60',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neonGreen,
  },
  badgeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  teamStat: {
    alignItems: 'center',
  },
  teamStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neonGreen,
  },
  teamStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  createTeamButton: {
    backgroundColor: Colors.sportGreen,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neonGreen,
    borderStyle: 'dashed',
  },
  createTeamText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neonGreen,
  },
});
