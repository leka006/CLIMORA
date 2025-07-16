import { View, StyleSheet, Animated, Text } from 'react-native';
import { useEffect, useRef } from 'react';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in Climora text and tagline
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();
    });

    // Auto navigate after 5 seconds
    const timeout = setTimeout(() => {
      fadeOutAndNavigate();
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const fadeOutAndNavigate = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      navigation.replace('Main');
    });
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.climoraText, { opacity: fadeAnim }]}>
        C L I M O R A
      </Animated.Text>

      <Animated.View style={[styles.bottomContainer, { opacity: subtitleAnim }]}>
        <Text style={styles.tagline}>-Your Smart Climate Companion</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  climoraText: {
    color: '#fff',
    fontSize: 50,
    fontWeight: 'bold',
    fontFamily: 'Oswald',
    letterSpacing: 2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  tagline: {
    color: 'grey',
    fontSize: 18,
    fontFamily: 'Oswald',
  },
});
