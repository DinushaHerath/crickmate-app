import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Colors } from '../../constants/theme';
import { searchGrounds } from '../api/grounds';

export default function GroundsScreen({ navigation }) {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [grounds, setGrounds] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredGrounds, setFilteredGrounds] = useState([]);

  useEffect(() => {
    fetchGrounds();
  }, []);

  useEffect(() => {
    // Filter grounds based on search text
    if (searchText.trim()) {
      const filtered = grounds.filter(ground => 
        ground.groundName?.toLowerCase().includes(searchText.toLowerCase()) ||
        ground.district?.toLowerCase().includes(searchText.toLowerCase()) ||
        ground.village?.toLowerCase().includes(searchText.toLowerCase()) ||
        ground.address?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredGrounds(filtered);
    } else {
      setFilteredGrounds(grounds);
    }
  }, [searchText, grounds]);

  const fetchGrounds = async () => {
    try {
      console.log('Fetching grounds for user district:', user?.district);
      
      // Search grounds in user's district
      const filters = user?.district ? { district: user.district } : {};
      const response = await searchGrounds(filters);
      
      console.log('Grounds response:', response);
      
      if (response.success && response.grounds) {
        setGrounds(response.grounds);
        setFilteredGrounds(response.grounds);
      }
    } catch (error) {
      console.error('Error fetching grounds:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGrounds();
  };

  const renderGroundCard = (ground) => (
    <TouchableOpacity 
      key={ground._id} 
      style={styles.groundCard}
      onPress={() => navigation.navigate('GroundDetails', { groundId: ground._id })}
    >
      <View style={styles.groundHeader}>
        <View style={styles.groundIconContainer}>
          <Ionicons name="business" size={32} color={Colors.primary} />
        </View>
        <View style={styles.groundInfo}>
          <Text style={styles.groundName}>{ground.groundName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.locationText}>
              {ground.village ? `${ground.village}, ` : ''}{ground.district}
            </Text>
          </View>
        </View>
        {ground.rating?.average > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.ratingText}>{ground.rating.average.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {ground.address && (
        <Text style={styles.addressText} numberOfLines={2}>{ground.address}</Text>
      )}

      <View style={styles.groundDetails}>
        {ground.pitchType && (
          <View style={styles.detailBadge}>
            <Ionicons name="golf-outline" size={14} color={Colors.primary} />
            <Text style={styles.detailText}>{ground.pitchType}</Text>
          </View>
        )}
        {ground.capacity && (
          <View style={styles.detailBadge}>
            <Ionicons name="people-outline" size={14} color={Colors.primary} />
            <Text style={styles.detailText}>{ground.capacity}</Text>
          </View>
        )}
        {ground.pricing?.hourlyRate && (
          <View style={styles.detailBadge}>
            <Ionicons name="cash-outline" size={14} color={Colors.accent} />
            <Text style={styles.detailText}>LKR {ground.pricing.hourlyRate}/hr</Text>
          </View>
        )}
      </View>

      {ground.facilities && ground.facilities.length > 0 && (
        <View style={styles.facilitiesRow}>
          {ground.facilities.slice(0, 3).map((facility, index) => (
            <View key={index} style={styles.facilityChip}>
              <Text style={styles.facilityText}>{facility}</Text>
            </View>
          ))}
          {ground.facilities.length > 3 && (
            <Text style={styles.moreFacilities}>+{ground.facilities.length - 3} more</Text>
          )}
        </View>
      )}

      <View style={styles.groundFooter}>
        <View style={styles.ownerInfo}>
          <Ionicons name="person-circle-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.ownerText}>{ground.ownerId?.fullname || 'Owner'}</Text>
        </View>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading grounds...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Cricket Grounds</Text>
        <Text style={styles.subtitle}>
          {user?.district ? `Showing grounds in ${user.district}` : 'Find grounds near you'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, district, or village..."
          placeholderTextColor={Colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {filteredGrounds.length > 0 ? (
        <View style={styles.groundsList}>
          <Text style={styles.resultsCount}>
            {filteredGrounds.length} ground{filteredGrounds.length !== 1 ? 's' : ''} found
          </Text>
          {filteredGrounds.map(renderGroundCard)}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏟️</Text>
          <Text style={styles.emptyText}>
            {searchText ? 'No grounds match your search' : 'No grounds available'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchText 
              ? 'Try different keywords' 
              : user?.district 
                ? `No verified grounds in ${user.district} yet`
                : 'Update your profile with your district to see nearby grounds'
            }
          </Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 35,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 15,
    paddingLeft: 45,
    paddingRight: 45,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 35,
  },
  groundsList: {
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 15,
    fontWeight: '500',
  },
  groundCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groundHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  groundIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.softOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groundInfo: {
    flex: 1,
  },
  groundName: {
    fontSize: 18,
    fontWeight: 'bold',
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
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.softOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  addressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  groundDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  facilityChip: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  facilityText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  moreFacilities: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  groundFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
