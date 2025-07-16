import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export default function LocationScreen({ navigation }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleButtonPress = (locationType) => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (locationType === 'current') {
        // Navigate to FindMe tab
        navigation.replace('Main', { screen: 'FindMe' });
      } else {
        // Navigate to CustomLocation screen inside Search tab
        navigation.replace('Main', {
          screen: 'Search',
          params: {
            screen: 'CustomLocation'
          }
        });
      }
    });
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('./location.png')}
        style={[styles.logo, { transform: [{ scale: pulseAnim }] }]}
      />

      <Text style={styles.title}>WHERE ARE YOU?</Text>

      <Text style={styles.subtitle}>
        We use your location to show accurate forecasts
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleButtonPress('current')}
      >
        <Text style={styles.buttonText}>FIND ME</Text>
      </TouchableOpacity>

      <Text style={styles.divider}>---- or ----</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleButtonPress('custom')}
      >
        <Text style={styles.buttonText}>CUSTOM LOCATION</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    marginBottom: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    fontFamily: 'Oswald',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '300',
    opacity: 0.8,
    fontFamily: 'Oswald',
  },
  button: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 2,
    paddingVertical: 15,
    width: '55%',
    marginVertical: 10,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    fontFamily: 'Oswald',
  },
  divider: {
    color: 'grey',
    marginVertical: 10,
    fontSize: 14,
    fontWeight: '300',
  },
});
