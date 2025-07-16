import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import moment from 'moment';

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
  return '🌍'; // fallback
};

export default function DayDetailsScreen({ route }) {
  const { dayData, location, weatherDetails, rainfall, hourlyTemperatures } = route.params || {};

  const [scaleAnim] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: modalVisible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [modalVisible]);

  const getRainfallStatus = (mm) => {
    if (mm >= 30) return 'Heavy Rain';
    if (mm >= 10) return 'Moderate Rain';
    if (mm > 0) return 'Light Rain';
    return 'No Rain';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.location}>{location || 'Unknown Location'}</Text>
        <Text style={styles.date}>{moment(dayData?.date).format('dddd, MMMM D')}</Text>
        <Text style={styles.temp}>
          {weatherDetails?.temperature ? `${weatherDetails.temperature}°C` : 'N/A'}
        </Text>
        <Text style={styles.icon}>
          {getWeatherIcon(weatherDetails?.summary || '')}
        </Text>
        <Text style={styles.summary}>{weatherDetails?.summary || 'N/A'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Hourly Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {hourlyTemperatures && hourlyTemperatures.length > 0 ? (
          hourlyTemperatures.map((item, index) => (
            <View key={index} style={styles.hourBox}>
              <Text style={styles.hour}>{item.time || item.hour || '—'}</Text>
              <Text style={styles.hourTemp}>
                {item.temperature ?? item.temp ?? 'N/A'}°C
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No hourly data available.</Text>
        )}
      </ScrollView>

      <Text style={styles.sectionTitle}>Weather Details</Text>
      <View style={styles.detailsGrid}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>💧 Humidity</Text>
          <Text style={styles.detailValue}>{weatherDetails?.humidity ?? 'N/A'}%</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>📈 Pressure</Text>
          <Text style={styles.detailValue}>{weatherDetails?.pressure ?? 'N/A'} hPa</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>🌞 Sunrise</Text>
          <Text style={styles.detailValue}>
            {weatherDetails?.sunrise
              ? moment(weatherDetails.sunrise).format('hh:mm A')
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>🌙 Sunset</Text>
          <Text style={styles.detailValue}>
            {weatherDetails?.sunset
              ? moment(weatherDetails.sunset).format('hh:mm A')
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>🌬️ Wind</Text>
          <Text style={styles.detailValue}>{weatherDetails?.wind_speed ?? 'N/A'} km/h</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>☀️ UV Index</Text>
          <Text style={styles.detailValue}>{weatherDetails?.uv_index ?? 'N/A'}</Text>
        </View>
      </View>

      {(rainfall?.today?.rainfall_mm !== undefined || (rainfall?.past && rainfall.past.length > 0)) && (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.rainfallBtn}>☔ View Rainfall Report</Text>
        </TouchableOpacity>
      )}

      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Animated.View style={[styles.popupCard, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>
            <Text style={styles.popupTitle}>🌧 Rainfall Report</Text>
            <Text style={styles.popupItem}>
              Today: {rainfall?.today?.rainfall_mm ?? 0} mm - {getRainfallStatus(rainfall?.today?.rainfall_mm)}
            </Text>
            {rainfall?.past?.map((day, index) => (
              <Text key={index} style={styles.popupItem}>
                {day?.date || '—'}: {day?.rainfall_mm ?? 0} mm - {getRainfallStatus(day?.rainfall_mm)}
              </Text>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 20 },
  location: { color: 'grey', fontSize: 24, fontWeight: 'bold', fontFamily: 'Oswald' },
  date: { color: '#fff', fontSize: 19, marginTop: 5, fontFamily: 'Oswald' },
  temp: { color: '#fff', fontSize: 80, fontWeight: 'bold', marginVertical: 10, fontFamily: 'Oswald' },
  icon: { fontSize: 120, marginBottom: 10 },
  summary: { color: '#fff', fontSize: 24, opacity: 0.9, fontFamily: 'Oswald' },
  sectionTitle: {
    color: '#fff', fontSize: 22, fontWeight: 'bold', marginLeft: 20,
    marginTop: 20, marginBottom: 10, fontFamily: 'Oswald'
  },
  row: { paddingHorizontal: 20, marginBottom: 30 },
  hourBox: {
    backgroundColor: '#111', padding: 12, borderRadius: 10,
    marginRight: 10, alignItems: 'center'
  },
  hour: { color: '#ccc', fontSize: 20 ,fontFamily:'Oswald'},
  hourTemp: { color: '#fff', fontSize: 19, fontWeight: 'bold' ,fontFamily:'Oswald'},
  noData: { color: '#888', marginLeft: 20 },
  detailsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', paddingHorizontal: 20
  },
  detailBox: {
    width: '48%', backgroundColor: '#111',
    padding: 15, borderRadius: 10, marginBottom: 15
  },
  detailLabel: { color: '#aaa', fontSize: 20, marginBottom: 5, fontFamily: 'Oswald' },
  detailValue: { color: '#fff', fontSize: 18, fontWeight: 'bold',fontFamily:'Oswald'},
  rainfallBtn: {
    color: '#4db8ff', fontSize: 20, textAlign: 'center',
    marginTop: 5, fontWeight: 'bold', fontFamily: 'Oswald'
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center'
  },
  popupCard: {
    backgroundColor: '#222', padding: 25, borderRadius: 12,
    width: '85%', position: 'relative',
  },
  popupTitle: {
    color: '#fff', fontSize: 22, fontWeight: 'bold',
    marginBottom: 15, fontFamily: 'Oswald'
  },
  popupItem: { color: '#ccc', fontSize: 16, marginBottom: 10,fontFamily:'Oswald'},
  closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  closeButtonText: { color: '#fff', fontSize: 20 }
});
