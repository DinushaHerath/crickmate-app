import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Colors } from '../../../constants/theme';
import { createBooking } from '../../api/bookings';
import { getMyGround } from '../../api/grounds';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function PlaceBookingScreen({ route, navigation }) {
  const { date, onBookingCreated } = route.params;
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groundId, setGroundId] = useState(null);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  // Time pickers
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    fetchGround();
    
    // Set default times: 9 AM to 12 PM
    const defaultStart = new Date();
    defaultStart.setHours(9, 0, 0, 0);
    setStartTime(defaultStart);
    
    const defaultEnd = new Date();
    defaultEnd.setHours(12, 0, 0, 0);
    setEndTime(defaultEnd);
  }, []);

  const fetchGround = async () => {
    try {
      const response = await getMyGround(token);
      if (response.success && response.ground) {
        setGroundId(response.ground._id);
      } else {
        Alert.alert('Error', 'Ground not found. Please set up your ground profile first.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching ground:', error);
      Alert.alert('Error', 'Failed to load ground information');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDisplayTime = (date) => {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);
  };

  const handleStartTimeChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const handleEndTimeChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      Alert.alert('Validation Error', 'Please enter customer name');
      return false;
    }
    
    if (!mobile.trim()) {
      Alert.alert('Validation Error', 'Please enter mobile number');
      return false;
    }
    
    if (mobile.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid mobile number');
      return false;
    }
    
    if (paymentAmount.trim() && (isNaN(paymentAmount) || parseFloat(paymentAmount) < 0)) {
      Alert.alert('Validation Error', 'Please enter a valid payment amount');
      return false;
    }
    
    if (endTime <= startTime) {
      Alert.alert('Validation Error', 'End time must be after start time');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const bookingData = {
        groundId,
        customerName: customerName.trim(),
        mobile: mobile.trim(),
        paymentAmount: paymentAmount.trim() ? parseFloat(paymentAmount) : 0,
        timeSlot: {
          start: formatTime(startTime),
          end: formatTime(endTime)
        },
        bookingDate: date,
        notes: notes.trim()
      };
      
      console.log('Creating booking:', bookingData);
      
      const response = await createBooking(bookingData, token);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Booking created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onBookingCreated) onBookingCreated();
                navigation.goBack();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Ionicons name="calendar" size={28} color={Colors.primary} />
        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>Booking Date</Text>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Customer Name *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter customer name"
              placeholderTextColor={Colors.textSecondary}
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="07XXXXXXXX"
              placeholderTextColor={Colors.textSecondary}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Booking Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Time *</Text>
          <TouchableOpacity 
            style={styles.timePickerButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{formatDisplayTime(startTime)}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleStartTimeChange}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Time *</Text>
          <TouchableOpacity 
            style={styles.timePickerButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{formatDisplayTime(endTime)}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showEndPicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleEndTimeChange}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Payment Amount (LKR) <Text style={styles.optionalText}>(Optional)</Text></Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="cash-outline" size={20} color={Colors.accent} />
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any special notes..."
              placeholderTextColor={Colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.confirmButton, saving && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.softOrange,
    padding: 20,
    gap: 15,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
