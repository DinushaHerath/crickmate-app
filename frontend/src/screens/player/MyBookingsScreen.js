import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useSelector } from 'react-redux';
import { getMyBookings, payAndConfirmBooking, cancelMyBooking } from '../../api/bookings';

export default function MyBookingsScreen({ navigation }) {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [paymentModal, setPaymentModal] = useState({ visible: false, bookingId: null, amount: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings(token);
      
      if (response.success) {
        setBookings(response.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === 'All') return true;
    return booking.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  const formatTo12h = (time24) => {
    if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    const mer = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${mer}`;
  };

  const formatTimeSlot = (ts) => {
    if (typeof ts === 'string') {
      // Attempt to parse "HH:mm - HH:mm" to AM/PM; else return as-is
      const match = ts.match(/^(\d{1,2}:\d{2})\s?-\s?(\d{1,2}:\d{2})$/);
      if (match) {
        return `${formatTo12h(match[1])} - ${formatTo12h(match[2])}`;
      }
      return ts;
    }
    if (ts && typeof ts === 'object' && ts.start && ts.end) {
      return `${formatTo12h(ts.start)} - ${formatTo12h(ts.end)}`;
    }
    return '—';
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="business" size={28} color={Colors.primary} />
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.groundName}>{item.groundId?.groundName || 'Ground'}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.locationText}>
              {item.groundId?.village && item.groundId?.district
                ? `${item.groundId.village}, ${item.groundId.district}`
                : item.groundId?.address || 'Location not available'}
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'confirmed' && styles.statusConfirmed,
          item.status === 'pending' && styles.statusPending,
          item.status === 'cancelled' && styles.statusCancelled,
          item.status === 'completed' && styles.statusCompleted
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'confirmed' && styles.statusTextConfirmed,
            item.status === 'pending' && styles.statusTextPending,
            item.status === 'cancelled' && styles.statusTextCancelled,
            item.status === 'completed' && styles.statusTextCompleted
          ]}>
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {new Date(item.bookingDate).toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatTimeSlot(item.timeSlot)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.customerName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            LKR {(item.paymentAmount || 0).toLocaleString()}
            {item.paymentAmount > 0 ? ' (Paid)' : ' (Pending)'}
          </Text>
        </View>

        {String(item.status).toLowerCase() === 'pending' && (
          <TouchableOpacity
            style={styles.payConfirmButton}
            onPress={() => setPaymentModal({ visible: true, bookingId: item._id, amount: String(item.paymentAmount || '') })}
          >
            <Ionicons name="cash" size={16} color={Colors.white} />
            <Text style={styles.payConfirmButtonText}>Pay & Confirm</Text>
          </TouchableOpacity>
        )}

        {['pending','confirmed'].includes(String(item.status).toLowerCase()) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={async () => {
              try {
                await cancelMyBooking(item._id, token);
                onRefresh();
              } catch (e) {}
            }}
          >
            <Ionicons name="close-circle" size={16} color={Colors.white} />
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={styles.viewGroundButton}
        onPress={() => navigation.navigate('GroundDetails', { groundId: item.groundId?._id })}
      >
        <Text style={styles.viewGroundButtonText}>View Ground</Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs (Removed Completed) */}
      <View style={styles.filterContainer}>
        {['All', 'Pending', 'Confirmed', 'Cancelled'].map((status) => (
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

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      ) : filteredBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyText}>
            {filterStatus === 'All' 
              ? 'No bookings yet' 
              : `No ${filterStatus.toLowerCase()} bookings`}
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('GroundsList')}
          >
            <Text style={styles.browseButtonText}>Browse Grounds</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        />
      )}

      {/* Payment Modal */}
      <Modal
        visible={paymentModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModal({ visible: false, bookingId: null, amount: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Payment Amount</Text>
            <View style={styles.modalBodyRow}>
              <Ionicons name="cash-outline" size={20} color={Colors.primary} />
              <Text style={styles.currencyLabel}>LKR</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textLight}
                value={paymentModal.amount}
                onChangeText={(t) => setPaymentModal((m) => ({ ...m, amount: t }))}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setPaymentModal({ visible: false, bookingId: null, amount: '' })}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={async () => {
                  const amt = parseFloat(paymentModal.amount || '0');
                  if (isNaN(amt) || amt <= 0) return;
                  try {
                    await payAndConfirmBooking(paymentModal.bookingId, amt, token);
                    setPaymentModal({ visible: false, bookingId: null, amount: '' });
                    onRefresh();
                  } catch (e) {
                    setPaymentModal({ visible: false, bookingId: null, amount: '' });
                  }
                }}
              >
                <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                <Text style={styles.modalConfirmText}>Confirm</Text>
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: 'space-between',
  },
  filterTab: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  payConfirmButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payConfirmButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  modalBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  amountInput: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
  },
  modalCancelText: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  modalConfirmText: {
    color: Colors.white,
    fontWeight: '700',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.softPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  groundName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
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
  statusCompleted: {
    backgroundColor: Colors.textSecondary + '20',
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
  statusTextCompleted: {
    color: Colors.textSecondary,
  },
  bookingDetails: {
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  viewGroundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: Colors.softPrimary,
    borderRadius: 8,
  },
  viewGroundButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
