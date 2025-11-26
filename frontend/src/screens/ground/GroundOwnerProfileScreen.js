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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="business" size={50} color={Colors.primary} />
        </View>
        <Text style={styles.groundNameHeader}>{groundName || 'My Ground'}</Text>
        
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
        
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Ground Name *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={groundName}
              onChangeText={setGroundName}
              placeholder="Enter ground name"
              placeholderTextColor={Colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{groundName || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Address</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter full address"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.value}>{address || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>District</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={district}
                onChangeText={setDistrict}
                placeholder="District"
                placeholderTextColor={Colors.textSecondary}
              />
            ) : (
              <Text style={styles.value}>{district || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Village</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={village}
                onChangeText={setVillage}
                placeholder="Village"
                placeholderTextColor={Colors.textSecondary}
              />
            ) : (
              <Text style={styles.value}>{village || 'Not set'}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{phone || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>{email || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>WhatsApp</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="WhatsApp number"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{whatsapp || 'Not set'}</Text>
          )}
        </View>
      </View>

      {/* Ground Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ground Details</Text>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Pitch Type</Text>
          {isEditing ? (
            <View style={styles.pitchTypeSelector}>
              {['Turf', 'Matting', 'Grass', 'Cement', 'Mixed'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pitchTypeOption,
                    pitchType === type && styles.pitchTypeSelected
                  ]}
                  onPress={() => setPitchType(type)}
                >
                  <Text style={[
                    styles.pitchTypeText,
                    pitchType === type && styles.pitchTypeTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>{pitchType || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Capacity</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={capacity}
              onChangeText={setCapacity}
              placeholder="Number of people"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="number-pad"
            />
          ) : (
            <Text style={styles.value}>{capacity ? `${capacity} people` : 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your ground..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.value}>{description || 'Not set'}</Text>
          )}
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing (LKR)</Text>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Hourly Rate</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="decimal-pad"
            />
          ) : (
            <Text style={styles.value}>{hourlyRate ? `LKR ${hourlyRate}` : 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Half Day Rate</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={halfDayRate}
              onChangeText={setHalfDayRate}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="decimal-pad"
            />
          ) : (
            <Text style={styles.value}>{halfDayRate ? `LKR ${halfDayRate}` : 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Full Day Rate</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={fullDayRate}
              onChangeText={setFullDayRate}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="decimal-pad"
            />
          ) : (
            <Text style={styles.value}>{fullDayRate ? `LKR ${fullDayRate}` : 'Not set'}</Text>
          )}
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
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
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  groundNameHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  value: {
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 8,
  },
  pitchTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pitchTypeOption: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pitchTypeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pitchTypeText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  pitchTypeTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 15,
    borderRadius: 8,
    gap: 10,
    marginTop: 10,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
