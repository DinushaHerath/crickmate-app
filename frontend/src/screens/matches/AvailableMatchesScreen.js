import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useSelector } from 'react-redux';
import { getAvailableTeams, getMatchRequests, sendMatchRequest, acceptMatchRequest, rejectMatchRequest } from '../../api/matchRequests';
import { getMyTeams } from '../../api/teams';

export default function AvailableMatchesScreen() {
  const [searchName, setSearchName] = useState('');
  const [availableTeams, setAvailableTeams] = useState([]);
  const [matchRequests, setMatchRequests] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  
  // Request form
  const [selectedOwnTeam, setSelectedOwnTeam] = useState(null);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [groundName, setGroundName] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [matchType, setMatchType] = useState('T20');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const { token, user } = useSelector((state) => state.auth);

  const fetchData = async () => {
    try {
      const [teamsData, requestsData, myTeamsData] = await Promise.all([
        getAvailableTeams(token),
        getMatchRequests(null, token),
        getMyTeams(token)
      ]);
      
      setAvailableTeams(teamsData.teams);
      setMatchRequests(requestsData.requests);
      setMyTeams(myTeamsData.teams);
      setDistrict(user?.district || '');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [token]);

  const filteredTeams = availableTeams.filter(team =>
    team.name.toLowerCase().includes(searchName.toLowerCase())
  );

  const pendingRequestIds = matchRequests
    .filter(r => r.status === 'pending')
    .map(r => r.receivingTeam?._id);

  const handleSendRequest = async () => {
    if (!selectedOwnTeam || !proposedDate || !proposedTime || !groundName || !district || !village) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      await sendMatchRequest({
        requestingTeamId: selectedOwnTeam,
        receivingTeamId: selectedTeam._id,
        proposedDate,
        proposedTime,
        groundName,
        district,
        village,
        matchType,
        message
      }, token);

      Alert.alert('Success', 'Match request sent successfully!');
      setShowRequestModal(false);
      fetchData();
      
      // Reset form
      setSelectedOwnTeam(null);
      setProposedDate('');
      setProposedTime('');
      setGroundName('');
      setVillage('');
      setMatchType('T20');
      setMessage('');
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      await acceptMatchRequest(request._id, 'Request accepted!', token);
      Alert.alert('Success', 'Match request accepted! Match has been created.');
      setShowRequestsModal(false);
      fetchData();
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      await rejectMatchRequest(request._id, 'Request rejected', token);
      Alert.alert('Success', 'Match request rejected');
      setShowRequestsModal(false);
      fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject request');
    }
  };

  const renderTeam = ({ item }) => {
    const hasPendingRequest = pendingRequestIds.includes(item._id);
    const winRate = item.matchesPlayed > 0 
      ? ((item.winMatches / item.matchesPlayed) * 100).toFixed(0) 
      : 0;

    return (
      <TouchableOpacity 
        style={styles.teamCard}
        onPress={() => {
          setSelectedTeam(item);
          setShowTeamModal(true);
        }}
      >
        <View style={styles.teamHeader}>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.name}</Text>
            <View style={styles.teamMeta}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.teamDistrict}>{item.district} - {item.village}</Text>
            </View>
            <Text style={styles.teamCaptain}>Captain: {item.captain?.fullname}</Text>
          </View>
          <View style={{alignItems:'flex-end'}}>
            {hasPendingRequest ? (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
            )}
          </View>
        </View>

        <View style={styles.teamStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.teamMembersId?.length || 0}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.matchesPlayed || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.winMatches || 0}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRequest = ({ item }) => {
    const isReceived = myTeams.some(t => t._id === item.receivingTeam?._id);
    const isSent = myTeams.some(t => t._id === item.requestingTeam?._id);
    const isCaptain = isReceived && myTeams.find(t => t._id === item.receivingTeam?._id)?.captain?._id === user?.id;

    return (
      <View style={styles.requestCard}>
        {/* Direction Badge */}
        <View style={[styles.directionBadge, isSent ? styles.sentBadge : styles.receivedBadge]}>
          <Ionicons 
            name={isSent ? "arrow-forward" : "arrow-back"} 
            size={12} 
            color={Colors.white} 
          />
          <Text style={styles.directionText}>
            {isSent ? 'SENT' : 'RECEIVED'}
          </Text>
        </View>

        <View style={styles.requestHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.requestTitle}>
              {item.requestingTeam?.name} vs {item.receivingTeam?.name}
            </Text>
            <View style={styles.requestInfo}>
              <Ionicons name="calendar" size={14} color={Colors.textSecondary} />
              <Text style={styles.requestDate}>
                {new Date(item.proposedDate).toLocaleDateString()} at {item.proposedTime}
              </Text>
            </View>
            <View style={styles.requestInfo}>
              <Ionicons name="location" size={14} color={Colors.textSecondary} />
              <Text style={styles.requestLocation}>
                {item.groundName}, {item.village}
              </Text>
            </View>
            <View style={styles.requestInfo}>
              <Ionicons name="trophy" size={14} color={Colors.textSecondary} />
              <Text style={styles.requestMatchType}>{item.matchType}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            item.status === 'accepted' && styles.acceptedBadge,
            item.status === 'rejected' && styles.rejectedBadge,
            item.status === 'cancelled' && styles.cancelledBadge
          ]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        {item.message && (
          <Text style={styles.requestMessage}>💬 "{item.message}"</Text>
        )}

        {item.status === 'pending' && isReceived && isCaptain && (
          <View style={styles.requestActions}>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleAcceptRequest(item)}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => handleRejectRequest(item)}
            >
              <Ionicons name="close-circle" size={20} color={Colors.white} />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Requests Button */}
      <View style={styles.header}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
            value={searchName}
            onChangeText={setSearchName}
          />
        </View>
        <TouchableOpacity 
          style={styles.requestsButton}
          onPress={() => setShowRequestsModal(true)}
        >
          <Ionicons name="mail" size={20} color={Colors.white} />
          {matchRequests.filter(r => r.status === 'pending').length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {matchRequests.filter(r => r.status === 'pending').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Teams List */}
      <FlatList
        data={filteredTeams}
        renderItem={renderTeam}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No teams available near you</Text>
          </View>
        }
      />

      {/* Team Details Modal */}
      <Modal
        visible={showTeamModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Team Details</Text>
              <TouchableOpacity onPress={() => setShowTeamModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedTeam && (
              <ScrollView>
                <Text style={styles.selectedTeamName}>{selectedTeam.name}</Text>
                <Text style={styles.modalSubtitle}>{selectedTeam.district} - {selectedTeam.village}</Text>
                <Text style={styles.modalInfo}>Captain: {selectedTeam.captain?.fullname}</Text>
                <Text style={styles.modalInfo}>Members: {selectedTeam.teamMembersId?.length || 0}</Text>
                <Text style={styles.modalInfo}>Matches: {selectedTeam.matchesPlayed || 0}</Text>
                <Text style={styles.modalInfo}>Wins: {selectedTeam.winMatches || 0}</Text>

                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={() => {
                    setShowTeamModal(false);
                    setTimeout(() => setShowRequestModal(true), 300);
                  }}
                >
                  <Ionicons name="send" size={20} color={Colors.white} />
                  <Text style={styles.submitButtonText}>Send Match Request</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Send Request Modal */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Match Request</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Select Your Team *</Text>
            {myTeams.map((team) => (
              <TouchableOpacity
                key={team._id}
                style={[
                  styles.teamOption,
                  selectedOwnTeam === team._id && styles.teamOptionSelected
                ]}
                onPress={() => setSelectedOwnTeam(team._id)}
              >
                <Text style={styles.teamOptionText}>{team.name}</Text>
                {selectedOwnTeam === team._id && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}

            <Text style={styles.label}>Proposed Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={proposedDate}
              onChangeText={setProposedDate}
            />

            <Text style={styles.label}>Proposed Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM AM/PM"
              value={proposedTime}
              onChangeText={setProposedTime}
            />

            <Text style={styles.label}>Ground Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter ground name"
              value={groundName}
              onChangeText={setGroundName}
            />

            <Text style={styles.label}>District *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter district"
              value={district}
              onChangeText={setDistrict}
            />

            <Text style={styles.label}>Village *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter village"
              value={village}
              onChangeText={setVillage}
            />

            <Text style={styles.label}>Match Type</Text>
            <View style={styles.matchTypeContainer}>
              {['T20', 'ODI', '10-Over', 'Test'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.matchTypeButton,
                    matchType === type && styles.matchTypeButtonSelected
                  ]}
                  onPress={() => setMatchType(type)}
                >
                  <Text style={[
                    styles.matchTypeText,
                    matchType === type && styles.matchTypeTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Message (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add a message..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity 
              style={[styles.submitButton, sending && styles.disabledButton]} 
              onPress={handleSendRequest}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="send" size={20} color={Colors.white} />
                  <Text style={styles.submitButtonText}>Send Request</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Match Requests Modal */}
      <Modal
        visible={showRequestsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Match Requests</Text>
              <TouchableOpacity onPress={() => setShowRequestsModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={matchRequests}
              renderItem={renderRequest}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No match requests</Text>
                </View>
              }
            />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  requestsButton: {
    width: 45,
    height: 45,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
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
    justifyContent: 'space-between',
    marginBottom: 12,
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
    marginBottom: 4,
  },
  teamDistrict: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  teamCaptain: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: Colors.softOrange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  selectedTeamName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  modalInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  teamOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamOptionSelected: {
    backgroundColor: Colors.softOrange,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  teamOptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  matchTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  matchTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
  },
  matchTypeButtonSelected: {
    backgroundColor: Colors.primary,
  },
  matchTypeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  matchTypeTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  directionBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  sentBadge: {
    backgroundColor: Colors.primary,
  },
  receivedBadge: {
    backgroundColor: Colors.accent,
  },
  directionText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 25,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  requestLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  requestMatchType: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  requestMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.softOrange,
    height: 28,
  },
  acceptedBadge: {
    backgroundColor: Colors.accent,
  },
  rejectedBadge: {
    backgroundColor: Colors.error,
  },
  cancelledBadge: {
    backgroundColor: Colors.textLight,
  },
  statusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});
