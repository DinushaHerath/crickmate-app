import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const bookings = [
    { id: '1', date: '2025-11-25', time: '09:00 AM - 12:00 PM', team: 'Thunder Strikers', status: 'Confirmed' },
    { id: '2', date: '2025-11-25', time: '02:00 PM - 05:00 PM', team: 'Royal Kings', status: 'Confirmed' },
    { id: '3', date: '2025-11-26', time: '09:00 AM - 12:00 PM', team: 'Fire Warriors', status: 'Pending' },
    { id: '4', date: '2025-11-26', time: '06:00 PM - 09:00 PM', team: 'Storm Riders', status: 'Confirmed' },
    { id: '5', date: '2025-11-27', time: '09:00 AM - 12:00 PM', team: 'Eagle Strikers', status: 'Confirmed' },
  ];

  const dates = ['24', '25', '26', '27', '28', '29', '30'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>November 2025</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
        {dates.map((date, index) => (
          <TouchableOpacity 
            key={date}
            style={[styles.dateCard, date === '25' && styles.dateCardSelected]}
            onPress={() => {}}
          >
            <Text style={[styles.dayText, date === '25' && styles.dayTextSelected]}>{days[index]}</Text>
            <Text style={[styles.dateText, date === '25' && styles.dateTextSelected]}>{date}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <ScrollView style={styles.bookingsList}>
        <Text style={styles.sectionTitle}>Bookings for Nov 25</Text>
        
        {bookings
          .filter(b => b.date === '2025-11-25')
          .map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.timeSection}>
                <Ionicons name="time" size={24} color={Colors.primary} />
                <Text style={styles.timeText}>{booking.time}</Text>
              </View>
              <View style={styles.bookingDetails}>
                <Text style={styles.teamName}>{booking.team}</Text>
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
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}

        {/* Available Slots */}
        <Text style={[styles.sectionTitle, styles.availableSlotsTitle]}>Available Slots</Text>
        <View style={styles.availableSlot}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.accent} />
          <Text style={styles.availableSlotText}>12:00 PM - 02:00 PM</Text>
        </View>
        <View style={styles.availableSlot}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.accent} />
          <Text style={styles.availableSlotText}>05:00 PM - 06:00 PM</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  dateSelector: {
    backgroundColor: Colors.white,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    minWidth: 60,
  },
  dateCardSelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dayTextSelected: {
    color: Colors.white,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  dateTextSelected: {
    color: Colors.white,
  },
  bookingsList: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  availableSlotsTitle: {
    marginTop: 20,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSection: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 80,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  bookingDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusConfirmed: {
    backgroundColor: Colors.accent + '20',
  },
  statusPending: {
    backgroundColor: Colors.secondary + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextConfirmed: {
    color: Colors.accent,
  },
  statusTextPending: {
    color: Colors.secondary,
  },
  moreButton: {
    padding: 5,
  },
  availableSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 12,
  },
  availableSlotText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
