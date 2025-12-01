import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Modal, TextInput, Alert, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { getGroundById } from '../../api/grounds';
import { getGroundBookingDates, createBooking } from '../../api/bookings';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export default function GroundDetailsScreen({ route, navigation }) {
  const { groundId } = route.params;
  const { token, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [ground, setGround] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [activeTab, setActiveTab] = useState('details'); // details, calendar, pricing
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [startInputError, setStartInputError] = useState('');
  const [endInputError, setEndInputError] = useState('');

  // Generate time options (6 AM to 10 PM, every hour on the hour)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      times.push(timeStr);
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Format 24h HH:mm to 12h h:mm AM/PM
  const formatTo12h = (time24) => {
    if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    const mer = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const mm = m.toString().padStart(2, '0');
    return `${h}:${mm} ${mer}`;
  };

  // Parse free-typed time into 24h HH:mm within operating hours 06:00-22:00
  const parseTypedTime = (input) => {
    if (!input || !input.trim()) {
      return { value: null, error: 'Enter a time like 6 PM or 18:00' };
    }
    const raw = input.trim().toLowerCase().replace(/\s+/g, '');
    const match = raw.match(/^(\d{1,2})(?::?(\d{2}))?(am|pm)?$/);
    if (!match) {
      return { value: null, error: 'Invalid time. Try 6 PM or 18:00' };
    }
    let hour = parseInt(match[1], 10);
    let minute = match[2] ? parseInt(match[2], 10) : 0;
    const mer = match[3];

    if (isNaN(hour) || isNaN(minute) || minute < 0 || minute > 59) {
      return { value: null, error: 'Invalid time values' };
    }

    if (mer) {
      if (hour < 1 || hour > 12) return { value: null, error: 'Hour must be 1-12 with AM/PM' };
      if (mer === 'pm' && hour !== 12) hour += 12;
      if (mer === 'am' && hour === 12) hour = 0;
    } else {
      // 24h input without AM/PM
      if (hour > 23) return { value: null, error: 'Hour must be 0-23' };
    }

    const hh = hour.toString().padStart(2, '0');
    const mm = minute.toString().padStart(2, '0');
    const normalized = `${hh}:${mm}`;

    // Enforce operating hours: 06:00 to 22:00
    const mins = convertTimeToMinutes(normalized);
    if (mins < 6 * 60 || mins > 22 * 60) {
      return { value: null, error: 'Time must be between 6:00 AM and 10:00 PM' };
    }
    return { value: normalized, error: null };
  };

  const handleStartInputChange = (text) => {
    setStartInput(text);
    const { value, error } = parseTypedTime(text);
    if (value) {
      setStartTime(value);
      setStartInputError('');
    } else {
      setStartInputError(error);
    }
  };

  const handleEndInputChange = (text) => {
    setEndInput(text);
    const { value, error } = parseTypedTime(text);
    if (value) {
      setEndTime(value);
      setEndInputError('');
    } else {
      setEndInputError(error);
    }
  };

  useEffect(() => {
    fetchGroundDetails();
    fetchBookingDates();
  }, []);

  const fetchGroundDetails = async () => {
    try {
      const response = await getGroundById(groundId);
      if (response.success) {
        setGround(response.ground);
      }
    } catch (error) {
      console.error('Error fetching ground details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDates = async () => {
    try {
      const response = await getGroundBookingDates(groundId);
      if (response.success && response.markedDates) {
        setMarkedDates(response.markedDates);
      }
    } catch (error) {
      console.error('Error fetching booking dates:', error);
    }
  };

  const handleCall = () => {
    if (ground?.contact?.phone) {
      Linking.openURL(`tel:${ground.contact.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (ground?.contact?.whatsapp) {
      Linking.openURL(`https://wa.me/${ground.contact.whatsapp}`);
    }
  };

  const handleEmail = () => {
    if (ground?.contact?.email) {
      Linking.openURL(`mailto:${ground.contact.email}`);
    }
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setShowBookingModal(true);
    setStartTime('');
    setEndTime('');
    setStartInput('');
    setEndInput('');
    setStartInputError('');
    setEndInputError('');
    setCustomerName(user?.fullname || '');
    setCustomerContact(user?.contact || '');
    setPaymentAmount('');
    fetchBookedSlots(day.dateString);
  };

  const fetchBookedSlots = async (date) => {
    try {
      setLoadingSlots(true);
      console.log('Fetching booked slots for ground:', groundId, 'date:', date);
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/ground/${groundId}/date/${date}`
      );
      
      console.log('Bookings response:', response.data);
      
      if (response.data.success && response.data.bookings) {
        // Store complete booking objects with start and end times
        const slots = response.data.bookings.map(booking => {
          const timeSlot = booking.timeSlot;
          
          if (typeof timeSlot === 'object' && timeSlot.start && timeSlot.end) {
            return { start: timeSlot.start, end: timeSlot.end };
          }
          
          return null;
        }).filter(slot => slot !== null);
        
        setBookedSlots(slots);
        console.log('Booked slots:', slots);
      } else {
        setBookedSlots([]);
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Check if selected time range overlaps with any booked slot
  const checkTimeOverlap = (newStart, newEnd) => {
    if (!newStart || !newEnd) return false;
    
    const newStartMin = convertTimeToMinutes(newStart);
    const newEndMin = convertTimeToMinutes(newEnd);
    
    if (newEndMin <= newStartMin) {
      return true; // End time must be after start time
    }
    
    for (const slot of bookedSlots) {
      const slotStartMin = convertTimeToMinutes(slot.start);
      const slotEndMin = convertTimeToMinutes(slot.end);
      
      // Check for overlap
      if (newStartMin < slotEndMin && newEndMin > slotStartMin) {
        return true;
      }
    }
    
    return false;
  };

  const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleBooking = async () => {
    if (!startTime || !endTime) {
      Alert.alert('Error', 'Please select start and end time');
      return;
    }
    if (startInputError || endInputError) {
      Alert.alert('Error', 'Please fix invalid time inputs');
      return;
    }
    
    if (checkTimeOverlap(startTime, endTime)) {
      Alert.alert('Error', 'Selected time slot overlaps with an already booked slot or is invalid. Please choose a different time.');
      return;
    }
    
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }
    if (!customerContact.trim()) {
      Alert.alert('Error', 'Please enter contact number');
      return;
    }

    try {
      setBookingLoading(true);
      
      const bookingData = {
        groundId: groundId,
        bookingDate: selectedDate,
        timeSlot: {
          start: startTime,
          end: endTime
        },
        customerName: customerName.trim(),
        customerContact: customerContact.trim(),
        paymentAmount: paymentAmount ? parseFloat(paymentAmount) : 0,
      };

      const response = await createBooking(bookingData, token);
      
      if (response.success) {
        Alert.alert('Success', 'Booking created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setShowBookingModal(false);
              fetchBookingDates(); // Refresh calendar
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const getPriceForSlot = (start, end) => {
    if (!ground?.pricing || !start) return null;
    
    const date = new Date(selectedDate);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    const pricing = ground.pricing;
    const startHour = parseInt(start.split(':')[0]);
    
    if (isWeekend) {
      if (startHour < 12) return pricing.weekendMorning;
      if (startHour < 17) return pricing.weekendAfternoon;
      return pricing.weekendEvening;
    } else {
      if (startHour < 12) return pricing.weekdayMorning;
      if (startHour < 17) return pricing.weekdayAfternoon;
      return pricing.weekdayEvening;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading ground details...</Text>
      </View>
    );
  }

  if (!ground) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.textLight} />
        <Text style={styles.errorText}>Ground not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="business" size={40} color={Colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.groundName}>{ground.groundName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={Colors.white} />
              <Text style={styles.locationText}>
                {ground.village}, {ground.district}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Buttons */}
        <View style={styles.contactButtons}>
          {ground.contact?.phone && (
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
          {ground.contact?.whatsapp && (
            <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
          {ground.contact?.email && (
            <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
              <Ionicons name="mail" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.tabActive]}
          onPress={() => setActiveTab('details')}
        >
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color={activeTab === 'details' ? Colors.primary : Colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'calendar' && styles.tabActive]}
          onPress={() => setActiveTab('calendar')}
        >
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={activeTab === 'calendar' ? Colors.primary : Colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'calendar' && styles.tabTextActive]}>
            Calendar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pricing' && styles.tabActive]}
          onPress={() => setActiveTab('pricing')}
        >
          <Ionicons 
            name="cash-outline" 
            size={20} 
            color={activeTab === 'pricing' ? Colors.primary : Colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'pricing' && styles.tabTextActive]}>
            Pricing
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Details Tab */}
        {activeTab === 'details' && (
          <View>
            {ground.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.card}>
                  <Text style={styles.description}>{ground.description}</Text>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ground Information</Text>
              
              {ground.pitchType && (
                <View style={styles.infoCard}>
                  <Ionicons name="cellular-outline" size={20} color={Colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Pitch Type</Text>
                    <Text style={styles.infoValue}>{ground.pitchType}</Text>
                  </View>
                </View>
              )}

              {ground.capacity && (
                <View style={styles.infoCard}>
                  <Ionicons name="people-outline" size={20} color={Colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Capacity</Text>
                    <Text style={styles.infoValue}>{ground.capacity} people</Text>
                  </View>
                </View>
              )}

              {ground.address && (
                <View style={styles.infoCard}>
                  <Ionicons name="location-outline" size={20} color={Colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{ground.address}</Text>
                  </View>
                </View>
              )}
            </View>

            {ground.facilities && ground.facilities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Facilities</Text>
                <View style={styles.card}>
                  <View style={styles.facilitiesGrid}>
                    {ground.facilities.map((facility, index) => (
                      <View key={index} style={styles.facilityItem}>
                        <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
                        <Text style={styles.facilityText}>{facility}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Calendar</Text>
            <View style={styles.card}>
              <Calendar
                markedDates={markedDates}
                onDayPress={handleDateSelect}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  backgroundColor: Colors.white,
                  calendarBackground: Colors.white,
                  selectedDayBackgroundColor: Colors.primary,
                  selectedDayTextColor: Colors.white,
                  todayTextColor: Colors.primary,
                  dayTextColor: Colors.textPrimary,
                  textDisabledColor: Colors.textLight,
                  dotColor: '#4CAF50',
                  selectedDotColor: Colors.white,
                  arrowColor: Colors.primary,
                  monthTextColor: Colors.textPrimary,
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12,
                }}
                markingType={'dot'}
              />
              <View style={styles.calendarLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.legendText}>Already booked</Text>
                </View>
                <Text style={styles.bookingHint}>Tap any date to make a booking</Text>
              </View>
            </View>
          </View>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <View>
            {ground.pricing && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Weekday Pricing</Text>
                  
                  {ground.pricing.weekdayMorning > 0 && (
                    <View style={styles.priceCard}>
                      <View style={styles.priceHeader}>
                        <Ionicons name="sunny-outline" size={24} color={Colors.accent} />
                        <Text style={styles.priceTitle}>Morning</Text>
                      </View>
                      <Text style={styles.priceAmount}>LKR {ground.pricing.weekdayMorning.toLocaleString()}</Text>
                    </View>
                  )}

                  {ground.pricing.weekdayAfternoon > 0 && (
                    <View style={styles.priceCard}>
                      <View style={styles.priceHeader}>
                        <Ionicons name="partly-sunny-outline" size={24} color={Colors.accent} />
                        <Text style={styles.priceTitle}>Afternoon</Text>
                      </View>
                      <Text style={styles.priceAmount}>LKR {ground.pricing.weekdayAfternoon.toLocaleString()}</Text>
                    </View>
                  )}

                  {ground.pricing.weekdayEvening > 0 && (
                    <View style={styles.priceCard}>
                      <View style={styles.priceHeader}>
                        <Ionicons name="moon-outline" size={24} color={Colors.accent} />
                        <Text style={styles.priceTitle}>Evening</Text>
                      </View>
                      <Text style={styles.priceAmount}>LKR {ground.pricing.weekdayEvening.toLocaleString()}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Weekend Pricing</Text>
                  
                  {ground.pricing.weekendMorning > 0 && (
                    <View style={styles.priceCard}>
                      <View style={styles.priceHeader}>
                        <Ionicons name="sunny-outline" size={24} color={Colors.primary} />
                        <Text style={styles.priceTitle}>Morning</Text>
                      </View>
                      <Text style={styles.priceAmount}>LKR {ground.pricing.weekendMorning.toLocaleString()}</Text>
                    </View>
                  )}

                  {ground.pricing.weekendAfternoon > 0 && (
                    <View style={styles.priceCard}>
                      <View style={styles.priceHeader}>
                        <Ionicons name="partly-sunny-outline" size={24} color={Colors.primary} />
                        <Text style={styles.priceTitle}>Afternoon</Text>
                      </View>
                      <Text style={styles.priceAmount}>LKR {ground.pricing.weekendAfternoon.toLocaleString()}</Text>
                    </View>
                  )}

                  {ground.pricing.weekendEvening > 0 && (
                    <View style={styles.priceCard}>
                      <View style={styles.priceHeader}>
                        <Ionicons name="moon-outline" size={24} color={Colors.primary} />
                        <Text style={styles.priceTitle}>Evening</Text>
                      </View>
                      <Text style={styles.priceAmount}>LKR {ground.pricing.weekendEvening.toLocaleString()}</Text>
                    </View>
                  )}
                </View>

                {(ground.pricing.floodlightCharge > 0 || ground.pricing.equipmentCharge > 0 || ground.pricing.scorerCharge > 0) && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Charges</Text>
                    
                    {ground.pricing.floodlightCharge > 0 && (
                      <View style={styles.additionalCard}>
                        <Text style={styles.additionalLabel}>Floodlight</Text>
                        <Text style={styles.additionalAmount}>LKR {ground.pricing.floodlightCharge.toLocaleString()}</Text>
                      </View>
                    )}

                    {ground.pricing.equipmentCharge > 0 && (
                      <View style={styles.additionalCard}>
                        <Text style={styles.additionalLabel}>Equipment</Text>
                        <Text style={styles.additionalAmount}>LKR {ground.pricing.equipmentCharge.toLocaleString()}</Text>
                      </View>
                    )}

                    {ground.pricing.scorerCharge > 0 && (
                      <View style={styles.additionalCard}>
                        <Text style={styles.additionalLabel}>Scorer</Text>
                        <Text style={styles.additionalAmount}>LKR {ground.pricing.scorerCharge.toLocaleString()}</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            {!ground.pricing && (
              <View style={styles.emptyState}>
                <Ionicons name="cash-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyText}>No pricing information available</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Ground</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Selected Date</Text>
                <View style={styles.modalDateCard}>
                  <Ionicons name="calendar" size={20} color={Colors.primary} />
                  <Text style={styles.modalDateText}>{selectedDate}</Text>
                </View>
              </View>

              {/* Show Already Booked Slots */}
              {bookedSlots.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Already Booked Time Slots</Text>
                  <View style={styles.bookedSlotsContainer}>
                    {bookedSlots.map((slot, index) => (
                      <View key={index} style={styles.bookedSlotChip}>
                        <Ionicons name="close-circle" size={16} color={Colors.error} />
                        <Text style={styles.bookedSlotText}>
                          {formatTo12h(slot.start)} - {formatTo12h(slot.end)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Select Your Time Slot *</Text>
                <Text style={styles.modalHint}>
                  Available hours: 06:00 to 22:00 (6 AM to 10 PM)
                </Text>
                <Text style={styles.modalHint}>
                  You can type a time (AM/PM) or pick from list
                </Text>
                
                {/* Start Time Picker */}
                <View style={styles.timePickerRow}>
                  <View style={styles.timePickerContainer}>
                    <Text style={styles.timePickerLabel}>Start Time</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        setShowStartTimePicker(!showStartTimePicker);
                        setShowEndTimePicker(false);
                      }}
                    >
                      <Ionicons name="time-outline" size={20} color={Colors.primary} />
                      <Text style={[styles.pickerButtonText, !startTime && styles.placeholderText]}>
                        {startTime ? formatTo12h(startTime) : 'Select start time'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    
                    {showStartTimePicker && (
                      <View style={styles.pickerDropdown}>
                        <ScrollView style={styles.pickerScrollView}>
                          {timeOptions.map((time) => (
                            <TouchableOpacity
                              key={time}
                              style={styles.pickerItem}
                              onPress={() => {
                                setStartTime(time);
                                setStartInput(formatTo12h(time));
                                setStartInputError('');
                                setShowStartTimePicker(false);
                              }}
                            >
                              <Text style={[
                                styles.pickerItemText,
                                startTime === time && styles.pickerItemTextSelected
                              ]}>
                                {formatTo12h(time)}
                              </Text>
                              {startTime === time && (
                                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* Typed Start Time */}
                    <TextInput
                      style={styles.timeTextInput}
                      value={startInput}
                      onChangeText={handleStartInputChange}
                      placeholder="Type e.g. 6 PM or 18:00"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="default"
                      autoCapitalize="characters"
                    />
                    {!!startInputError && (
                      <Text style={styles.inputErrorText}>{startInputError}</Text>
                    )}
                  </View>

                  {/* End Time Picker */}
                  <View style={styles.timePickerContainer}>
                    <Text style={styles.timePickerLabel}>End Time</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        setShowEndTimePicker(!showEndTimePicker);
                        setShowStartTimePicker(false);
                      }}
                    >
                      <Ionicons name="time-outline" size={20} color={Colors.primary} />
                      <Text style={[styles.pickerButtonText, !endTime && styles.placeholderText]}>
                        {endTime ? formatTo12h(endTime) : 'Select end time'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    
                    {showEndTimePicker && (
                      <View style={styles.pickerDropdown}>
                        <ScrollView style={styles.pickerScrollView}>
                          {timeOptions.map((time) => (
                            <TouchableOpacity
                              key={time}
                              style={styles.pickerItem}
                              onPress={() => {
                                setEndTime(time);
                                setEndInput(formatTo12h(time));
                                setEndInputError('');
                                setShowEndTimePicker(false);
                              }}
                            >
                              <Text style={[
                                styles.pickerItemText,
                                endTime === time && styles.pickerItemTextSelected
                              ]}>
                                {formatTo12h(time)}
                              </Text>
                              {endTime === time && (
                                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* Typed End Time */}
                    <TextInput
                      style={styles.timeTextInput}
                      value={endInput}
                      onChangeText={handleEndInputChange}
                      placeholder="Type e.g. 8 PM or 20:00"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="default"
                      autoCapitalize="characters"
                    />
                    {!!endInputError && (
                      <Text style={styles.inputErrorText}>{endInputError}</Text>
                    )}
                  </View>
                </View>
                
                {startTime && endTime && checkTimeOverlap(startTime, endTime) && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning" size={18} color={Colors.error} />
                    <Text style={styles.warningText}>
                      This time slot overlaps with an already booked slot or is invalid!
                    </Text>
                  </View>
                )}
                
                {startTime && endTime && !checkTimeOverlap(startTime, endTime) && (
                  <View style={styles.successBox}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
                    <Text style={styles.successText}>
                      Available: {formatTo12h(startTime)} - {formatTo12h(endTime)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Customer Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Enter customer name"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Contact Number *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={customerContact}
                  onChangeText={setCustomerContact}
                  placeholder="Enter contact number"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Payment Amount (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="Enter payment amount"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
                <Text style={styles.modalHint}>
                  Leave empty if payment will be made later
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </View>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  groundName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  description: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  facilitiesGrid: {
    gap: 12,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  facilityText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  calendarLegend: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bookingHint: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  priceAmount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  additionalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  additionalLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  additionalAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 15,
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
    maxHeight: '90%',
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
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  modalDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.softPrimary,
    padding: 15,
    borderRadius: 12,
  },
  modalDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  bookedSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bookedSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.error + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  bookedSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timePickerContainer: {
    flex: 1,
  },
  timePickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pickerDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pickerList: {
    maxHeight: 200,
  },
  pickerScrollView: {
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pickerItemTextSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  placeholderText: {
    color: Colors.textLight,
  },
  timeTextInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  inputErrorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.error + '15',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent + '15',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500',
  },
  timeSlotContainer: {
    gap: 10,
  },
  timeSlotButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 15,
  },
  timeSlotButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotButtonDisabled: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  timeSlotContent: {
    flex: 1,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  timeSlotTextActive: {
    color: Colors.white,
  },
  timeSlotTextDisabled: {
    color: Colors.textLight,
  },
  timeSlotPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timeSlotPriceActive: {
    color: Colors.white,
    opacity: 0.9,
  },
  timeSlotPriceDisabled: {
    color: Colors.textLight,
  },
  modalInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalCancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
