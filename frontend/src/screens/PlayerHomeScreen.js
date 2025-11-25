import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { MOCK_TEAMS, MOCK_MATCHES, getUpcomingMatches } from '../data/mockData';

const { width } = Dimensions.get('window');

export default function PlayerHomeScreen({ navigation }) {
  const user = useSelector((state) => state.auth.user);
  const upcomingMatches = getUpcomingMatches().slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Header with Notification */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Player'}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationIcon}
            onPress={() => navigation.navigate('TeamInvitations')}
          >
            <Ionicons name="notifications" size={28} color={Colors.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeCount}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.stats?.matches || 45}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.stats?.runs || 1250}</Text>
          <Text style={styles.statLabel}>Runs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.teams?.length || 2}</Text>
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
        
        {upcomingMatches.map((match) => (
          <TouchableOpacity key={match.id} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <View style={styles.matchDateContainer}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.matchDate}>{match.date}</Text>
              </View>
              <Text style={styles.matchType}>{match.type}</Text>
            </View>
            <View style={styles.matchTeams}>
              <Text style={styles.teamName}>{match.team1}</Text>
              <Text style={styles.vs}>VS</Text>
              <Text style={styles.teamName}>{match.team2}</Text>
            </View>
            <View style={styles.matchDetails}>
              <View style={styles.matchInfoItem}>
                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.matchInfo}>{match.time}</Text>
              </View>
              <View style={styles.matchInfoItem}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.matchInfo}>{match.ground}</Text>
              </View>
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
        
        {MOCK_TEAMS.slice(0, 2).map((team) => (
          <TouchableOpacity key={team.id} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View style={styles.teamInfoSection}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.teamRole}>Captain: {team.captain}</Text>
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

        <View style={styles.teamActions}>
          <TouchableOpacity 
            style={styles.createTeamButton}
            onPress={() => navigation.navigate('CreateTeam')}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.createTeamText}>Create New Team</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.joinTeamButton}
            onPress={() => navigation.navigate('FindTeams')}
          >
            <Ionicons name="search-outline" size={20} color={Colors.primary} />
            <Text style={styles.joinTeamText}>Join a Team</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCount: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
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
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
  },
  matchCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  matchDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  matchDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  matchType: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
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
    color: Colors.textPrimary,
    flex: 1,
  },
  vs: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.accent,
    marginHorizontal: 10,
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  matchInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  teamCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  teamInfoSection: {
    flex: 1,
  },
  teamRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  teamBadge: {
    backgroundColor: Colors.softOrange,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
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
    color: Colors.primary,
  },
  teamStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  teamActions: {
    gap: 12,
  },
  createTeamButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createTeamText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  joinTeamButton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
  },
  joinTeamText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
