import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../../constants/theme';
import { getUpcomingMatches } from '../../api/matches';
import { getMatchRequests, acceptMatchRequest, rejectMatchRequest } from '../../api/matchRequests';
import { getMyTeams } from '../../api/teams';

export default function UpcomingMatchesScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [matches, setMatches] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { token, user } = useSelector(state => state.auth);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const [matchesResponse, requestsResponse, teamsResponse] = await Promise.all([
        getUpcomingMatches(token),
        getMatchRequests('received', token),
        getMyTeams(token)
      ]);
      
      setMatches(matchesResponse.data || []);
      setReceivedRequests(requestsResponse.requests || []);
      setMyTeams(teamsResponse.teams || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      {/* Filter Section with Notification */}
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
        
        {/* Match Requests Notification */}
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => setShowRequestsModal(true)}
        >
          <Ionicons name="mail" size={24} color={Colors.primary} />
          {receivedRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{receivedRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
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
      
      {/* Match Requests Modal */}
      <Modal
        visible={showRequestsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Match Requests</Text>
              <TouchableOpacity onPress={() => setShowRequestsModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {receivedRequests.length > 0 ? (
                receivedRequests.map((request) => {
                  const isCaptain = myTeams.some(team => 
                    team._id === request.toTeam?._id && team.captain?.toString() === user?.id
                  );
                  
                  return (
                    <View key={request._id} style={styles.requestCard}>
                      <View style={styles.requestHeader}>
                        <Text style={styles.requestTeam}>{request.fromTeam?.name || 'Unknown Team'}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: Colors.softOrange }]}>
                          <Text style={[styles.statusText, { color: Colors.accent }]}>{request.status}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.requestDetail}>To: {request.toTeam?.name || 'Your Team'}</Text>
                      <Text style={styles.requestDetail}>Date: {new Date(request.proposedDate).toLocaleDateString()}</Text>
                      <Text style={styles.requestDetail}>Time: {request.proposedTime}</Text>
                      <Text style={styles.requestDetail}>Ground: {request.groundName}</Text>
                      {request.message && (
                        <Text style={styles.requestMessage}>"{request.message}"</Text>
                      )}
                      
                      {isCaptain && request.status === 'pending' ? (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity 
                            style={styles.acceptButton}
                            onPress={async () => {
                              try {
                                await acceptMatchRequest(request._id, token);
                                Alert.alert('Success', 'Match request accepted!');
                                fetchMatches();
                                setShowRequestsModal(false);
                              } catch (error) {
                                Alert.alert('Error', 'Failed to accept request');
                              }
                            }}
                          >
                            <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                            <Text style={styles.acceptButtonText}>Accept</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.rejectButton}
                            onPress={async () => {
                              try {
                                await rejectMatchRequest(request._id, token);
                                Alert.alert('Rejected', 'Match request rejected');
                                fetchMatches();
                              } catch (error) {
                                Alert.alert('Error', 'Failed to reject request');
                              }
                            }}
                          >
                            <Ionicons name="close-circle" size={20} color={Colors.error} />
                            <Text style={styles.rejectButtonText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Text style={styles.captainNote}>
                          {isCaptain ? 'Request already processed' : 'Only team captain can accept/reject'}
                        </Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyRequests}>
                  <Ionicons name="mail-open-outline" size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyText}>No match requests</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(formatDate(date.toString()));
            }
          }}
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
  notificationButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  modalContent: {
    padding: 15,
  },
  requestCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestTeam: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  requestDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  requestMessage: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    padding: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  rejectButtonText: {
    color: Colors.error,
    fontWeight: 'bold',
    fontSize: 14,
  },
  captainNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyRequests: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
});
