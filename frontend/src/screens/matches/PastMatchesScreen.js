import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { getCompletedMatches } from '../../data/mockData';

export default function PastMatchesScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  
  const pastMatches = getCompletedMatches();

  const filteredMatches = selectedDate
    ? pastMatches.filter(match => match.date === selectedDate)
    : pastMatches;

  const renderMatch = ({ item }) => (
    <TouchableOpacity style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.matchTypeContainer}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
          <Text style={styles.matchType}>{item.type}</Text>
        </View>
        <View style={styles.winnerBadge}>
          <Ionicons name="trophy" size={14} color={Colors.secondary} />
          <Text style={styles.winnerText}>Winner</Text>
        </View>
      </View>

      <View style={styles.teamsContainer}>
        <View style={[styles.team, item.winner === item.team1 && styles.winnerTeam]}>
          <Text style={[styles.teamName, item.winner === item.team1 && styles.winnerTeamName]}>
            {item.team1}
          </Text>
          <Text style={styles.scoreText}>{item.score1}</Text>
        </View>
        
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        <View style={[styles.team, item.winner === item.team2 && styles.winnerTeam]}>
          <Text style={[styles.teamName, item.winner === item.team2 && styles.winnerTeamName]}>
            {item.team2}
          </Text>
          <Text style={styles.scoreText}>{item.score2}</Text>
        </View>
      </View>

      <View style={styles.matchDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
      </View>

      <View style={styles.groundContainer}>
        <Ionicons name="location" size={16} color={Colors.primary} />
        <Text style={styles.groundText}>{item.ground}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color={Colors.primary} />
          <Text style={styles.filterText}>
            {selectedDate ? selectedDate : 'Filter by Date'}
          </Text>
        </TouchableOpacity>
        
        {selectedDate && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSelectedDate(null)}
          >
            <Ionicons name="close-circle" size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Matches List */}
      <FlatList
        data={filteredMatches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No past matches</Text>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  clearButton: {
    justifyContent: 'center',
    padding: 8,
  },
  listContainer: {
    padding: 15,
  },
  matchCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  matchTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.softOrange,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  winnerText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  team: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  winnerTeam: {
    backgroundColor: Colors.softOrange,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 5,
  },
  winnerTeamName: {
    color: Colors.primary,
  },
  scoreText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  vsContainer: {
    backgroundColor: Colors.textLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  vsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 10,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  groundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groundText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 10,
  },
});
