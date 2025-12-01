import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useSelector } from 'react-redux';
import { searchGrounds } from '../../api/grounds';

export default function GroundsScreen({ navigation }) {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [grounds, setGrounds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterVillage, setFilterVillage] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGrounds();
  }, []);

  const fetchGrounds = async (filters = {}) => {
    try {
      setLoading(true);
      
      // Build search params
      const params = {};
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.district || filterDistrict) {
        params.district = filters.district || filterDistrict;
      } else if (user?.district) {
        // Only use user's district if no filter is explicitly set
        params.district = user.district;
      }
      
      if (filters.village || filterVillage) {
        params.village = filters.village || filterVillage;
      }

      console.log('Fetching grounds with params:', params);
      console.log('User district:', user?.district);

      const response = await searchGrounds(params);
      console.log('Grounds response:', response);
      
      if (response.success) {
        setGrounds(response.grounds || []);
      }
    } catch (error) {
      console.error('Error fetching grounds:', error);
      setGrounds([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGrounds({ district: filterDistrict, village: filterVillage });
  };

  const handleSearch = () => {
    fetchGrounds({ 
      search: searchQuery,
      district: filterDistrict, 
      village: filterVillage 
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterDistrict('');
    setFilterVillage('');
    fetchGrounds({});
  };

  const handleShowAllGrounds = () => {
    setFilterDistrict('');
    setFilterVillage('');
    setSearchQuery('');
    fetchGrounds({});
  };

  const renderGroundCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.groundCard}
      onPress={() => navigation.navigate('GroundDetails', { groundId: item._id })}
    >
      <View style={styles.groundHeader}>
        <View style={styles.groundIconContainer}>
          <Ionicons name="business" size={32} color={Colors.primary} />
        </View>
        <View style={styles.groundInfo}>
          <Text style={styles.groundName}>{item.groundName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.locationText}>
              {item.village}, {item.district}
            </Text>
          </View>
          {item.pitchType && (
            <View style={styles.pitchTypeRow}>
              <Ionicons name="cellular-outline" size={14} color={Colors.accent} />
              <Text style={styles.pitchTypeText}>{item.pitchType}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.groundFooter}>
        {item.pricing?.hourlyRate && (
          <View style={styles.priceTag}>
            <Ionicons name="cash-outline" size={16} color={Colors.accent} />
            <Text style={styles.priceText}>LKR {item.pricing.hourlyRate}/hr</Text>
          </View>
        )}
        {item.capacity && (
          <View style={styles.capacityTag}>
            <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.capacityText}>{item.capacity} people</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading grounds...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ground name..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      {showFilters && (
        <View style={styles.filterSection}>
          <View style={styles.filterInputRow}>
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>District</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g., Monaragala"
                placeholderTextColor={Colors.textLight}
                value={filterDistrict}
                onChangeText={setFilterDistrict}
              />
            </View>
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>Village</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g., Bibile"
                placeholderTextColor={Colors.textLight}
                value={filterVillage}
                onChangeText={setFilterVillage}
              />
            </View>
          </View>
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleSearch}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Location Info */}
      {user?.district && !filterDistrict && !filterVillage && (
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={16} color={Colors.primary} />
          <Text style={styles.locationInfoText}>
            Showing grounds near {user.district}
          </Text>
          <TouchableOpacity 
            style={styles.showAllButton}
            onPress={handleShowAllGrounds}
          >
            <Text style={styles.showAllText}>Show All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Grounds List */}
      <FlatList
        data={grounds}
        renderItem={renderGroundCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No grounds found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or search in a different area
            </Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    backgroundColor: Colors.white,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  filterInputContainer: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  filterInput: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 10,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    padding: 12,
    paddingHorizontal: 15,
    backgroundColor: Colors.softOrange,
  },
  locationInfoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  showAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  showAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  listContent: {
    padding: 15,
    paddingBottom: 24,
  },
  groundCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groundIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.softOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groundInfo: {
    flex: 1,
  },
  groundName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  pitchTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pitchTypeText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  groundFooter: {
    flexDirection: 'row',
    gap: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  capacityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capacityText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
