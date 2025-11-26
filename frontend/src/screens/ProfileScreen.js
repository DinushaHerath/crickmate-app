import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Colors } from '../../constants/theme';
import { getMyProfile, updateProfile } from '../api/profile';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    fullname: '',
    district: '',
    village: '',
    playerRole: '',
    age: '',
    battingStyle: '',
    bowlingStyle: '',
    bio: '',
    jerseyNumber: ''
  });

  const fetchProfile = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await getMyProfile(token);
      
      if (data && data.user) {
        setProfileData(data.user);
        setStats(data.stats);
        setTeams(data.teams || []);
        
        // Initialize edit form
        setEditForm({
          fullname: data.user.fullname || '',
          district: data.user.district || '',
          village: data.user.village || '',
          playerRole: data.user.playerRole || '',
          age: data.stats?.profile?.age?.toString() || '',
          battingStyle: data.stats?.profile?.battingStyle || '',
          bowlingStyle: data.stats?.profile?.bowlingStyle || '',
          bio: data.stats?.profile?.bio || '',
          jerseyNumber: data.stats?.profile?.jerseyNumber?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel - reset form
      const display = profileData || user;
      setEditForm({
        fullname: display?.fullname || '',
        district: display?.district || '',
        village: display?.village || '',
        playerRole: display?.playerRole || '',
        age: stats?.profile?.age?.toString() || '',
        battingStyle: stats?.profile?.battingStyle || '',
        bowlingStyle: stats?.profile?.bowlingStyle || '',
        bio: stats?.profile?.bio || '',
        jerseyNumber: stats?.profile?.jerseyNumber?.toString() || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        fullname: editForm.fullname,
        district: editForm.district,
        village: editForm.village,
        playerRole: editForm.playerRole,
        age: editForm.age ? parseInt(editForm.age) : undefined,
        battingStyle: editForm.battingStyle,
        bowlingStyle: editForm.bowlingStyle,
        bio: editForm.bio,
        jerseyNumber: editForm.jerseyNumber ? parseInt(editForm.jerseyNumber) : undefined
      };

      await updateProfile(updateData, token);
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplay = (role) => {
    if (role === 'player') return 'Player';
    if (role === 'ground_owner') return 'Ground Owner';
    return role;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const displayUser = profileData || user;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color={Colors.primary} />
        </View>
        <Text style={styles.name}>{displayUser?.fullname || 'User'}</Text>
        <Text style={styles.email}>{displayUser?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleDisplay(displayUser?.role)}</Text>
        </View>
        
        <View style={styles.buttonRow}>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.cancelButton} onPress={toggleEdit}>
                <Ionicons name="close" size={18} color={Colors.white} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.disabledButton]} 
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color={Colors.white} />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* User Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        {displayUser?.role === 'player' && (
          <>
            <View style={styles.infoCard}>
              <Ionicons name="baseball" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Player Role</Text>
                {!isEditing ? (
                  <Text style={styles.infoValue}>{displayUser?.playerRole || 'Not set'}</Text>
                ) : (
                  <View style={styles.roleSelector}>
                    {['Batsman', 'Bowler', 'All-Rounder', 'Wicket-keeper', 'Fielder'].map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleOption,
                          editForm.playerRole === role && styles.roleOptionSelected
                        ]}
                        onPress={() => setEditForm({...editForm, playerRole: role})}
                      >
                        <Text style={[
                          styles.roleOptionText,
                          editForm.playerRole === role && styles.roleOptionTextSelected
                        ]}>
                          {role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
            
            {(displayUser?.district || isEditing) && (
              <View style={styles.infoCard}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>District</Text>
                  {!isEditing ? (
                    <Text style={styles.infoValue}>{displayUser.district}</Text>
                  ) : (
                    <TextInput
                      style={styles.inlineInput}
                      value={editForm.district}
                      onChangeText={(text) => setEditForm({...editForm, district: text})}
                      placeholder="Enter district"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  )}
                </View>
              </View>
            )}
            
            {(displayUser?.village || isEditing) && (
              <View style={styles.infoCard}>
                <Ionicons name="map" size={20} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Village</Text>
                  {!isEditing ? (
                    <Text style={styles.infoValue}>{displayUser.village}</Text>
                  ) : (
                    <TextInput
                      style={styles.inlineInput}
                      value={editForm.village}
                      onChangeText={(text) => setEditForm({...editForm, village: text})}
                      placeholder="Enter village"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  )}
                </View>
              </View>
            )}
            
            {isEditing && (
              <>
                <View style={styles.infoCard}>
                  <Ionicons name="calendar" size={20} color={Colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Age</Text>
                    <TextInput
                      style={styles.inlineInput}
                      value={editForm.age}
                      onChangeText={(text) => setEditForm({...editForm, age: text})}
                      placeholder="Enter age"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                
                <View style={styles.infoCard}>
                  <Ionicons name="hand-right" size={20} color={Colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Batting Style</Text>
                    <View style={styles.styleSelector}>
                      {['Right-hand', 'Left-hand'].map((style) => (
                        <TouchableOpacity
                          key={style}
                          style={[
                            styles.styleOption,
                            editForm.battingStyle === style && styles.styleOptionSelected
                          ]}
                          onPress={() => setEditForm({...editForm, battingStyle: style})}
                        >
                          <Text style={[
                            styles.styleOptionText,
                            editForm.battingStyle === style && styles.styleOptionTextSelected
                          ]}>
                            {style}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                
                <View style={styles.infoCard}>
                  <Ionicons name="disc" size={20} color={Colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Bowling Style</Text>
                    <View style={styles.styleSelector}>
                      {['Right-arm', 'Left-arm'].map((style) => (
                        <TouchableOpacity
                          key={style}
                          style={[
                            styles.styleOption,
                            editForm.bowlingStyle === style && styles.styleOptionSelected
                          ]}
                          onPress={() => setEditForm({...editForm, bowlingStyle: style})}
                        >
                          <Text style={[
                            styles.styleOptionText,
                            editForm.bowlingStyle === style && styles.styleOptionTextSelected
                          ]}>
                            {style}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </View>

      {/* Stats Section (for players) */}
      {displayUser?.role === 'player' && stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="trophy" size={32} color={Colors.accent} />
              <Text style={styles.statValue}>{stats.totalMatches || 0}</Text>
              <Text style={styles.statLabel}>Matches Played</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.accent} />
              <Text style={styles.statValue}>{stats.wins || 0}</Text>
              <Text style={styles.statLabel}>Matches Won</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="people" size={32} color={Colors.accent} />
              <Text style={styles.statValue}>{stats.teams || 0}</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
          </View>
        </View>
      )}

      {/* Teams Section */}
      {teams.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Teams</Text>
          {teams.map((team) => (
            <View key={team._id} style={styles.teamItem}>
              <Ionicons name="shield" size={20} color={Colors.primary} />
              <Text style={styles.teamName}>{team.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.white} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    justifyContent: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  inlineInput: {
    backgroundColor: Colors.cardBackground,
    color: Colors.textPrimary,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 5,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  teamItem: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamName: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  logoutButtonText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: 'bold',
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
  modalScroll: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    color: Colors.textPrimary,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleOption: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleOptionText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  roleOptionTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  styleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  styleOption: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  styleOptionSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  styleOptionText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
