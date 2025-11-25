import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

// Mock invitations data
const MOCK_INVITATIONS = [
  {
    id: '1',
    teamName: 'Thunder Strikers',
    teamLogo: '⚡',
    from: 'John Player',
    role: 'All-Rounder',
    date: '2024-02-14',
    status: 'pending',
  },
  {
    id: '2',
    teamName: 'Royal Warriors',
    teamLogo: '👑',
    from: 'Mike Champion',
    role: 'Batsman',
    date: '2024-02-13',
    status: 'pending',
  },
];

export default function TeamInvitationsScreen({ navigation }) {
  const [invitations, setInvitations] = useState(MOCK_INVITATIONS);

  const handleAccept = (invitationId) => {
    setInvitations(invitations.map(inv => 
      inv.id === invitationId ? { ...inv, status: 'accepted' } : inv
    ));
    alert('Invitation accepted! You have been added to the team.');
  };

  const handleReject = (invitationId) => {
    setInvitations(invitations.filter(inv => inv.id !== invitationId));
    alert('Invitation rejected.');
  };

  const renderInvitation = ({ item }) => (
    <View style={[
      styles.invitationCard,
      item.status === 'accepted' && styles.acceptedCard
    ]}>
      <View style={styles.invitationHeader}>
        <Text style={styles.teamLogo}>{item.teamLogo}</Text>
        <View style={styles.invitationInfo}>
          <Text style={styles.teamName}>{item.teamName}</Text>
          <View style={styles.invitationMeta}>
            <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.fromText}>From: {item.from}</Text>
          </View>
          <View style={styles.invitationMeta}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
      </View>

      <View style={styles.roleContainer}>
        <Ionicons name="trophy-outline" size={16} color={Colors.secondary} />
        <Text style={styles.roleText}>Invited as: {item.role}</Text>
      </View>

      {item.status === 'pending' ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAccept(item.id)}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
          >
            <Ionicons name="close-circle" size={20} color={Colors.error} />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-done" size={24} color={Colors.accent} />
          <Text style={styles.statusText}>Accepted</Text>
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-open-outline" size={64} color={Colors.textLight} />
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
