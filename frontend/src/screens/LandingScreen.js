import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={[Colors.darkBackground, Colors.darkSecondary, Colors.sportGreen]}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏏 CrickMate</Text>
          <Text style={styles.tagline}>Your Ultimate Cricket Companion</Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>Build Your Team</Text>
            <Text style={styles.featureDesc}>Create and manage cricket teams with players</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🏟️</Text>
            <Text style={styles.featureTitle}>Find Grounds</Text>
            <Text style={styles.featureDesc}>Discover and book cricket grounds near you</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureTitle}>Schedule Matches</Text>
            <Text style={styles.featureDesc}>Organize matches and track upcoming games</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureTitle}>Team Chat</Text>
            <Text style={styles.featureDesc}>Real-time communication with teammates</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Track Statistics</Text>
            <Text style={styles.featureDesc}>Monitor your performance and match history</Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Join the cricket revolution today! 🚀</Text>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  contentContainer: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.neonGreen,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.sportGreen + '40',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neonGreen,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaContainer: {
    paddingHorizontal: 30,
    paddingVertical: 30,
    gap: 15,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.neonGreen,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.neonGreen,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.darkBackground,
  },
  secondaryButtonText: {
    color: Colors.neonGreen,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
