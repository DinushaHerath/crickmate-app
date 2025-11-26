import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useSelector } from 'react-redux';
import { getAvailableTeamsToJoin, sendJoinRequest, getMyJoinRequests, cancelJoinRequest } from '../../api/teamJoinRequests';

export default function JoinTeamScreen() {
  const [searchDistrict, setSearchDistrict] = useState('');
  const [availableTeams, setAvailableTeams] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMyRequestsModal, setShowMyRequestsModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const { token, user } = useSelector((state) => state.auth);

  const fetchData = async (district = '') => {
    try {
      const [teamsData, requestsData] = await Promise.all([
        getAvailableTeamsToJoin(district, token),
        getMyJoinRequests(token)
      ]);
      
      setAvailableTeams(teamsData.teams);
      setMyRequests(requestsData.requests);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load teams');
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(searchDistrict);
  };

  const handleSearch = () => {
    setLoading(true);
    fetchData(searchDistrict);
  };

  const handleSendRequest = async () => {
    if (!selectedTeam) return;

    try {
      setSending(true);
      await sendJoinRequest(selectedTeam._id, message, token);
      Alert.alert('Success', 'Join request sent successfully!');
      setShowRequestModal(false);
      setMessage('');
      fetchData(searchDistrict);
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelJoinRequest(requestId, token);
      Alert.alert('Success', 'Request cancelled');
      fetchData(searchDistrict);
    } catch (error) {
      console.error('Error cancelling request:', error);
      Alert.alert('Error', 'Failed to cancel request');
    }
  };

  const pendingRequestTeamIds = myRequests
    .filter(r => r.status === 'pending')
    .map(r => r.teamId?._id);

  const renderTeam = ({ item }) => {
    const hasPendingRequest = pendingRequestTeamIds.includes(item._id);
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
          <View style={styles.teamIconContainer}>
            <Ionicons name="shield" size={30} color={Colors.primary} />
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.name}</Text>
            <View style={styles.teamMeta}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.teamDistrict}>{item.district} - {item.village}</Text>
            </View>
            <Text style={styles.teamCaptain}>Captain: {item.captain?.fullname}</Text>
          </View>
          {hasPendingRequest && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
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
    const statusColor = {
      pending: Colors.softOrange,
      accepted: Colors.accent,
      rejected: Colors.error
    };

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.requestTeamName}>{item.teamId?.name}</Text>
            <Text style={styles.requestDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.message && (
              <Text style={styles.requestMessage}>"{item.message}"</Text>
            )}
            {item.responseMessage && (
              <Text style={styles.responseMessage}>Response: {item.responseMessage}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor[item.status] }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelRequest(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
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
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by district..."
            value={searchDistrict}
            onChangeText={setSearchDistrict}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.requestsButton}
          onPress={() => setShowMyRequestsModal(true)}
        >
          <Ionicons name="mail" size={20} color={Colors.white} />
          {myRequests.filter(r => r.status === 'pending').length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {myRequests.filter(r => r.status === 'pending').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={availableTeams}
        renderItem={renderTeam}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No teams found</Text>
            <Text style={styles.emptySubtext}>Try searching for a different district</Text>
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
                <Text style={styles.modalInfo}>Matches Played: {selectedTeam.matchesPlayed || 0}</Text>
                <Text style={styles.modalInfo}>Wins: {selectedTeam.winMatches || 0}</Text>

                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={() => {
                    setShowTeamModal(false);
                    setTimeout(() => setShowRequestModal(true), 300);
                  }}
                  disabled={pendingRequestTeamIds.includes(selectedTeam._id)}
                >
                  <Ionicons name="send" size={20} color={Colors.white} />
                  <Text style={styles.submitButtonText}>
                    {pendingRequestTeamIds.includes(selectedTeam._id) ? 'Request Pending' : 'Request to Join'}
                  </Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Request</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{padding: 20}}>
              <Text style={styles.label}>Message (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell them why you want to join..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
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
        </View>
      </Modal>

      {/* My Requests Modal */}
      <Modal
        visible={showMyRequestsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMyRequestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Join Requests</Text>
              <TouchableOpacity onPress={() => setShowMyRequestsModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={myRequests}
              renderItem={renderRequest}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{padding: 15}}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No join requests yet</Text>
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchButton: {
    width: 45,
    height: 45,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 12,
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
    height: 28,
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
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
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
    maxHeight: '90%',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  selectedTeamName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    padding: 20,
    paddingBottom: 0,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  modalInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestTeamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  responseMessage: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    height: 28,
  },
  statusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: Colors.error,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
