import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { MOCK_TEAMS } from '../data/mockData';

export default function TeamScreen({ navigation }) {
  // Mock data for user's teams
  const myCreatedTeams = [
    {
      id: '1',
      name: 'Thunder Strikers',
      logo: '⚡',
      district: 'Colombo',
      role: 'Captain',
      members: 12,
      matches: 15,
      wins: 10,
      isCreator: true
    },
    {
      id: '2',
      name: 'Royal Kings',
      logo: '👑',
      district: 'Kandy',
      role: 'All-Rounder',
      members: 11,
      matches: 8,
      wins: 5,
      isCreator: false
    }
  ];

  const renderTeam = ({ item }) => (
    <View style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.teamIconContainer}>
          <Ionicons name="people" size={28} color={Colors.primary} />
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <View style={styles.teamMeta}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.teamDistrict}>{item.district}</Text>
          </View>
          <View style={styles.roleContainer}>
            {item.isCreator && (
              <View style={styles.creatorBadge}>
                <Ionicons name="star" size={12} color={Colors.secondary} />
                <Text style={styles.creatorText}>Creator</Text>
              </View>
            )}
            <Text style={styles.teamRole}>{item.role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.teamStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={18} color={Colors.primary} />
          <Text style={styles.statText}>{item.members} Members</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={18} color={Colors.primary} />
          <Text style={styles.statText}>{item.matches} Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
          <Text style={styles.statText}>{item.wins} Wins</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Teams</Text>
        <Text style={styles.headerSubtitle}>Manage your cricket teams</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Home', { 
            screen: 'CreateTeam' 
          })}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="add-circle" size={32} color={Colors.white} />
          </View>
          <Text style={styles.actionText}>Create New Team</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('Home', { 
            screen: 'FindTeams' 
          })}
        >
          <View style={[styles.actionIconContainer, styles.actionIconSecondary]}>
            <Ionicons name="search" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>Join a Team</Text>
        </TouchableOpacity>
      </View>

      {/* Teams List */}
      <View style={styles.teamsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Teams ({myCreatedTeams.length})</Text>
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {myCreatedTeams.length > 0 ? (
          <FlatList
            data={myCreatedTeams}
            renderItem={renderTeam}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color={Colors.textLight} />
            <Text style={styles.emptyText}>No teams yet</Text>
            <Text style={styles.emptySubtext}>Create or join a team to get started</Text>
          </View>
        )}
      </View>

      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color={Colors.primary} />
            <Text style={styles.statCardValue}>{myCreatedTeams.length}</Text>
            <Text style={styles.statCardLabel}>Total Teams</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={32} color={Colors.secondary} />
            <Text style={styles.statCardValue}>
              {myCreatedTeams.filter(t => t.isCreator).length}
            </Text>
            <Text style={styles.statCardLabel}>Created</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={32} color={Colors.accent} />
            <Text style={styles.statCardValue}>
              {myCreatedTeams.reduce((sum, t) => sum + t.wins, 0)}
            </Text>
            <Text style={styles.statCardLabel}>Total Wins</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  actionButtonSecondary: {
    borderColor: Colors.border,
  },
  actionIconContainer: {
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconSecondary: {
    backgroundColor: Colors.softOrange,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  teamsSection: {
    padding: 15,
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
  teamIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.softOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 5,
  },
  teamDistrict: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.softOrange,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  creatorText: {
    fontSize: 10,
    color: Colors.secondary,
    fontWeight: 'bold',
  },
  teamRole: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 5,
  },
  statsOverview: {
    padding: 15,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
