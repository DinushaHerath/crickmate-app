import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { register } from '../api/auth';
import { Colors } from '../../constants/theme';

const PLAYER_ROLES = [
  { label: 'Batsman', value: 'batsman', icon: '🏏' },
  { label: 'Bowler', value: 'bowler', icon: '⚡' },
  { label: 'All-Rounder', value: 'all_rounder', icon: '⭐' },
  { label: 'Wicket-keeper', value: 'wicket_keeper', icon: '🧤' },
  { label: 'Fielder', value: 'fielder', icon: '🎯' }
];

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState(''); // 'player' or 'ground_owner'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Player fields
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [selectedPlayerRoles, setSelectedPlayerRoles] = useState([]);
  
  // Ground owner fields
  const [groundName, setGroundName] = useState('');
  const [groundAddress, setGroundAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const togglePlayerRole = (roleValue) => {
    if (selectedPlayerRoles.includes(roleValue)) {
      setSelectedPlayerRoles(selectedPlayerRoles.filter(r => r !== roleValue));
    } else {
      setSelectedPlayerRoles([...selectedPlayerRoles, roleValue]);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (role === 'player' && selectedPlayerRoles.length === 0) {
      Alert.alert('Error', 'Please select at least one player role');
      return;
    }

    if (role === 'ground_owner' && (!groundName || !groundAddress)) {
      Alert.alert('Error', 'Please provide ground name and address');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        email,
        password,
        role
      };

      if (role === 'player') {
        payload.playerRoles = selectedPlayerRoles;
        payload.district = district;
        payload.village = village;
      } else {
        payload.groundName = groundName;
        payload.groundAddress = groundAddress;
      }

      const response = await register(payload);
      dispatch(setCredentials(response.data));
    } catch (error) {
      Alert.alert('Error', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Create Account</Text>

      {/* Role Selection */}
      {!role && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setRole('player')}
          >
            <Text style={styles.roleIcon}>👤</Text>
            <Text style={styles.roleText}>Player</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setRole('ground_owner')}
          >
            <Text style={styles.roleIcon}>🏟️</Text>
            <Text style={styles.roleText}>Ground Owner</Text>
          </TouchableOpacity>
        </View>
      )}

      {role && (
        <>
          <TouchableOpacity 
            style={styles.changeRole}
            onPress={() => setRole('')}
          >
            <Text style={styles.changeRoleText}>← Change Role</Text>
          </TouchableOpacity>

          {/* Common Fields */}
          <TextInput
            style={styles.input}
            placeholder="Name *"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password *"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Player-specific fields */}
          {role === 'player' && (
            <>
              <Text style={styles.sectionTitle}>Select Player Roles *</Text>
              <View style={styles.checkboxContainer}>
                {PLAYER_ROLES.map((playerRole) => (
                  <TouchableOpacity
                    key={playerRole.value}
                    style={[
                      styles.checkbox,
                      selectedPlayerRoles.includes(playerRole.value) && styles.checkboxSelected
                    ]}
                    onPress={() => togglePlayerRole(playerRole.value)}
                  >
                    <Text style={styles.checkboxIcon}>{playerRole.icon}</Text>
                    <Text style={[
                      styles.checkboxText,
                      selectedPlayerRoles.includes(playerRole.value) && styles.checkboxTextSelected
                    ]}>
                      {playerRole.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="District"
                placeholderTextColor={Colors.textSecondary}
                value={district}
                onChangeText={setDistrict}
              />
              <TextInput
                style={styles.input}
                placeholder="Village"
                placeholderTextColor={Colors.textSecondary}
                value={village}
                onChangeText={setVillage}
              />
            </>
          )}

          {/* Ground Owner-specific fields */}
          {role === 'ground_owner' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Ground Name *"
                placeholderTextColor={Colors.textSecondary}
                value={groundName}
                onChangeText={setGroundName}
              />
              <TextInput
                style={styles.input}
                placeholder="Ground Address *"
                placeholderTextColor={Colors.textSecondary}
                value={groundAddress}
                onChangeText={setGroundAddress}
                multiline
              />
            </>
          )}

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Register'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: Colors.primary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  roleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  changeRole: {
    marginBottom: 20,
  },
  changeRoleText: {
    color: Colors.primary,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    color: Colors.textPrimary,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkboxSelected: {
    backgroundColor: Colors.softOrange,
    borderColor: Colors.primary,
  },
  checkboxIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  checkboxTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: Colors.accent,
    padding: 15,
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
    marginTop: 15,
    fontSize: 14,
  },
});
