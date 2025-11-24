import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Colors } from '../../constants/theme';

export default function FavouritesScreen() {
  const favourites = useSelector((state) => state.favourites.items);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Favourites</Text>
      {favourites.length === 0 ? (
        <Text style={styles.empty}>No favourites yet</Text>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.darkBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.neonGreen,
  },
  empty: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sportGreen + '40',
    backgroundColor: Colors.darkSecondary,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemText: {
    color: Colors.white,
  },
});
