import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../../constants/theme';
import { getUpcomingMatches } from '../../api/matches';

export default function UpcomingMatchesScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const token = useSelector(state => state.auth.token);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      console.log('Fetching upcoming matches with token:', token ? 'Token exists' : 'No token');
      const response = await getUpcomingMatches(token);
      console.log('Upcoming matches response:', response.data);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMatches();
    }
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredMatches = selectedDate
    ? matches.filter(match => formatDate(match.date) === selectedDate)
    : matches;

  const renderMatch = ({ item }) => (
    <TouchableOpacity style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.matchTypeContainer}>
          <Ionicons name="trophy" size={20} color={Colors.secondary} />
          <Text style={styles.matchType}>{item.matchType}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Upcoming</Text>
        </View>
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <Text style={styles.teamName}>{item.team1?.name || 'Team 1'}</Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={styles.team}>
          <Text style={styles.teamName}>{item.team2?.name || 'Team 2'}</Text>
        </View>
      </View>

      <View style={styles.matchDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
      </View>

      <View style={styles.groundContainer}>
        <Ionicons name="location" size={16} color={Colors.primary} />
        <Text style={styles.groundText}>{item.groundName}, {item.village}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowDatePicker(true)}
        >
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          renderItem={renderMatch}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>No upcoming matches</Text>
              <Text style={styles.emptySubText}>Matches you create or join will appear here</Text>
            </View>
          }
        />
      )}
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
    borderLeftColor: Colors.secondary,
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
  statusBadge: {
    backgroundColor: Colors.softOrange,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: Colors.primary,
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
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  vsContainer: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
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
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 5,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
