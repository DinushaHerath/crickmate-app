import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useSelector } from 'react-redux';
import { getTeamInvitations, respondToInvitation } from '../../api/teams';

export default function TeamInvitationsScreen({ navigation }) {
  const token = useSelector((state) => state.auth.token);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvitations = async () => {
    try {
      const response = await getTeamInvitations(token);
      if (response.success) {
        setInvitations(response.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      Alert.alert('Error', 'Failed to load team invitations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvitations();
  };

  const handleAccept = async (invitationId) => {
    try {
      const response = await respondToInvitation(invitationId, 'accepted', token);
      if (response.success) {
        Alert.alert('Success', 'You have joined the team!');
        fetchInvitations(); // Refresh the list
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert('Error', 'Failed to accept invitation');
    }
  };

  const handleReject = async (invitationId) => {
    try {
      const response = await respondToInvitation(invitationId, 'rejected', token);
      if (response.success) {
        Alert.alert('Rejected', 'Invitation has been rejected');
        fetchInvitations(); // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      Alert.alert('Error', 'Failed to reject invitation');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.textSecondary }}>Loading invitations...</Text>
      </View>
    );
  }

  const renderInvitation = ({ item }) => (
    <View style={[
      styles.invitationCard,
      item.status === 'accepted' && styles.acceptedCard
    ]}>
      <View style={styles.invitationHeader}>
        <Text style={styles.teamLogo}>🏏</Text>
        <View style={styles.invitationInfo}>
          <Text style={styles.teamName}>{item.teamId?.name || 'Team'}</Text>
          <View style={styles.invitationMeta}>
            <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.fromText}>From: {item.invitedBy?.fullname || 'Team Captain'}</Text>
          </View>
          <View style={styles.invitationMeta}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </View>

      {item.status === 'pending' ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAccept(item._id)}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => handleReject(item._id)}
          >
            <Ionicons name="close-circle" size={20} color={Colors.error} />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusContainer}>
          <Ionicons 
            name={item.status === 'accepted' ? 'checkmark-done' : 'close-circle'} 
            size={24} 
            color={item.status === 'accepted' ? Colors.accent : Colors.error} 
          />
          <Text style={styles.statusText}>{item.status === 'accepted' ? 'Accepted' : 'Rejected'}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {invitations.filter(inv => inv.status === 'pending').length > 0 && (
        <View style={styles.headerBanner}>
          <Ionicons name="notifications-circle" size={24} color={Colors.white} />
          <Text style={styles.headerText}>
            You have {invitations.filter(inv => inv.status === 'pending').length} pending invitation(s)
          </Text>
        </View>
      )}

      <FlatList
        data={invitations}
        renderItem={renderInvitation}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-open-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No invitations</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
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
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    padding: 15,
    gap: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  invitationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  acceptedCard: {
    borderColor: Colors.accent,
    backgroundColor: Colors.softOrange,
  },
  invitationHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  teamLogo: {
    fontSize: 48,
    marginRight: 15,
  },
  invitationInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  invitationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 5,
  },
  fromText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  roleText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.error,
    gap: 6,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.error,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 5,
  },
});
