import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { login } from '../api/auth';
import { Colors } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState(''); // 'player' or 'ground_owner'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password || !role) {
      Alert.alert('Error', 'Please fill in all fields and select your role');
      return;
    }

    try {
      setLoading(true);
      const response = await login({ email, password, role });
      dispatch(setCredentials(response.data));
    } catch (error) {
      Alert.alert('Error', error.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏏</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      {/* Role Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Your Role</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              role === 'player' && styles.roleCardSelected
            ]}
            onPress={() => setRole('player')}
          >
            <Text style={styles.roleIcon}>👤</Text>
            <Text style={[
              styles.roleText,
              role === 'player' && styles.roleTextSelected
            ]}>
              Player
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              role === 'ground_owner' && styles.roleCardSelected
            ]}
            onPress={() => setRole('ground_owner')}
          >
            <Text style={styles.roleIcon}>🏟️</Text>
            <Text style={[
              styles.roleText,
              role === 'ground_owner' && styles.roleTextSelected
            ]}>
              Ground Owner
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, !role && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading || !role}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.neonGreen,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 15,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.darkSecondary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.sportGreen + '40',
  },
  roleCardSelected: {
    backgroundColor: Colors.sportGreen + '40',
    borderColor: Colors.neonGreen,
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTextSelected: {
    color: Colors.neonGreen,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.sportGreen,
    backgroundColor: Colors.darkSecondary,
    color: Colors.white,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.neonGreen,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: Colors.sportGreen + '60',
  },
  buttonText: {
    color: Colors.darkBackground,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: Colors.neonGreen,
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
});
