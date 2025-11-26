import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { register } from '../api/auth';
import { initialGroundSetup } from '../api/grounds';
import { Colors } from '../../constants/theme';

const PLAYER_ROLES = [
  { label: 'Batsman', value: 'Batsman', icon: 'baseball' },
  { label: 'Bowler', value: 'Bowler', icon: 'flash' },
  { label: 'All-Rounder', value: 'All-Rounder', icon: 'star' },
  { label: 'Wicket-keeper', value: 'Wicket-keeper', icon: 'hand-left' },
  { label: 'Fielder', value: 'Fielder', icon: 'location' }
];

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState(''); // 'player' or 'ground_owner'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Player fields
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [selectedPlayerRole, setSelectedPlayerRole] = useState(''); // Single role
  
  // Ground owner fields
  const [groundName, setGroundName] = useState('');
  const [grounds, setGrounds] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (role === 'player' && !selectedPlayerRole) {
      Alert.alert('Error', 'Please select a player role');
      return;
    }

    if (role === 'player' && (!district || !village)) {
      Alert.alert('Error', 'Please provide district and village');
      return;
    }

    if (role === 'ground_owner' && !groundName.trim()) {
      Alert.alert('Error', 'Please enter your ground name');
      return;
    }

    if (role === 'ground_owner' && !district) {
      Alert.alert('Error', 'Please provide district');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullname: name,
        email,
        password,
        role,
        district
      };

      if (role === 'player') {
        payload.playerRole = selectedPlayerRole;
        payload.village = village;
      } else {
        payload.grounds = grounds;
      }

      console.log('Registering with payload:', payload);
      const response = await register(payload);
      console.log('Registration successful:', response.data);
      
      // If ground owner, create initial ground setup
      if (role === 'ground_owner' && groundName.trim()) {
        try {
          console.log('Creating initial ground setup with name:', groundName);
          await initialGroundSetup(groundName.trim(), response.data.token);
          console.log('Ground setup successful');
        } catch (groundError) {
          console.error('Ground setup error:', groundError);
          // Don't block registration, just log the error
        }
      }
      
      dispatch(setCredentials({ user: response.data.user, token: response.data.token }));
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      Alert.alert('Registration Failed', error.response?.data?.msg || error.message || 'Network error - check if backend is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/crickmate.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Create Account</Text>
      </View>

      {/* Role Selection */}
      {!role && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setRole('player')}
          >
            <Ionicons name="person" size={32} color={Colors.primary} style={styles.roleIconStyle} />
            <Text style={styles.roleText}>Player</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setRole('ground_owner')}
          >
            <Ionicons name="business" size={32} color={Colors.primary} style={styles.roleIconStyle} />
            <Text style={styles.roleText}>Ground Owner</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      )}

      {role && (
        <>
          <TouchableOpacity 
            style={styles.changeRole}
            onPress={() => setRole('')}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={styles.changeRoleText}>Change Role</Text>
          </TouchableOpacity>

          {/* Common Fields */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Player-specific fields */}
          {role === 'player' && (
            <>
              <Text style={styles.sectionTitle}>Select Player Role *</Text>
              <View style={styles.checkboxContainer}>
                {PLAYER_ROLES.map((playerRole) => (
                  <TouchableOpacity
                    key={playerRole.value}
                    style={[
                      styles.checkbox,
                      selectedPlayerRole === playerRole.value && styles.checkboxSelected
                    ]}
                    onPress={() => setSelectedPlayerRole(playerRole.value)}
                  >
                    <Ionicons 
                      name={playerRole.icon} 
                      size={24} 
                      color={selectedPlayerRole === playerRole.value ? Colors.primary : Colors.textSecondary} 
                    />
                    <Text style={[
                      styles.checkboxText,
                      selectedPlayerRole === playerRole.value && styles.checkboxTextSelected
                    ]}>
                      {playerRole.label}
                    </Text>
                    {selectedPlayerRole === playerRole.value && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.accent} style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                ))}
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
                  placeholder="Village *"
                  placeholderTextColor={Colors.textLight}
                  value={village}
                  onChangeText={setVillage}
                />
              </View>
            </>
          )}

          {/* Ground Owner-specific fields */}
          {role === 'ground_owner' && (
            <>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ground Name *"
                  placeholderTextColor={Colors.textLight}
                  value={groundName}
                  onChangeText={setGroundName}
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
              <Text style={styles.helperText}>You can add more ground details after registration</Text>
            </>
          )}

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleIconStyle: {
    marginRight: 15,
  },
  roleText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  changeRole: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  changeRoleText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    paddingVertical: 14,
    fontSize: 16,
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  checkboxSelected: {
    backgroundColor: Colors.softOrange,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  checkboxText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  checkboxTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  button: {
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 15,
    fontStyle: 'italic',
  },
});
