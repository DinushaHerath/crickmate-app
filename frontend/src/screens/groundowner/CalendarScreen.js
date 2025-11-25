import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // November 2025
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    personName: '',
    mobile: '',
    payment: '',
    date: '',
    timeSlot: '',
  });
  
  const bookings = [
    { id: '1', date: '2025-11-25', time: '09:00 AM - 12:00 PM', person: 'Kamal Perera', mobile: '0771234567', payment: 8000, status: 'Confirmed' },
    { id: '2', date: '2025-11-25', time: '02:00 PM - 05:00 PM', person: 'Nimal Silva', mobile: '0779876543', payment: 8000, status: 'Confirmed' },
    { id: '3', date: '2025-11-26', time: '09:00 AM - 12:00 PM', person: 'Sunil Fernando', mobile: '0761234567', payment: 10000, status: 'Pending' },
    { id: '4', date: '2025-11-26', time: '06:00 PM - 09:00 PM', person: 'Amal Jayasinghe', mobile: '0771122334', payment: 10000, status: 'Confirmed' },
    { id: '5', date: '2025-11-27', time: '09:00 AM - 12:00 PM', person: 'Tharindu Wickramasinghe', mobile: '0778899445', payment: 8000, status: 'Confirmed' },
    { id: '6', date: '2025-11-15', time: '02:00 PM - 05:00 PM', person: 'Dilshan Perera', mobile: '0765544332', payment: 8000, status: 'Confirmed' },
    { id: '7', date: '2025-11-28', time: '06:00 PM - 09:00 PM', person: 'Chamara Silva', mobile: '0771234987', payment: 10000, status: 'Confirmed' },
  ];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const hasBooking = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return bookings.some(b => b.date === dateStr);
  };

  const getBookingsForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return bookings.filter(b => b.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDatePress = (day) => {
    setSelectedDate(day);
  };

  const handleAddBooking = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date first');
      return;
    }
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate).padStart(2, '0');
    setBookingForm({
      ...bookingForm,
      date: `${year}-${month}-${dayStr}`,
    });
    setShowBookingModal(true);
  };

  const submitBooking = () => {
    if (!bookingForm.personName || !bookingForm.mobile || !bookingForm.payment || !bookingForm.timeSlot) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert('Success', 'Booking placed successfully!');
    setShowBookingModal(false);
    setBookingForm({ personName: '', mobile: '', payment: '', date: '', timeSlot: '' });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate === day;
      const hasBookingDot = hasBooking(day);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell, isSelected && styles.selectedDay]}
          onPress={() => handleDatePress(day)}
        >
          <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
          {hasBookingDot && <View style={styles.bookingDot} />}
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>
        
        {/* Calendar Days */}
        <View style={styles.calendarGrid}>
          {renderCalendar()}
        </View>
      </View>

      {/* Add Booking Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addBookingButton} onPress={handleAddBooking}>
          <Ionicons name="add-circle" size={24} color={Colors.white} />
          <Text style={styles.addBookingText}>Place a Booking</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Details for Selected Date */}
      <ScrollView style={styles.bookingsList}>
        {selectedDate ? (
          <>
            <Text style={styles.sectionTitle}>
              Bookings for {monthNames[currentDate.getMonth()]} {selectedDate}
            </Text>
            
            {selectedDateBookings.length > 0 ? (
              selectedDateBookings.map((booking) => (
                <View key={booking.id} style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <Ionicons name="person-circle" size={40} color={Colors.primary} />
                    <View style={styles.bookingInfo}>
                      <Text style={styles.personName}>{booking.person}</Text>
                      <View style={styles.contactRow}>
                        <Ionicons name="call" size={14} color={Colors.textSecondary} />
                        <Text style={styles.contactText}>{booking.mobile}</Text>
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
                  
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={18} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>{booking.time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash" size={18} color={Colors.accent} />
                      <Text style={styles.paymentText}>LKR {booking.payment.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyText}>No bookings for this date</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="hand-left" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>Select a date to view bookings</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place a Booking</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.formLabel}>Person Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter person name"
                value={bookingForm.personName}
                onChangeText={(text) => setBookingForm({...bookingForm, personName: text})}
              />

              <Text style={styles.formLabel}>Mobile Number</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter mobile number"
                value={bookingForm.mobile}
                onChangeText={(text) => setBookingForm({...bookingForm, mobile: text})}
                keyboardType="phone-pad"
              />

              <Text style={styles.formLabel}>Payment Amount (LKR)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter payment amount"
                value={bookingForm.payment}
                onChangeText={(text) => setBookingForm({...bookingForm, payment: text})}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Time Slot</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., 09:00 AM - 12:00 PM"
                value={bookingForm.timeSlot}
                onChangeText={(text) => setBookingForm({...bookingForm, timeSlot: text})}
              />

              <Text style={styles.formLabel}>Date</Text>
              <TextInput
                style={[styles.formInput, styles.disabledInput]}
                value={bookingForm.date}
                editable={false}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={submitBooking}>
              <Text style={styles.submitButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  calendarContainer: {
    backgroundColor: Colors.white,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    position: 'relative',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  selectedDay: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  bookingDot: {
    position: 'absolute',
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.accent,
  },
  addButtonContainer: {
    padding: 15,
    backgroundColor: Colors.white,
  },
  addBookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  addBookingText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
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
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  personName: {
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
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
  bookingDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  modalForm: {
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  disabledInput: {
    backgroundColor: Colors.cardBackground,
    color: Colors.textSecondary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
