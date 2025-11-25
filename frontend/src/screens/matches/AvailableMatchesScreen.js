import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { MOCK_TEAMS } from '../../data/mockData';

export default function AvailableMatchesScreen() {
  const [searchName, setSearchName] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchVillage, setSearchVillage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [groundName, setGroundName] = useState('');

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
    alert(`Match request sent to ${selectedTeam.name}`);
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
        setShowRequestModal(true);
      }}
    >
      <View style={styles.teamHeader}>
        <Text style={styles.teamLogo}>{item.logo}</Text>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <View style={styles.teamMeta}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.teamDistrict}>{item.district}</Text>
          </View>
          <Text style={styles.teamCaptain}>Captain: {item.captain}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
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
