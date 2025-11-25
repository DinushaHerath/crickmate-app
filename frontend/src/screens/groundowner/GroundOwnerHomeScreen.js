import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

export default function GroundOwnerHomeScreen({ navigation }) {
  const groundStats = {
    todayBookings: 5,
    weekRevenue: 45000,
    totalBookings: 128,
    rating: 4.8
  };

  const todayBookings = [
    {
      id: '1',
      person: 'Kamal Perera',
      mobile: '0771234567',
      time: '09:00 AM - 12:00 PM',
      status: 'Confirmed',
      amount: 8000
    },
    {
      id: '2',
      person: 'Nimal Silva',
      mobile: '0779876543',
      time: '02:00 PM - 05:00 PM',
      status: 'Confirmed',
      amount: 8000
    },
    {
      id: '3',
      person: 'Sunil Fernando',
      mobile: '0761234567',
      time: '06:00 PM - 09:00 PM',
      status: 'Pending',
      amount: 10000
    }
  ];

  const pendingRequests = 12;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.groundName}>Royal Cricket Ground</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={28} color={Colors.white} />
          {pendingRequests > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{pendingRequests}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={32} color={Colors.primary} />
          <Text style={styles.statValue}>{groundStats.todayBookings}</Text>
          <Text style={styles.statLabel}>Today's Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={32} color={Colors.accent} />
          <Text style={styles.statValue}>LKR {groundStats.weekRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Week Revenue</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="list" size={32} color={Colors.secondary} />
          <Text style={styles.statValue}>{groundStats.totalBookings}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={32} color={Colors.secondary} />
          <Text style={styles.statValue}>{groundStats.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Today's Bookings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Bookings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {todayBookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.personIconContainer}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.personName}>{booking.person}</Text>
                <View style={styles.bookingTime}>
                  <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.timeText}>{booking.time}</Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                booking.status === 'Confirmed' ? styles.statusConfirmed : styles.statusPending
              ]}>
                <Text style={[
                  styles.statusText,
                  booking.status === 'Confirmed' ? styles.statusTextConfirmed : styles.statusTextPending
                ]}>
                  {booking.status}
                </Text>
              </View>
            </View>
            <View style={styles.bookingFooter}>
              <Text style={styles.amountText}>LKR {booking.amount.toLocaleString()}</Text>
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Details</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  groundName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 5,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  notificationBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  personIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.softOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bookingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: Colors.accent + '20',
  },
  statusPending: {
    backgroundColor: Colors.secondary + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextConfirmed: {
    color: Colors.accent,
  },
  statusTextPending: {
    color: Colors.secondary,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
