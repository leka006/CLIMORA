import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  TouchableOpacity,
} from 'react-native';

// weather icon
const getWeatherIcon = (summary = '') => {
  const lower = summary.toLowerCase();
  if (lower.includes('sun')) return '☀️';
  if (lower.includes('partly') || (lower.includes('sun') && lower.includes('cloud'))) return '⛅';
  if (lower.includes('overcast')) return '🌥️';
  if (lower.includes('cloud')) return '☁️';
  if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️';
  if (lower.includes('thunder')) return '⛈️';
  if (lower.includes('snow')) return '❄️';
  if (lower.includes('mist') || lower.includes('fog')) return '🌫️';
  return '🌍';
};

export default function DayDetailsScreen1({ route }) {
  const { dayData } = route.params || {};
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [modalVisible]);

  const weather = dayData.weather_details || {};
  const hourlyTemps = dayData.hourly_temperatures || [];
  const rainfallToday = dayData.rainfall?.today || {};
  const pastRainfall = dayData.rainfall?.past || [];

  const getRainfallStatus = (mm) => {
    if (mm >= 30) return 'Heavy Rain';
    if (mm >= 10) return 'Moderate Rain';
    if (mm > 0) return 'Light Rain';
    return 'No Rain';
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === 'N/A') return 'N/A';

    try {
      const [hour, minute] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hour), parseInt(minute));
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (err) {
      return 'N/A';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.dayText}>{dayData.day}</Text>
        <Text style={styles.tempMain}>
          {weather.temperature !== undefined ? `${weather.temperature}°C` : 'N/A'}
        </Text>
        <Text style={styles.icon}>{getWeatherIcon(weather.summary || '')}</Text>
        <Text style={styles.summary}>{weather.summary || 'N/A'}</Text>
      </View>

      {/* Hourly Forecast */}
      <Text style={styles.sectionTitle}>Hourly Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {hourlyTemps && hourlyTemps.length > 0 ? (
          hourlyTemps.map((item, index) => (
            <View key={index} style={styles.hourBox}>
              <Text style={styles.hour}>{item.time || 'N/A'}</Text>
              <Text style={styles.hourTemp}>
                {item.temperature !== undefined ? `${item.temperature}°C` : 'N/A'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: '#aaa', marginLeft: 20 }}>No hourly data available.</Text>
        )}
      </ScrollView>

      {/* Weather Details */}
      <Text style={styles.sectionTitle}>Weather Details</Text>
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>💧 Humidity</Text>
          <Text style={styles.gridValue}>{weather.humidity ?? 'N/A'}%</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>📈 Pressure</Text>
          <Text style={styles.gridValue}>{weather.pressure ?? 'N/A'} hPa</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>🌞 Sunrise</Text>
          <Text style={styles.gridValue}>{formatTime(weather.sunrise)}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>🌙 Sunset</Text>
          <Text style={styles.gridValue}>{formatTime(weather.sunset)}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>🌬️ Wind Speed</Text>
          <Text style={styles.gridValue}>{weather.wind_speed ?? 'N/A'} km/h</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>☀️ UV Index</Text>
          <Text style={styles.gridValue}>{weather.uv_index ?? 'N/A'}</Text>
        </View>
      </View>

      {/* Rainfall Report button & modal BELOW Weather Details */}
      {(rainfallToday?.rainfall_mm || pastRainfall.length > 0) && (
        <>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.rainfallBtn}>☔ View Rainfall Report</Text>
          </TouchableOpacity>

          <Modal transparent visible={modalVisible} animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
              <Animated.View style={[styles.popupCard, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✖</Text>
                </TouchableOpacity>
                <Text style={styles.popupTitle}>🌧 Rainfall Report</Text>

                <Text style={styles.popupItem}>
                  Today: {rainfallToday?.rainfall_mm ?? 0} mm -{' '}
                  {getRainfallStatus(rainfallToday?.rainfall_mm)}
                </Text>

                {pastRainfall.map((day, index) => (
                  <Text key={index} style={styles.popupItem}>
                    {day.date}: {day.rainfall_mm ?? 0} mm - {getRainfallStatus(day.rainfall_mm)}
                  </Text>
                ))}
              </Animated.View>
            </Pressable>
          </Modal>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 20 },
  dayText: { fontSize: 19, color: '#ccc', marginBottom: 5, fontFamily: 'Oswald' },
  tempMain: { fontSize: 80, color: '#fff', fontWeight: 'bold', fontFamily: 'Oswald' },
  icon: { fontSize: 120, marginBottom: 5 },
  summary: { fontSize: 24, color: '#fff', opacity: 0.8, fontFamily: 'Oswald' },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'Oswald',
  },
  row: { paddingHorizontal: 20, marginBottom: 30 },
  hourBox: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  hour: { color: '#ccc', fontSize: 20, fontFamily: 'Oswald' },
  hourTemp: { color: '#fff', fontSize: 19, fontWeight: 'bold', fontFamily: 'Oswald' },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  gridItem: {
    backgroundColor: '#111',
    width: '48%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontFamily: 'Oswald',
  },
  gridLabel: { color: '#aaa', fontSize: 20, marginBottom: 5, fontFamily: 'Oswald' },
  gridValue: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Oswald' },
  rainfallBtn: {
    color: '#4db8ff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
    fontFamily: 'Oswald',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupCard: {
    backgroundColor: '#222',
    padding: 25,
    borderRadius: 12,
    width: '85%',
    position: 'relative',
  },
  popupTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Oswald',
  },
  popupItem: { color: '#ccc', fontSize: 16, marginBottom: 10, fontFamily: 'Oswald' },
  closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  closeButtonText: { color: '#fff', fontSize: 20 },
});
