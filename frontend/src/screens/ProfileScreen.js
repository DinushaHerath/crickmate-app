import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Colors } from '../../constants/theme';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getRoleDisplay = (role) => {
    if (role === 'player') return '👤 Player';
    if (role === 'ground_owner') return '🏟️ Ground Owner';
    return role;
  };

  const getPlayerRolesDisplay = (roles) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return roles.map(role => {
      const roleMap = {
        'batsman': '🏏 Batsman',
        'bowler': '⚡ Bowler',
        'all_rounder': '⭐ All-Rounder',
        'wicket_keeper': '🧤 Wicket-keeper',
        'fielder': '🎯 Fielder'
      };
      return roleMap[role] || role;
    }).join(', ');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleDisplay(user?.role)}</Text>
        </View>
      </View>

      {/* User Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        {user?.role === 'player' && (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Player Roles</Text>
              <Text style={styles.infoValue}>
                {getPlayerRolesDisplay(user?.playerRoles)}
              </Text>
            </View>
            
            {user?.district && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>District</Text>
                <Text style={styles.infoValue}>{user.district}</Text>
              </View>
            )}
            
            {user?.village && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Village</Text>
                <Text style={styles.infoValue}>{user.village}</Text>
              </View>
            )}
          </>
        )}

        {user?.role === 'ground_owner' && (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Ground Name</Text>
              <Text style={styles.infoValue}>{user?.groundName || 'N/A'}</Text>
            </View>
            
            {user?.groundAddress && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Ground Address</Text>
                <Text style={styles.infoValue}>{user.groundAddress}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Stats Section (for players) */}
      {user?.role === 'player' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Matches Played</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Matches Won</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>ℹ️ Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.sportGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.neonGreen,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: Colors.sportGreen + '60',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neonGreen,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neonGreen,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: Colors.darkSecondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.neonGreen,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.darkSecondary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sportGreen + '40',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.neonGreen,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: Colors.darkSecondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.sportGreen + '40',
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: Colors.error + '20',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutButtonText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
