import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Colors } from '../../../constants/theme';
import { getPastMatches, updateMatchScore } from '../../api/matches';

export default function PastMatchesScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [team1Runs, setTeam1Runs] = useState('');
  const [team1Wickets, setTeam1Wickets] = useState('');
  const [team1Overs, setTeam1Overs] = useState('');
  const [team2Runs, setTeam2Runs] = useState('');
  const [team2Wickets, setTeam2Wickets] = useState('');
  const [team2Overs, setTeam2Overs] = useState('');
  
  const token = useSelector(state => state.auth.token);
  const userId = useSelector(state => state.auth.user?._id);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      console.log('Fetching past matches with token:', token ? 'Token exists' : 'No token');
      const response = await getPastMatches(token);
      console.log('Past matches response:', response.data);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching past matches:', error);
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

  const openScoreModal = (match) => {
    setSelectedMatch(match);
    setTeam1Runs(match.team1Score?.runs?.toString() || '');
    setTeam1Wickets(match.team1Score?.wickets?.toString() || '');
    setTeam1Overs(match.team1Score?.overs?.toString() || '');
    setTeam2Runs(match.team2Score?.runs?.toString() || '');
    setTeam2Wickets(match.team2Score?.wickets?.toString() || '');
    setTeam2Overs(match.team2Score?.overs?.toString() || '');
    setShowScoreModal(true);
  };

  const handleUpdateScore = async () => {
    if (!selectedMatch) return;

    try {
      const team1Total = parseInt(team1Runs) || 0;
      const team2Total = parseInt(team2Runs) || 0;
      
      const scoreData = {
        team1Score: {
          runs: parseInt(team1Runs) || 0,
          wickets: parseInt(team1Wickets) || 0,
          overs: parseFloat(team1Overs) || 0
        },
        team2Score: {
          runs: parseInt(team2Runs) || 0,
          wickets: parseInt(team2Wickets) || 0,
          overs: parseFloat(team2Overs) || 0
        },
        winner: team1Total > team2Total ? selectedMatch.team1._id : selectedMatch.team2._id
      };

      await updateMatchScore(selectedMatch._id, scoreData, token);
      Alert.alert('Success', 'Match score updated successfully');
      setShowScoreModal(false);
      fetchMatches();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.msg || 'Failed to update score');
    }
  };

  const isMatchCreator = (match) => {
    return match.createdBy?._id === userId;
  };

  const renderMatch = ({ item }) => {
    const team1Score = `${item.team1Score?.runs || 0}/${item.team1Score?.wickets || 0} (${item.team1Score?.overs || 0})`;
    const team2Score = `${item.team2Score?.runs || 0}/${item.team2Score?.wickets || 0} (${item.team2Score?.overs || 0})`;
    const hasWinner = item.winner?._id;
    const isWinnerTeam1 = hasWinner && item.winner._id === item.team1._id;
    const isWinnerTeam2 = hasWinner && item.winner._id === item.team2._id;

    return (
      <TouchableOpacity 
        style={styles.matchCard}
        onPress={() => isMatchCreator(item) && openScoreModal(item)}
      >
        <View style={styles.matchHeader}>
          <View style={styles.matchTypeContainer}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
            <Text style={styles.matchType}>{item.matchType}</Text>
          </View>
          {hasWinner && (
            <View style={styles.winnerBadge}>
              <Ionicons name="trophy" size={14} color={Colors.secondary} />
              <Text style={styles.winnerText}>Winner</Text>
            </View>
          )}
        </View>

        <View style={styles.teamsContainer}>
          <View style={[styles.team, isWinnerTeam1 && styles.winnerTeam]}>
            <Text style={[styles.teamName, isWinnerTeam1 && styles.winnerTeamName]}>
              {item.team1?.name || 'Team 1'}
            </Text>
            <Text style={styles.scoreText}>{team1Score}</Text>
          </View>
          
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          
          <View style={[styles.team, isWinnerTeam2 && styles.winnerTeam]}>
            <Text style={[styles.teamName, isWinnerTeam2 && styles.winnerTeamName]}>
              {item.team2?.name || 'Team 2'}
            </Text>
            <Text style={styles.scoreText}>{team2Score}</Text>
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

        {isMatchCreator(item) && (
          <View style={styles.editScoreContainer}>
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <Text style={styles.editScoreText}>Tap to update score</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
              <Ionicons name="time-outline" size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>No past matches</Text>
              <Text style={styles.emptySubText}>Your completed matches will appear here</Text>
            </View>
          }
        />
      )}

      {/* Score Update Modal */}
      <Modal
        visible={showScoreModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Match Score</Text>
              <TouchableOpacity onPress={() => setShowScoreModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.teamLabel}>{selectedMatch?.team1?.name || 'Team 1'}</Text>
              <View style={styles.scoreInputRow}>
                <TextInput
                  style={styles.scoreInput}
                  placeholder="Runs"
                  keyboardType="numeric"
                  value={team1Runs}
                  onChangeText={setTeam1Runs}
                />
                <TextInput
                  style={styles.scoreInput}
                  placeholder="Wickets"
                  keyboardType="numeric"
                  value={team1Wickets}
                  onChangeText={setTeam1Wickets}
                />
                <TextInput
                  style={styles.scoreInput}
                  placeholder="Overs"
                  keyboardType="numeric"
                  value={team1Overs}
                  onChangeText={setTeam1Overs}
                />
              </View>

              <Text style={styles.teamLabel}>{selectedMatch?.team2?.name || 'Team 2'}</Text>
              <View style={styles.scoreInputRow}>
                <TextInput
                  style={styles.scoreInput}
                  placeholder="Runs"
                  keyboardType="numeric"
                  value={team2Runs}
                  onChangeText={setTeam2Runs}
                />
                <TextInput
                  style={styles.scoreInput}
                  placeholder="Wickets"
                  keyboardType="numeric"
                  value={team2Wickets}
                  onChangeText={setTeam2Wickets}
                />
                <TextInput
                  style={styles.scoreInput}
                  placeholder="Overs"
                  keyboardType="numeric"
                  value={team2Overs}
                  onChangeText={setTeam2Overs}
                />
              </View>

              <TouchableOpacity style={styles.updateButton} onPress={handleUpdateScore}>
                <Text style={styles.updateButtonText}>Update Score</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  editScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 6,
  },
  editScoreText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  teamLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 15,
    marginBottom: 10,
  },
  scoreInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  scoreInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
