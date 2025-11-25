import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { MOCK_PLAYERS } from '../../data/mockData';

const PLAYER_ROLES = [
  'Batsman',
  'Bowler',
  'All-Rounder',
  'Wicket-keeper',
  'Fielder'
];

export default function CreateTeamScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Team Info, 2: Add Players, 3: Review
  
  // Team Info
  const [teamName, setTeamName] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  
  // Player Search
  const [searchName, setSearchName] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchVillage, setSearchVillage] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  
  // Mock created teams and invites
  const [createdTeams, setCreatedTeams] = useState([
    {
      id: '1',
      name: 'Thunder Strikers',
      district: 'Colombo',
      members: 12,
      pendingInvites: 3,
      acceptedInvites: 9
    }
  ]);

  const filteredPlayers = MOCK_PLAYERS.filter(player => {
    const matchesName = player.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesDistrict = searchDistrict === '' || player.district?.toLowerCase().includes(searchDistrict.toLowerCase());
    const matchesVillage = searchVillage === '' || player.village?.toLowerCase().includes(searchVillage.toLowerCase());
    return matchesName && matchesDistrict && matchesVillage;
  });

  const handlePlayerSelect = (player) => {
    setCurrentPlayer(player);
    setShowPlayerModal(true);
  };

  const handleSendInvite = () => {
    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role for the player');
      return;
    }
    
    const invitation = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      role: selectedRole
    };
    
    setSelectedPlayers([...selectedPlayers, invitation]);
    Alert.alert('Success', `Invitation sent to ${currentPlayer.name} as ${selectedRole}`);
    setShowPlayerModal(false);
    setSelectedRole('');
    setCurrentPlayer(null);
  };

  const handleCreateTeam = () => {
    if (!teamName || !district) {
      Alert.alert('Error', 'Please fill in team name and district');
      return;
    }
    
    Alert.alert('Success', 'Team created successfully!');
    navigation.goBack();
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Team Information</Text>
      
      <View style={styles.inputWrapper}>
        <Ionicons name="trophy-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Team Name *"
          placeholderTextColor={Colors.textLight}
          value={teamName}
          onChangeText={setTeamName}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="location-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="District *"
          placeholderTextColor={Colors.textLight}
          value={district}
          onChangeText={setDistrict}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="map-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Village"
          placeholderTextColor={Colors.textLight}
          value={village}
          onChangeText={setVillage}
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
        <Text style={styles.buttonText}>Next: Add Players</Text>
        <Ionicons name="arrow-forward" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add Players</Text>
      
      {/* Search Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={Colors.textLight}
            value={searchName}
            onChangeText={setSearchName}
          />
        </View>
        
        <View style={styles.searchRow}>
          <View style={[styles.searchInputWrapper, styles.halfWidth]}>
            <Ionicons name="location" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="District..."
              placeholderTextColor={Colors.textLight}
              value={searchDistrict}
              onChangeText={setSearchDistrict}
            />
          </View>
          
          <View style={[styles.searchInputWrapper, styles.halfWidth]}>
            <Ionicons name="map" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Village..."
              placeholderTextColor={Colors.textLight}
              value={searchVillage}
              onChangeText={setSearchVillage}
            />
          </View>
        </View>
      </View>

      {/* Selected Players */}
      {selectedPlayers.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.sectionTitle}>
            Selected Players ({selectedPlayers.length})
          </Text>
          {selectedPlayers.map((invite, index) => (
            <View key={index} style={styles.selectedPlayerCard}>
              <Text style={styles.selectedPlayerName}>{invite.playerName}</Text>
              <Text style={styles.selectedPlayerRole}>{invite.role}</Text>
              <TouchableOpacity
                onPress={() => setSelectedPlayers(selectedPlayers.filter((_, i) => i !== index))}
              >
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Players List */}
      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.playerCard}
            onPress={() => handlePlayerSelect(item)}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={Colors.white} />
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.name}</Text>
              <View style={styles.playerMeta}>
                <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.playerLocation}>{item.district}</Text>
              </View>
              <Text style={styles.playerRole}>{item.position}</Text>
            </View>
            <TouchableOpacity 
              style={styles.inviteButton}
              onPress={() => handlePlayerSelect(item)}
            >
              <Ionicons name="add-circle" size={24} color={Colors.accent} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        style={styles.playersList}
      />

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={() => setStep(3)}>
          <Text style={styles.buttonText}>Review</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review & Create</Text>
      
      <View style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>Team Name</Text>
        <Text style={styles.reviewValue}>{teamName}</Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>District</Text>
        <Text style={styles.reviewValue}>{district}</Text>
      </View>

      {village && (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewLabel}>Village</Text>
          <Text style={styles.reviewValue}>{village}</Text>
        </View>
      )}

      <View style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>Players Invited</Text>
        <Text style={styles.reviewValue}>{selectedPlayers.length} players</Text>
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.createButton} onPress={handleCreateTeam}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
          <Text style={styles.buttonText}>Create Team</Text>
        </TouchableOpacity>
      </View>

      {/* My Teams Section */}
      <View style={styles.myTeamsSection}>
        <Text style={styles.sectionTitle}>My Teams</Text>
        {createdTeams.map((team) => (
          <View key={team.id} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Ionicons name="trophy" size={32} color={Colors.primary} />
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.teamDistrict}>{team.district}</Text>
              </View>
            </View>
            
            <View style={styles.teamStats}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={20} color={Colors.primary} />
                <Text style={styles.statText}>{team.members} Members</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={20} color={Colors.secondary} />
                <Text style={styles.statText}>{team.pendingInvites} Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                <Text style={styles.statText}>{team.acceptedInvites} Accepted</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
          <Text style={[styles.progressNumber, step >= 1 && styles.progressNumberActive]}>1</Text>
        </View>
        <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
          <Text style={[styles.progressNumber, step >= 2 && styles.progressNumberActive]}>2</Text>
        </View>
        <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
        <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]}>
          <Text style={[styles.progressNumber, step >= 3 && styles.progressNumberActive]}>3</Text>
        </View>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Role Selection Modal */}
      <Modal
        visible={showPlayerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlayerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Role</Text>
              <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {currentPlayer && (
              <View style={styles.playerPreview}>
                <Text style={styles.playerPreviewName}>{currentPlayer.name}</Text>
                <Text style={styles.playerPreviewPosition}>{currentPlayer.position}</Text>
              </View>
            )}

            <Text style={styles.modalLabel}>Select role for this player:</Text>
            {PLAYER_ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  selectedRole === role && styles.roleOptionSelected
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text style={[
                  styles.roleOptionText,
                  selectedRole === role && styles.roleOptionTextSelected
                ]}>
                  {role}
                </Text>
                {selectedRole === role && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.sendInviteButton} onPress={handleSendInvite}>
              <Ionicons name="send" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>Send Invitation</Text>
            </TouchableOpacity>
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  progressStepActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  progressNumberActive: {
    color: Colors.white,
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: Colors.border,
  },
  progressLineActive: {
    backgroundColor: Colors.primary,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  selectedSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  selectedPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.softOrange,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  selectedPlayerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectedPlayerRole: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 10,
  },
  playersList: {
    flex: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  playerLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  playerRole: {
    fontSize: 12,
    color: Colors.primary,
  },
  inviteButton: {
    padding: 5,
  },
  stepButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  reviewValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  myTeamsSection: {
    marginTop: 30,
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
    alignItems: 'center',
    marginBottom: 15,
  },
  teamInfo: {
    marginLeft: 12,
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  teamDistrict: {
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    maxHeight: '70%',
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
  playerPreview: {
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  playerPreviewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  playerPreviewPosition: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleOptionSelected: {
    backgroundColor: Colors.softOrange,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  roleOptionText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  roleOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  sendInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
});
