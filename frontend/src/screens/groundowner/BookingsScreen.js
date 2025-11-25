import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

export default function BookingsScreen() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const bookings = [
    {
      id: '1',
      person: 'Kamal Perera',
      date: '2025-11-25',
      time: '09:00 AM - 12:00 PM',
      status: 'Confirmed',
      amount: 8000,
      contact: '0771234567'
    },
    {
      id: '2',
      person: 'Nimal Silva',
      date: '2025-11-25',
      time: '02:00 PM - 05:00 PM',
      status: 'Confirmed',
      amount: 8000,
      contact: '0712345678'
    },
    {
      id: '3',
      person: 'Sunil Fernando',
      date: '2025-11-26',
      time: '09:00 AM - 12:00 PM',
      status: 'Pending',
      amount: 8000,
      contact: '0723456789'
    },
    {
      id: '4',
      person: 'Amal Jayasinghe',
      date: '2025-11-26',
      time: '06:00 PM - 09:00 PM',
      status: 'Confirmed',
      amount: 10000,
      contact: '0734567890'
    },
    {
      id: '5',
      person: 'Tharindu Wickramasinghe',
      date: '2025-11-27',
      time: '09:00 AM - 12:00 PM',
      status: 'Cancelled',
      amount: 8000,
      contact: '0745678901'
    },
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'All' || booking.status === filterStatus;
    const matchesSearch = booking.person.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.personIconContainer}>
          <Ionicons name="person" size={28} color={Colors.primary} />
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.personName}>{item.person}</Text>
          <View style={styles.dateTimeRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'Confirmed' && styles.statusConfirmed,
          item.status === 'Pending' && styles.statusPending,
          item.status === 'Cancelled' && styles.statusCancelled
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Confirmed' && styles.statusTextConfirmed,
            item.status === 'Pending' && styles.statusTextPending,
            item.status === 'Cancelled' && styles.statusTextCancelled
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>LKR {item.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="create" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search person name..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['All', 'Confirmed', 'Pending', 'Cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filterStatus === status && styles.filterTabActive
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[
              styles.filterTabText,
              filterStatus === status && styles.filterTabTextActive
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color={Colors.textLight} />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
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
    marginBottom: 15,
  },
  personIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.softOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  timeText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    height: 28,
    justifyContent: 'center',
  },
  statusConfirmed: {
    backgroundColor: Colors.accent + '20',
  },
  statusPending: {
    backgroundColor: Colors.secondary + '20',
  },
  statusCancelled: {
    backgroundColor: Colors.error + '20',
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
  statusTextCancelled: {
    color: Colors.error,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  amountSection: {},
  amountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 15,
  },
});
