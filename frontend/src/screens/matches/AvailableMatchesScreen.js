import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { MOCK_TEAMS } from '../../data/mockData';

export default function AvailableMatchesScreen() {
  const [searchName, setSearchName] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchVillage, setSearchVillage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [groundName, setGroundName] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOwnTeamId, setSelectedOwnTeamId] = useState(null);

  const filteredTeams = MOCK_TEAMS.filter(team => {
    const matchesName = team.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesDistrict = searchDistrict === '' || team.district?.toLowerCase().includes(searchDistrict.toLowerCase());
    const matchesVillage = searchVillage === '' || team.village?.toLowerCase().includes(searchVillage.toLowerCase());
    return matchesName && matchesDistrict && matchesVillage;
  });

  const handleRequestMatch = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }
    // mark as pending locally
    if (selectedTeam?.id) setPendingRequests(prev => [...prev, selectedTeam.id]);
    alert(`Match request sent to ${selectedTeam?.name || 'team'}. Status: Pending`);
    setShowRequestModal(false);
    setSelectedDate('');
    setSelectedTime('');
    setGroundName('');
  };

  const renderTeam = ({ item }) => (
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
            <Text style={styles.teamDistrict}>{item.district}</Text>
          </View>
          <Text style={styles.teamCaptain}>Captain: {item.captain}</Text>
        </View>
        <View style={{alignItems:'flex-end'}}>
          {pendingRequests.includes(item.id) ? (
            <View style={styles.pendingBadge}><Text style={styles.pendingText}>Pending</Text></View>
          ) : (
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          )}
        </View>
      </View>

      <View style={styles.teamStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.matches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{((item.wins / item.matches) * 100).toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search team name..."
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
              value={searchDistrict}
              onChangeText={setSearchDistrict}
            />
          </View>
          
          <View style={[styles.searchInputWrapper, styles.halfWidth]}>
            <Ionicons name="map" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Village..."
              value={searchVillage}
              onChangeText={setSearchVillage}
            />
          </View>
        </View>
      </View>

      {/* Schedule / Teams List */}
      <View style={styles.topActionsRow}>
        <TouchableOpacity style={styles.scheduleButton} onPress={() => setShowScheduleModal(true)}>
          <Ionicons name="calendar" size={18} color={Colors.white} />
          <Text style={styles.scheduleButtonText}>Schedule Match</Text>
        </TouchableOpacity>
      </View>

      {/* Teams List */}
      <FlatList
        data={filteredTeams}
        renderItem={renderTeam}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No teams found</Text>
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
              <ScrollView style={{paddingHorizontal:20}}>
                <Text style={styles.selectedTeamName}>{selectedTeam.name}</Text>
                <Text style={{color:Colors.textSecondary, marginBottom:8}}>{selectedTeam.district}</Text>
                <Text style={{marginBottom:8}}>Captain: {selectedTeam.captain}</Text>
                <Text style={{marginBottom:8}}>Members: {selectedTeam.members}</Text>
                <Text style={{marginBottom:12}} numberOfLines={4}>{selectedTeam.description || ''}</Text>

                <TouchableOpacity style={styles.submitButton} onPress={() => {
                  setShowTeamModal(false);
                  setShowRequestModal(true);
                }}>
                  <Ionicons name="send" size={18} color={Colors.white} />
                  <Text style={styles.submitButtonText}>Invite for Match</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Request Match Modal */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Match</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedTeam && (
              <View style={styles.selectedTeamInfo}>
                <Text style={styles.selectedTeamLogo}>{selectedTeam.logo}</Text>
                <Text style={styles.selectedTeamName}>{selectedTeam.name}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Match Date *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Match Time *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM AM/PM"
                  value={selectedTime}
                  onChangeText={setSelectedTime}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ground Name (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter ground name..."
                  value={groundName}
                  onChangeText={setGroundName}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleRequestMatch}>
              <Ionicons name="send" size={20} color={Colors.white} />
              <Text style={styles.submitButtonText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Schedule Match Modal (choose your team first) */}
      <Modal
        visible={showScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Match</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={{padding:20}}>
              <Text style={styles.label}>Choose Your Team</Text>
              {/* list user's teams - using MOCK_TEAMS for demo */}
              {MOCK_TEAMS.map(t => (
                <TouchableOpacity key={t.id} style={[styles.teamSelectRow, selectedOwnTeamId === t.id && styles.teamSelectRowActive]} onPress={() => setSelectedOwnTeamId(t.id)}>
                  <Text style={styles.teamName}>{t.name}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.label,{marginTop:16}]}>Now select opponent from list below</Text>
              <Text style={{color:Colors.textSecondary,marginBottom:8}}>Search opponent by name, district or village</Text>
              <TouchableOpacity style={styles.submitButton} onPress={() => { setShowScheduleModal(false); }}>
                <Text style={styles.submitButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
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
  searchContainer: {
    padding: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  teamLogo: {
    fontSize: 42,
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
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
  pendingBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pendingText: {
    color: Colors.white,
    fontWeight: '600',
  },
  topActionsRow: {
    padding: 12,
    backgroundColor: Colors.background,
    alignItems: 'flex-end',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  scheduleButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  teamSelectRow: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
    marginBottom: 8,
  },
  teamSelectRowActive: {
    backgroundColor: Colors.primary,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  selectedTeamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 15,
  },
  selectedTeamLogo: {
    fontSize: 48,
  },
  selectedTeamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
