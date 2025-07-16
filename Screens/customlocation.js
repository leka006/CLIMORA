import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function CustomLocation({ navigation }) {
  const [location, setLocation] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  const handleSearch = () => {
    const trimmedLocation = location.trim();
    if (trimmedLocation === '') return;

    setRecentSearches((prev) => [
      trimmedLocation,
      ...prev.filter((item) => item !== trimmedLocation),
    ]);

    navigation.navigate('CustomResult', { locationName: trimmedLocation });
    setLocation('');
  };

  const handleRecentPress = (city) => {
    navigation.navigate('CustomResult', { locationName: city });
  };

  const handleClear = () => {
    setRecentSearches([]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Type your spot, we’ll bring the forecast</Text>

      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Enter city or location"
            placeholderTextColor="#aaa"
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search" size={24} color="#007BFF" />
          </TouchableOpacity>
        </View>
      </View>

      {recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleRecentPress(item)}>
                <Text style={styles.recentItem}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  title: {
    color: '#fff',
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 30,
    letterSpacing: 1,
    fontFamily: 'Oswald',
  },
  searchBarWrapper: {
    backgroundColor: '#001F3F',
    borderRadius: 30,
    padding: 8,
    marginBottom: 30,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    marginRight: 10,
    fontFamily: 'Oswald',
  },
  recentContainer: {
    marginTop: 10,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recentTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Oswald',
  },
  clearText: {
    color: '#FF4136',
    fontSize: 14,
    fontFamily: 'Oswald',
  },
  recentItem: {
    color: '#ccc',
    fontSize: 16,
    marginVertical: 4,
    paddingLeft: 10,
    fontFamily: 'Oswald',
  },
});

