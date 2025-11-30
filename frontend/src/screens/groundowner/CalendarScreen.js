import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Linking } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Colors } from '../../../constants/theme';
import { getBookingDates, getBookingsByDate, updateBookingStatus } from '../../api/bookings';

export default function CalendarScreen({ navigation }) {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [bookingsForDate, setBookingsForDate] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    fetchBookingDates();
  }, []);

  const fetchBookingDates = async () => {
    try {
      const response = await getBookingDates(token);
      console.log('Booking dates response:', response);
      
      if (response.success && response.markedDates) {
        setMarkedDates(response.markedDates);
      }
    } catch (error) {
      console.error('Error fetching booking dates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookingDates();
    if (selectedDate) {
      fetchBookingsForDate(selectedDate);
    }
  };

  const fetchBookingsForDate = async (dateString) => {
    setLoadingBookings(true);
    try {
      const response = await getBookingsByDate(dateString, token);
      console.log('Bookings for date:', response);
      
      if (response.success) {
        setBookingsForDate(response.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookingsForDate([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    console.log('Date selected:', dateString);
    
    setSelectedDate(dateString);
    fetchBookingsForDate(dateString);
  };

  const handlePlaceBooking = () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select a date first');
      return;
    }
    navigation.navigate('PlaceBooking', { date: selectedDate, onBookingCreated: onRefresh });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return Colors.accent;
      case 'pending': return Colors.secondary;
      case 'cancelled': return Colors.error;
      case 'completed': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return Colors.accent + '20';
      case 'pending': return Colors.secondary + '20';
      case 'cancelled': return Colors.error + '20';
      case 'completed': return Colors.textSecondary + '20';
      default: return Colors.cardBackground;
    }
  };

  const getMarkedDates = () => {
    const dates = { ...markedDates };
    if (selectedDate) {
      dates[selectedDate] = {
        ...dates[selectedDate],
        selected: true,
        selectedColor: Colors.primary
      };
    }
    return dates;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      <Calendar
        markedDates={getMarkedDates()}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: Colors.white,
          calendarBackground: Colors.white,
          textSectionTitleColor: Colors.textSecondary,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: Colors.white,
          todayTextColor: Colors.primary,
          dayTextColor: Colors.textPrimary,
          textDisabledColor: Colors.textLight,
          dotColor: '#4CAF50',
          selectedDotColor: Colors.white,
          arrowColor: Colors.primary,
          monthTextColor: Colors.textPrimary,
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 15,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13
        }}
        markingType={'dot'}
        style={styles.calendar}
      />

      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addBookingButton} onPress={handlePlaceBooking}>
          <Ionicons name="add-circle" size={24} color={Colors.white} />
          <Text style={styles.addBookingText}>Place a Booking</Text>
        </TouchableOpacity>
      </View>

      {selectedDate && (
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>Bookings for {formatDate(selectedDate)}</Text>

          {loadingBookings ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : bookingsForDate.length > 0 ? (
            bookingsForDate.map((booking) => (
              <View key={booking._id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingIconContainer}>
                    <Ionicons name="person" size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.customerName}>{booking.customerName}</Text>
                    <View style={styles.contactRow}>
                      <TouchableOpacity style={styles.callRow} onPress={() => Linking.openURL(`tel:${booking.mobile}`)}>
                        <Ionicons name="call-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.contactText}>{booking.mobile}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(booking.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {formatTime(booking.timeSlot.start)} - {formatTime(booking.timeSlot.end)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color={Colors.accent} />
                    <Text style={[styles.detailText, styles.amountText]}>
                      LKR {booking.paymentAmount.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {booking.notes && (
                  <Text style={styles.notesText}>Note: {booking.notes}</Text>
                )}

                <View style={styles.actionsRow}>
                  {booking.status !== 'cancelled' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => {
                        Alert.alert(
                          'Cancel Booking',
                          'Are you sure you want to cancel this booking?',
                          [
                            { text: 'No', style: 'cancel' },
                            {
                              text: 'Yes, Cancel',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  await updateBookingStatus(booking._id, 'cancelled', token);
                                  Alert.alert('Cancelled', 'Booking has been cancelled');
                                  onRefresh();
                                } catch (e) {
                                  Alert.alert('Error', 'Failed to cancel booking');
                                }
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="close-circle" size={18} color={Colors.error} />
                      <Text style={[styles.actionText, { color: Colors.error }]}>Cancel</Text>
                    </TouchableOpacity>
                  )}

                  {booking.status !== 'completed' && booking.status !== 'cancelled' && Number(booking.paymentAmount) > 0 && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={async () => {
                        try {
                          await updateBookingStatus(booking._id, 'completed', token);
                          Alert.alert('Completed', 'Booking marked as completed');
                          onRefresh();
                        } catch (e) {
                          Alert.alert('Error', 'Failed to update booking');
                        }
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
                      <Text style={[styles.actionText, { color: Colors.accent }]}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No bookings for this date</Text>
              <Text style={styles.emptySubtext}>Tap "Place a Booking" to add one</Text>
            </View>
          )}
        </View>
      )}

      {!selectedDate && (
        <View style={styles.emptyState}>
          <Ionicons name="hand-left-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>Select a date</Text>
          <Text style={styles.emptySubtext}>Tap on a date to view or add bookings</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addBookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  addBookingText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
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
  bookingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.softOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  amountText: {
    fontWeight: 'bold',
    color: Colors.accent,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
  },
  cancelButton: {
    backgroundColor: Colors.cardBackground,
  },
  completeButton: {
    backgroundColor: Colors.cardBackground,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
