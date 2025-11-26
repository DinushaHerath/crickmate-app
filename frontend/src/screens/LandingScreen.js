import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={['#FFFFFF', '#FFE0B2', '#FF9800']}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/crickmate.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>CrickMate</Text>
          <Text style={styles.tagline}>Your Ultimate Cricket Companion</Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featureCard}>
            <Ionicons name="people" size={40} color={Colors.primary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Build Your Team</Text>
            <Text style={styles.featureDesc}>Create and manage cricket teams with players</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="location" size={40} color={Colors.primary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Find Grounds</Text>
            <Text style={styles.featureDesc}>Discover and book cricket grounds near you</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="calendar" size={40} color={Colors.primary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Schedule Matches</Text>
            <Text style={styles.featureDesc}>Organize matches and track upcoming games</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="chatbubbles" size={40} color={Colors.primary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Team Chat</Text>
            <Text style={styles.featureDesc}>Real-time communication with teammates</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="stats-chart" size={40} color={Colors.primary} style={styles.featureIcon} />
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
          <Text style={styles.footerText}>Designed & Developed by Dinusha Herath</Text>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
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
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
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
    backgroundColor: Colors.accent,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.accent,
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
