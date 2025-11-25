import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../constants/theme';
import { logout } from '../../store/slices/authSlice';

export default function GroundOwnerProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Royal Cricket Ground',
    district: 'Colombo',
    village: 'Maharagama',
    ownerName: 'John Silva',
    contact: '+94771234567',
    email: 'royal@cricketground.lk',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="business" size={60} color={Colors.primary} />
        </View>
        <Text style={styles.groundName}>{formData.name}</Text>
        <Text style={styles.location}>{formData.village}, {formData.district}</Text>
      </View>

      {/* Edit Button */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons name={isEditing ? "close" : "create-outline"} size={20} color={Colors.white} />
          <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit Profile'}</Text>
        </TouchableOpacity>
      </View>

      {/* Ground Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ground Details</Text>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Ground Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
          ) : (
            <Text style={styles.fieldValue}>{formData.name}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>District</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.district}
              onChangeText={(text) => setFormData({...formData, district: text})}
            />
          ) : (
            <Text style={styles.fieldValue}>{formData.district}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Village/City</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.village}
              onChangeText={(text) => setFormData({...formData, village: text})}
            />
          ) : (
            <Text style={styles.fieldValue}>{formData.village}</Text>
          )}
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Owner Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.ownerName}
              onChangeText={(text) => setFormData({...formData, ownerName: text})}
            />
          ) : (
            <Text style={styles.fieldValue}>{formData.ownerName}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Contact Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.contact}
              onChangeText={(text) => setFormData({...formData, contact: text})}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>{formData.contact}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.fieldValue}>{formData.email}</Text>
          )}
        </View>
      </View>

      {/* Save Button (only show when editing) */}
      {isEditing && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout Button */}
      <View style={[styles.section, styles.logoutSection]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
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
  header: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.softOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  groundName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
  },
  input: {
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 10,
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.error,
    gap: 8,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
