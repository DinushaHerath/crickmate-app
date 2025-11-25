import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Colors } from '../../constants/theme';

const PLAYER_ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-keeper', 'Fielder'];

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  // Profile Fields
  const [name, setName] = useState('John Doe');
  const [district, setDistrict] = useState('Colombo');
  const [village, setVillage] = useState('Nugegoda');
  const [age, setAge] = useState('25');
  const [selectedRoles, setSelectedRoles] = useState(['Batsman', 'All-Rounder']);
  const [achievements, setAchievements] = useState([
    'Best Batsman 2023',
    'Century in Finals',
    'Player of the Tournament'
  ]);
  const [newAchievement, setNewAchievement] = useState('');

  // Cricket Stats
  const [matches, setMatches] = useState('45');
  const [runs, setRuns] = useState('1250');
  const [wickets, setWickets] = useState('32');
  const [catches, setCatches] = useState('18');
  const [average, setAverage] = useState('35.7');
  const [strikeRate, setStrikeRate] = useState('142.5');

  // Teams
  const myTeams = [
    { name: 'Thunder Strikers', role: 'Captain' },
    { name: 'Royal Kings', role: 'All-Rounder' }
  ];

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const removeAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    setIsEditing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={isEditing ? handleImagePick : null}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color={Colors.white} />
            </View>
          )}
          {isEditing && (
            <View style={styles.editIconOverlay}>
              <Ionicons name="camera" size={24} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>

        {isEditing ? (
          <View style={styles.editNameWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        ) : (
          <Text style={styles.name}>{name}</Text>
        )}

        {/* Edit/Save Buttons */}
        <View style={styles.actionButtons}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={20} color={Colors.white} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color={Colors.primary} />
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={district}
              onChangeText={setDistrict}
              placeholder="District"
              placeholderTextColor={Colors.textLight}
            />
          ) : (
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>District</Text>
              <Text style={styles.infoValue}>{district}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="map-outline" size={20} color={Colors.primary} />
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={village}
              onChangeText={setVillage}
              placeholder="Village"
              placeholderTextColor={Colors.textLight}
            />
          ) : (
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Village</Text>
              <Text style={styles.infoValue}>{village}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
            />
          ) : (
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{age} years</Text>
            </View>
          )}
        </View>
      </View>

      {/* Player Roles Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Player Roles</Text>
        {isEditing ? (
          <View style={styles.rolesEditContainer}>
            {PLAYER_ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleChip,
                  selectedRoles.includes(role) && styles.roleChipSelected
                ]}
                onPress={() => toggleRole(role)}
              >
                <Text style={[
                  styles.roleChipText,
                  selectedRoles.includes(role) && styles.roleChipTextSelected
                ]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.rolesContainer}>
            {selectedRoles.map((role, index) => (
              <View key={index} style={styles.roleTag}>
                <Ionicons name="star" size={16} color={Colors.secondary} />
                <Text style={styles.roleTagText}>{role}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Cricket Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cricket Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={28} color={Colors.primary} />
            {isEditing ? (
              <TextInput
                style={styles.statInput}
                value={matches}
                onChangeText={setMatches}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.statValue}>{matches}</Text>
            )}
            <Text style={styles.statLabel}>Matches</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="baseball" size={28} color={Colors.primary} />
            {isEditing ? (
              <TextInput
                style={styles.statInput}
                value={runs}
                onChangeText={setRuns}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.statValue}>{runs}</Text>
            )}
            <Text style={styles.statLabel}>Runs</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="flash" size={28} color={Colors.primary} />
            {isEditing ? (
              <TextInput
                style={styles.statInput}
                value={wickets}
                onChangeText={setWickets}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.statValue}>{wickets}</Text>
            )}
            <Text style={styles.statLabel}>Wickets</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="hand-left" size={28} color={Colors.primary} />
            {isEditing ? (
              <TextInput
                style={styles.statInput}
                value={catches}
                onChangeText={setCatches}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.statValue}>{catches}</Text>
            )}
            <Text style={styles.statLabel}>Catches</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="stats-chart" size={28} color={Colors.accent} />
            {isEditing ? (
              <TextInput
                style={styles.statInput}
                value={average}
                onChangeText={setAverage}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.statValue}>{average}</Text>
            )}
            <Text style={styles.statLabel}>Average</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="speedometer" size={28} color={Colors.accent} />
            {isEditing ? (
              <TextInput
                style={styles.statInput}
                value={strikeRate}
                onChangeText={setStrikeRate}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.statValue}>{strikeRate}</Text>
            )}
            <Text style={styles.statLabel}>Strike Rate</Text>
          </View>
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Ionicons name="trophy" size={20} color={Colors.secondary} />
            <Text style={styles.achievementText}>{achievement}</Text>
            {isEditing && (
              <TouchableOpacity onPress={() => removeAchievement(index)}>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {isEditing && (
          <View style={styles.addAchievementContainer}>
            <TextInput
              style={styles.achievementInput}
              value={newAchievement}
              onChangeText={setNewAchievement}
              placeholder="Add new achievement..."
              placeholderTextColor={Colors.textLight}
            />
            <TouchableOpacity style={styles.addButton} onPress={addAchievement}>
              <Ionicons name="add-circle" size={32} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* My Teams Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Teams</Text>
        {myTeams.map((team, index) => (
          <View key={index} style={styles.teamItem}>
            <Ionicons name="people" size={20} color={Colors.primary} />
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamRole}>{team.role}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
  },
  editIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 15,
  },
  editNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  nameInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 6,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.softOrange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  roleTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  rolesEditContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleChipSelected: {
    backgroundColor: Colors.softOrange,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  roleChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  roleChipTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '31%',
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  statInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
    textAlign: 'center',
    backgroundColor: Colors.white,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  achievementText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  addAchievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  achievementInput: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButton: {
    padding: 5,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  teamRole: {
    fontSize: 13,
    color: Colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 15,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.error,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.error,
  },
  bottomSpacer: {
    height: 40,
  },
});
