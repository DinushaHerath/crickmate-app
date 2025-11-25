import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

export default function PriceScreen() {
  const [isEditing, setIsEditing] = useState(false);
  
  // Pricing data
  const [weekdayMorning, setWeekdayMorning] = useState('8000');
  const [weekdayAfternoon, setWeekdayAfternoon] = useState('8000');
  const [weekdayEvening, setWeekdayEvening] = useState('10000');
  const [weekendMorning, setWeekendMorning] = useState('10000');
  const [weekendAfternoon, setWeekendAfternoon] = useState('10000');
  const [weekendEvening, setWeekendEvening] = useState('12000');
  
  // Additional charges
  const [floodlightCharge, setFloodlightCharge] = useState('2000');
  const [equipmentCharge, setEquipmentCharge] = useState('1500');
  const [scorerCharge, setScorerCharge] = useState('1000');

  const handleSave = () => {
    Alert.alert('Success', 'Pricing updated successfully!');
    setIsEditing(false);
  };

  const PriceCard = ({ title, icon, value, onChange, editable }) => (
    <View style={styles.priceCard}>
      <View style={styles.priceHeader}>
        <Ionicons name={icon} size={24} color={Colors.primary} />
        <Text style={styles.priceTitle}>{title}</Text>
      </View>
      {editable ? (
        <View style={styles.priceInputWrapper}>
          <Text style={styles.currencyText}>LKR</Text>
          <TextInput
            style={styles.priceInput}
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
          />
        </View>
      ) : (
        <Text style={styles.priceValue}>LKR {parseInt(value).toLocaleString()}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ground Pricing</Text>
        {!isEditing ? (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color={Colors.white} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Weekday Pricing */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Weekday Pricing</Text>
        </View>
        
        <PriceCard 
          title="Morning (6 AM - 12 PM)"
          icon="sunny"
          value={weekdayMorning}
          onChange={setWeekdayMorning}
          editable={isEditing}
        />
        <PriceCard 
          title="Afternoon (12 PM - 5 PM)"
          icon="partly-sunny"
          value={weekdayAfternoon}
          onChange={setWeekdayAfternoon}
          editable={isEditing}
        />
        <PriceCard 
          title="Evening (5 PM - 10 PM)"
          icon="moon"
          value={weekdayEvening}
          onChange={setWeekdayEvening}
          editable={isEditing}
        />
      </View>

      {/* Weekend Pricing */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={24} color={Colors.secondary} />
          <Text style={styles.sectionTitle}>Weekend Pricing</Text>
        </View>
        
        <PriceCard 
          title="Morning (6 AM - 12 PM)"
          icon="sunny"
          value={weekendMorning}
          onChange={setWeekendMorning}
          editable={isEditing}
        />
        <PriceCard 
          title="Afternoon (12 PM - 5 PM)"
          icon="partly-sunny"
          value={weekendAfternoon}
          onChange={setWeekendAfternoon}
          editable={isEditing}
        />
        <PriceCard 
          title="Evening (5 PM - 10 PM)"
          icon="moon"
          value={weekendEvening}
          onChange={setWeekendEvening}
          editable={isEditing}
        />
      </View>

      {/* Additional Charges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.accent} />
          <Text style={styles.sectionTitle}>Additional Charges</Text>
        </View>
        
        <PriceCard 
          title="Floodlight Charges"
          icon="bulb"
          value={floodlightCharge}
          onChange={setFloodlightCharge}
          editable={isEditing}
        />
        <PriceCard 
          title="Equipment Rental"
          icon="baseball"
          value={equipmentCharge}
          onChange={setEquipmentCharge}
          editable={isEditing}
        />
        <PriceCard 
          title="Scorer Service"
          icon="clipboard"
          value={scorerCharge}
          onChange={setScorerCharge}
          editable={isEditing}
        />
      </View>

      {/* Pricing Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Pricing Information</Text>
            <Text style={styles.infoText}>• All prices are per 3-hour slot</Text>
            <Text style={styles.infoText}>• Weekend rates apply on Saturdays & Sundays</Text>
            <Text style={styles.infoText}>• Public holidays follow weekend rates</Text>
            <Text style={styles.infoText}>• Additional charges are optional add-ons</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  section: {
    padding: 15,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  priceCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  priceTitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  priceInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoSection: {
    padding: 15,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.softOrange,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.secondary,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  bottomSpacer: {
    height: 30,
  },
});
