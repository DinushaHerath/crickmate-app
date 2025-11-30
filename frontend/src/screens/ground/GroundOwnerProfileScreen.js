import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { getMyGround, saveGroundProfile } from '../../api/grounds';

export default function GroundOwnerProfileScreen() {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [groundName, setGroundName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [pitchType, setPitchType] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [halfDayRate, setHalfDayRate] = useState('');
  const [fullDayRate, setFullDayRate] = useState('');

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchGroundData();
  }, []);

  const fetchGroundData = async () => {
    try {
      const response = await getMyGround(token);
      
      if (response.success) {
        if (response.ground) {
          // Ground exists - populate form
          const ground = response.ground;
          setGroundName(ground.groundName || '');
          setAddress(ground.address || '');
          setDistrict(ground.district || '');
          setVillage(ground.village || '');
          setPhone(ground.contact?.phone || '');
          setEmail(ground.contact?.email || '');
          setWhatsapp(ground.contact?.whatsapp || '');
          setDescription(ground.description || '');
          setCapacity(ground.capacity?.toString() || '');
          setPitchType(ground.pitchType || '');
          setHourlyRate(ground.pricing?.hourlyRate?.toString() || '');
          setHalfDayRate(ground.pricing?.halfDayRate?.toString() || '');
          setFullDayRate(ground.pricing?.fullDayRate?.toString() || '');
          
          setOriginalData(ground);
        } else if (response.userData) {
          // No ground - pre-fill from user data
          setEmail(response.userData.email || '');
          setDistrict(response.userData.district || '');
          setVillage(response.userData.village || '');
          setIsEditing(true); // Start in edit mode if no ground exists
        }
      }
    } catch (error) {
      console.error('Error fetching ground:', error);
      Alert.alert('Error', 'Failed to load ground data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!groundName.trim()) {
      Alert.alert('Error', 'Ground name is required');
      return;
    }

    setSaving(true);
    try {
      const groundData = {
        groundName: groundName.trim(),
        address: address.trim(),
        district: district.trim(),
        village: village.trim(),
        contact: {
          phone: phone.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim()
        },
        description: description.trim(),
        capacity: capacity ? parseInt(capacity) : null,
        pitchType: pitchType || null,
        pricing: {
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          halfDayRate: halfDayRate ? parseFloat(halfDayRate) : null,
          fullDayRate: fullDayRate ? parseFloat(fullDayRate) : null
        }
      };

      const response = await saveGroundProfile(groundData, token);
      
      if (response.success) {
        Alert.alert('Success', response.message);
        setIsEditing(false);
        fetchGroundData(); // Refresh data
      }
    } catch (error) {
      console.error('Error saving ground:', error);
      Alert.alert('Error', 'Failed to save ground profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData.groundName) {
      // Reset to original data
      fetchGroundData();
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.iconContainer}>
            <Ionicons name="business" size={40} color={Colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.groundNameHeader}>{groundName || 'My Ground'}</Text>
            <Text style={styles.headerSubtitle}>{district && village ? `${village}, ${district}` : 'Ground Owner'}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Ionicons name="close" size={18} color={Colors.white} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.disabledButton]} 
                onPress={handleSave}
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

      {/* Form Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ground Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={groundName}
                  onChangeText={setGroundName}
                  placeholder="Enter ground name"
                  placeholderTextColor={Colors.textSecondary}
                />
              ) : (
                <Text style={styles.infoValue}>{groundName || '-'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.inlineInput, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter address"
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                />
              ) : (
                <Text style={styles.infoValue}>{address || '-'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="map-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>District</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="Enter district"
                  placeholderTextColor={Colors.textSecondary}
                />
              ) : (
                <Text style={styles.infoValue}>{district || '-'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="home-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Village</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={village}
                  onChangeText={setVillage}
                  placeholder="Enter village"
                  placeholderTextColor={Colors.textSecondary}
                />
              ) : (
                <Text style={styles.infoValue}>{village || '-'}</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{phone || 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.infoValue}>{email || 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="logo-whatsapp" size={20} color={Colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>WhatsApp</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  placeholder="WhatsApp number"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{whatsapp || 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Ground Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ground Details</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="cellular-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Pitch Type</Text>
              {isEditing ? (
                <View style={styles.roleSelector}>
                  {['Turf', 'Matting', 'Grass', 'Cement', 'Mixed'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.roleOption,
                        pitchType === type && styles.roleOptionSelected
                      ]}
                      onPress={() => setPitchType(type)}
                    >
                      <Text style={[
                        styles.roleText,
                        pitchType === type && styles.roleTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>{pitchType || 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Capacity</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={capacity}
                  onChangeText={setCapacity}
                  placeholder="Number of people"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="number-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{capacity ? `${capacity} people` : 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.inlineInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe your ground..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              ) : (
                <Text style={styles.infoValue}>{description || 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing (LKR)</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Hourly Rate</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{hourlyRate ? `LKR ${hourlyRate}` : 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="partly-sunny-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Half Day Rate</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={halfDayRate}
                  onChangeText={setHalfDayRate}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{halfDayRate ? `LKR ${halfDayRate}` : 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="sunny-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Day Rate</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={fullDayRate}
                  onChangeText={setFullDayRate}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{fullDayRate ? `LKR ${fullDayRate}` : 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.white} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  groundNameHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  section: {
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inlineInput: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
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
  roleText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  roleTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  logoutSection: {
    padding: 20,
    paddingTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
