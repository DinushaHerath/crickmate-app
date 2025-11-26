import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useSelector } from 'react-redux';
import { getNearbyPlayers, createTeam } from '../../api/teams';

const PLAYER_ROLES = [
  'Batsman',
  'Bowler',
  'All-Rounder',
  'Wicket-keeper',
  'Fielder'
];

export default function CreateTeamScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Team Info, 2: Add Players, 3: Review
  const { token, user } = useSelector((state) => state.auth);
  
  // Team Info
  const [teamName, setTeamName] = useState('');
  const [district, setDistrict] = useState(user?.district || '');
  const [village, setVillage] = useState('');
  
  // Player Search
  const [searchName, setSearchName] = useState('');
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [creating, setCreating] = useState(false);

  // Fetch nearby players when moving to step 2
  useEffect(() => {
    if (step === 2 && district) {
      fetchNearbyPlayers();
    }
  }, [step, district]);

  const fetchNearbyPlayers = async () => {
    try {
      setLoadingPlayers(true);
      console.log('Fetching nearby players for district:', district);
      const data = await getNearbyPlayers(district, token);
      console.log('Nearby players fetched:', data.players.length);
      setNearbyPlayers(data.players);
    } catch (error) {
      console.error('Error fetching nearby players:', error);
      Alert.alert('Error', 'Failed to load nearby players');
    } finally {
      setLoadingPlayers(false);
    }
  };

  const filteredPlayers = nearbyPlayers.filter(player => {
    const matchesName = player.fullname.toLowerCase().includes(searchName.toLowerCase());
    const alreadySelected = selectedPlayers.some(p => p._id === player._id);
    return matchesName && !alreadySelected;
  });

  const handlePlayerSelect = (player) => {
    setCurrentPlayer(player);
    setShowPlayerModal(true);
  };

  const handleAddPlayer = () => {
    if (currentPlayer) {
      setSelectedPlayers([...selectedPlayers, currentPlayer]);
      setShowPlayerModal(false);
      setCurrentPlayer(null);
    }
  };

  const handleRemovePlayer = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(p => p._id !== playerId));
  };

  const handleCreateTeam = async () => {
    if (!teamName || !district || !village) {
      Alert.alert('Error', 'Please fill in team name, district, and village');
      return;
    }

    try {
      setCreating(true);
      console.log('Creating team:', { teamName, district, village, players: selectedPlayers.length });
      
      const teamData = {
        name: teamName,
        district,
        village,
        selectedPlayerIds: selectedPlayers.map(p => p._id)
      };

      const response = await createTeam(teamData, token);
      console.log('Team created:', response.team._id);
      
      Alert.alert('Success', `Team "${teamName}" created successfully!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
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
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        <Text style={styles.nextButtonText}>Next: Add Players</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add Players (Optional)</Text>
      <Text style={styles.stepSubtitle}>Invite nearby players from {district}</Text>
      
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
      </View>

      {/* Selected Players */}
      {selectedPlayers.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.sectionTitle}>
            Selected Players ({selectedPlayers.length})
          </Text>
          {selectedPlayers.map((player) => (
            <View key={player._id} style={styles.selectedPlayerCard}>
              <Text style={styles.selectedPlayerName}>{player.fullname}</Text>
              <Text style={styles.selectedPlayerRole}>{player.playerRole}</Text>
              <TouchableOpacity onPress={() => handleRemovePlayer(player._id)}>
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Players List */}
      {loadingPlayers ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading nearby players...</Text>
        </View>
      ) : filteredPlayers.length > 0 ? (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.playerCard}
              onPress={() => handlePlayerSelect(item)}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={Colors.white} />
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.fullname}</Text>
                <View style={styles.playerMeta}>
                  <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.playerLocation}>{item.village || item.district}</Text>
                </View>
                <Text style={styles.playerRole}>{item.playerRole}</Text>
              </View>
              <TouchableOpacity 
                style={styles.inviteButton}
                onPress={() => handlePlayerSelect(item)}
              >
                <Ionicons name="add-circle" size={20} color={Colors.accent} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          style={styles.playersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={Colors.textLight} />
          <Text style={styles.emptyText}>No nearby players found</Text>
        </View>
      )}

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

      <View style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>Village</Text>
        <Text style={styles.reviewValue}>{village}</Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>Players to Invite</Text>
        <Text style={styles.reviewValue}>
          {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''}
        </Text>
        {selectedPlayers.length > 0 && (
          <View style={styles.reviewPlayersList}>
            {selectedPlayers.map((player, index) => (
              <Text key={player._id} style={styles.reviewPlayerName}>
                {index + 1}. {player.fullname} ({player.playerRole})
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.createButton, creating && styles.disabledButton]} 
          onPress={handleCreateTeam}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>Create Team</Text>
            </>
          )}
        </TouchableOpacity>
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

      {/* Player Profile Modal */}
      <Modal
        visible={showPlayerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlayerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Player Profile</Text>
              <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {currentPlayer && (
              <View style={styles.playerProfileCard}>
                <View style={styles.profileAvatar}>
                  <Ionicons name="person" size={48} color={Colors.white} />
                </View>
                <Text style={styles.profileName}>{currentPlayer.fullname}</Text>
                <Text style={styles.profileRole}>{currentPlayer.playerRole}</Text>
                <View style={styles.profileLocation}>
                  <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.profileLocationText}>
                    {currentPlayer.village}, {currentPlayer.district}
                  </Text>
                </View>
                
                {currentPlayer.profile ? (
                  <View style={styles.profileStats}>
                    <Text style={styles.profileSectionTitle}>Stats</Text>
                    <View style={styles.statsRow}>
                      <View style={styles.statBox}>
                        <Text style={styles.statValue}>{currentPlayer.profile.matchesPlayed || 0}</Text>
                        <Text style={styles.statLabel}>Matches</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statValue}>{currentPlayer.profile.totalRuns || 0}</Text>
                        <Text style={styles.statLabel}>Runs</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statValue}>{currentPlayer.profile.totalWickets || 0}</Text>
                        <Text style={styles.statLabel}>Wickets</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noProfileText}>No profile data available</Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.addPlayerButton}
              onPress={handleAddPlayer}
            >
              <Ionicons name="add-circle" size={20} color={Colors.white} />
              <Text style={styles.addPlayerButtonText}>Add to Team</Text>
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
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
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
  reviewPlayersList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  reviewPlayerName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  disabledButton: {
    opacity: 0.6,
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
    maxHeight: '80%',
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
  playerProfileCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 8,
  },
  profileLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  profileLocationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  profileStats: {
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  noProfileText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 15,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  addPlayerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
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
