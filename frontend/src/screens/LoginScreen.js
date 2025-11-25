import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
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

    // For now, skip backend and navigate directly based on role
    if (role === 'player') {
      dispatch(setCredentials({ user: { role: 'player', email, name: 'Player' }, token: 'mock-token' }));
    } else if (role === 'ground_owner') {
      dispatch(setCredentials({ user: { role: 'ground_owner', email, name: 'Ground Owner' }, token: 'mock-token' }));
    }

    // Uncomment when backend is ready:
    // try {
    //   setLoading(true);
    //   const response = await login({ email, password, role });
    //   dispatch(setCredentials(response.data));
    // } catch (error) {
    //   Alert.alert('Error', error.message || 'Login failed');
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/crickmate.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
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
            <Ionicons 
              name="person" 
              size={32} 
              color={role === 'player' ? Colors.primary : Colors.textSecondary} 
              style={styles.roleIcon} 
            />
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
            <Ionicons 
              name="business" 
              size={32} 
              color={role === 'ground_owner' ? Colors.primary : Colors.textSecondary} 
              style={styles.roleIcon} 
            />
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
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  roleCardSelected: {
    backgroundColor: Colors.softOrange,
    borderColor: Colors.primary,
  },
  roleIcon: {
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTextSelected: {
    color: Colors.primary,
  },
  form: {
    marginBottom: 20,
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
  button: {
    backgroundColor: Colors.accent,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: Colors.textLight,
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
