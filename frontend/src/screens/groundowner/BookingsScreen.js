import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Linking, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useSelector } from 'react-redux';
import { getGroundBookings, updateBookingStatus, editBooking } from '../../api/bookings';
import { getMyGround } from '../../api/grounds';

export default function BookingsScreen() {
  const { token } = useSelector((state) => state.auth);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [groundId, setGroundId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [detailsModal, setDetailsModal] = useState({ visible: false });
  const [editModal, setEditModal] = useState({ visible: false });

  useEffect(() => {
    fetchGroundAndBookings();
  }, []);

  const fetchGroundAndBookings = async () => {
    try {
      setLoading(true);
      const groundResp = await getMyGround(token);
      const id = groundResp?.ground?._id || groundResp?.data?.ground?._id; // handle possible shapes
      setGroundId(id);
      if (id) {
        const resp = await getGroundBookings(id, token);
        const list = resp?.bookings || [];
        setBookings(list);
      }
    } catch (e) {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroundAndBookings();
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const stat = (b.status || '').toLowerCase();
      const matchesStatus = filterStatus === 'All' || (stat.charAt(0).toUpperCase() + stat.slice(1)) === filterStatus;
      const matchesSearch = (b.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [bookings, filterStatus, searchQuery]);

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
        <View style={styles.personIconContainer}>
          <Ionicons name="person" size={28} color={Colors.primary} />
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.personName}>{item.customerName}</Text>
          {item.bookedBy && (
            <View style={[styles.bookedByBadge, item.bookedBy === 'player' ? styles.bookedByPlayer : styles.bookedByOwner]}>
              <Text style={styles.bookedByText}>
                Booked by {item.bookedBy === 'player' ? 'Player' : 'Owner'}
              </Text>
            </View>
          )}
          <View style={styles.dateTimeRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{new Date(item.bookingDate).toISOString().split('T')[0]}</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{formatTimeSlot(item.timeSlot)}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          (item.status || '').toLowerCase() === 'confirmed' && styles.statusConfirmed,
          (item.status || '').toLowerCase() === 'pending' && styles.statusPending,
          (item.status || '').toLowerCase() === 'cancelled' && styles.statusCancelled,
          (item.status || '').toLowerCase() === 'completed' && styles.statusCompleted
        ]}>
          <Text style={[
            styles.statusText,
            (item.status || '').toLowerCase() === 'confirmed' && styles.statusTextConfirmed,
            (item.status || '').toLowerCase() === 'pending' && styles.statusTextPending,
            (item.status || '').toLowerCase() === 'cancelled' && styles.statusTextCancelled,
            (item.status || '').toLowerCase() === 'completed' && styles.statusTextCompleted
          ]}>
            {(item.status || '').charAt(0).toUpperCase() + (item.status || '').slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>LKR {Number(item.paymentAmount || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.iconButton} onPress={() => Linking.openURL(`tel:${item.mobile}`)}>
            <Ionicons name="call" size={20} color={Colors.primary} />
          </TouchableOpacity>
          {item.status !== 'cancelled' && (
            <TouchableOpacity style={styles.iconButton} onPress={() => setEditModal({ visible: true, booking: item })}>
              <Ionicons name="create" size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconButton} onPress={() => setDetailsModal({ visible: true, booking: item })}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {item.status !== 'cancelled' && (
            <TouchableOpacity style={styles.iconButton} onPress={async () => {
              await updateBookingStatus(item._id, 'cancelled', token);
              onRefresh();
            }}>
              <Ionicons name="close" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Reschedule Button for Cancelled Bookings */}
      {item.status === 'cancelled' && (
        <TouchableOpacity 
          style={styles.rescheduleButton}
          onPress={() => setEditModal({ visible: true, booking: item })}
        >
          <Ionicons name="calendar-outline" size={18} color={Colors.white} />
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>
      )}
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
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={80} color={Colors.textLight} />
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          }
        />
      )}

      {/* Details Modal */}
      <Modal visible={detailsModal.visible} transparent animationType="slide" onRequestClose={() => setDetailsModal({ visible: false })}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            {detailsModal.booking && (
              <View style={{ gap: 8 }}>
                <Text>Name: {detailsModal.booking.customerName}</Text>
                <Text>Mobile: {detailsModal.booking.mobile}</Text>
                <Text>Date: {new Date(detailsModal.booking.bookingDate).toLocaleDateString()}</Text>
                <Text>
                  Time: {typeof detailsModal.booking.timeSlot === 'object' && detailsModal.booking.timeSlot
                    ? `${formatTo12h(detailsModal.booking.timeSlot.start)} - ${formatTo12h(detailsModal.booking.timeSlot.end)}`
                    : typeof detailsModal.booking.timeSlot === 'string'
                    ? formatTimeSlot(detailsModal.booking.timeSlot)
                    : '—'}
                </Text>
                <Text>Amount: LKR {Number(detailsModal.booking.paymentAmount || 0).toLocaleString()}</Text>
                <Text>Status: {(detailsModal.booking.status || '').charAt(0).toUpperCase() + (detailsModal.booking.status || '').slice(1)}</Text>
                {detailsModal.booking.notes ? <Text>Notes: {detailsModal.booking.notes}</Text> : null}
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setDetailsModal({ visible: false })}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit/Reschedule Modal */}
      <Modal visible={editModal.visible} transparent animationType="slide" onRequestClose={() => setEditModal({ visible: false })}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit / Reschedule Booking</Text>
            {editModal.booking && (
              <View style={{ gap: 10 }}>
                <Text style={styles.modalLabel}>Customer Name</Text>
                <TextInput
                  style={styles.modalInput}
                  defaultValue={String(editModal.booking.customerName || '')}
                  onChangeText={(val) => (editModal.booking.customerName = val)}
                />
                <Text style={styles.modalLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="phone-pad"
                  defaultValue={String(editModal.booking.mobile || '')}
                  onChangeText={(val) => (editModal.booking.mobile = val)}
                />
                <Text style={styles.modalLabel}>Booking Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  defaultValue={new Date(editModal.booking.bookingDate).toISOString().split('T')[0]}
                  onChangeText={(val) => {
                    // naive validation; backend will parse
                    editModal.booking.bookingDate = val;
                  }}
                />
                <Text style={styles.modalLabel}>Start Time (HH:mm)</Text>
                <TextInput
                  style={styles.modalInput}
                  defaultValue={String(editModal.booking.timeSlot?.start || '')}
                  onChangeText={(val) => {
                    editModal.booking.timeSlot = { ...(editModal.booking.timeSlot || {}), start: val };
                  }}
                />
                <Text style={styles.modalLabel}>End Time (HH:mm)</Text>
                <TextInput
                  style={styles.modalInput}
                  defaultValue={String(editModal.booking.timeSlot?.end || '')}
                  onChangeText={(val) => {
                    editModal.booking.timeSlot = { ...(editModal.booking.timeSlot || {}), end: val };
                  }}
                />
                <Text style={styles.modalLabel}>Payment Amount (LKR)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="decimal-pad"
                  defaultValue={String(editModal.booking.paymentAmount || '')}
                  onChangeText={(val) => (editModal.booking.paymentAmount = Number(val) || 0)}
                />
                <Text style={styles.modalLabel}>Notes</Text>
                <TextInput
                  style={[styles.modalInput, { height: 80 }]} multiline
                  defaultValue={editModal.booking.notes || ''}
                  onChangeText={(val) => (editModal.booking.notes = val)}
                />
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setEditModal({ visible: false })}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.primary }]}
                onPress={async () => {
                  if (!editModal.booking) return;
                  const updates = {
                    customerName: editModal.booking.customerName,
                    mobile: editModal.booking.mobile,
                    bookingDate: editModal.booking.bookingDate,
                    timeSlot: editModal.booking.timeSlot,
                    paymentAmount: editModal.booking.paymentAmount,
                    notes: editModal.booking.notes,
                  };
                  await editBooking(editModal.booking._id, updates, token);
                  setEditModal({ visible: false });
                  onRefresh();
                }}
              >
                <Text style={[styles.modalButtonText, { color: Colors.white }]}>Save</Text>
              </TouchableOpacity>
              {editModal.booking?.status === 'cancelled' && (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: Colors.accent }]}
                  onPress={async () => {
                    if (!editModal.booking) return;
                    const updates = {
                      status: 'pending',
                      customerName: editModal.booking.customerName,
                      mobile: editModal.booking.mobile,
                      bookingDate: editModal.booking.bookingDate,
                      timeSlot: editModal.booking.timeSlot,
                      paymentAmount: editModal.booking.paymentAmount,
                      notes: editModal.booking.notes,
                    };
                    await editBooking(editModal.booking._id, updates, token);
                    setEditModal({ visible: false });
                    onRefresh();
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: Colors.white }]}>Reschedule & Activate</Text>
                </TouchableOpacity>
              )}
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bookedByBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  bookedByPlayer: {
    backgroundColor: Colors.primary + '20',
  },
  bookedByOwner: {
    backgroundColor: Colors.accent + '20',
  },
  bookedByText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
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
  rescheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: Colors.accent,
    borderRadius: 8,
  },
  rescheduleButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  modalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.textPrimary,
    backgroundColor: Colors.cardBackground,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
  },
  modalButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
