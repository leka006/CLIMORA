import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';

// icon based on climate 
const getWeatherIcon = (summary = '') => {
  const lower = summary.toLowerCase();
  if (lower.includes('overcast')) return '🌥️';
  if (lower.includes('cloud')) return '☁️';
  if (lower.includes('rain')) return '🌧️';
  if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
  if (lower.includes('storm')) return '⛈️';
  if (lower.includes('snow')) return '❄️';
  if (lower.includes('fog') || lower.includes('haze')) return '🌫️';
  if (lower.includes('wind')) return '💨';
  return '🌍';
};

export default function CustomResultScreen({ route, navigation }) {
  const { locationName, latitude, longitude } = route.params || {};

  const [modalVisible, setModalVisible] = useState(false);
  const [satelliteModalVisible, setSatelliteModalVisible] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const satelliteScaleAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (satelliteModalVisible) {
      Animated.spring(satelliteScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      satelliteScaleAnim.setValue(0);
    }
  }, [satelliteModalVisible]);

  useEffect(() => {
    const fetchData = async () => {
      const payload = {
        latitude,
        longitude,
        location: locationName,
        date: new Date().toISOString().split('T')[0],
      };

      try {
        const res = await fetch('http://10.201.46.83:5000/weather', {

          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        setWeatherData(json.data);
      } catch (error) {
        console.error('❌ Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const weather = weatherData?.weather_details?.weather || {};
  const summary = weather.summary || '';
  const weatherIcon = getWeatherIcon(summary);

  const currentWeek = weatherData?.weekly_summary?.current_week || [];
  const nextWeek = weatherData?.weekly_summary?.next_week || [];
  const previousWeek = weatherData?.weekly_summary?.previous_week || [];
  const today = new Date().toISOString().split('T')[0];
  const soil = weatherData?.soil_condition || {};
  const satellite = weatherData?.satellite_image || {};
  const hourlyTemps = weatherData?.hourly_forecast || [];
  const rainfallData = weatherData?.rainfall || {};

  const satelliteUrl = satellite.image_url?.startsWith('http')
    ? satellite.image_url
    : `http://10.201.46.83:5000${satellite.image_url || ''}`;

  const renderWeekSection = (title, data, isCurrent = false) =>
  data.length > 0 ? (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {data.map((day, index) => {
          const isPast = isCurrent && day.date < today;
          const isToday = isCurrent && day.date === today;

          const fullDayData = {
  day: new Date(day.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }),
  icon: getWeatherIcon(day.summary || ''),
  temp: `${day.temp_max}° / ${day.temp_min}°`,
  hourly_temperatures: isToday ? hourlyTemps : [],
  weather_details: {
    location: weather.location || locationName,
    humidity: day.humidity || weather.humidity,
    pressure: day.pressure || weather.pressure,
    sunrise: day.sunrise || weather.sunrise,
    sunset: day.sunset || weather.sunset,
    wind_speed: day.wind_speed || weather.wind_speed,
    uv_index: day.uv_index || weather.uv_index,
    temperature: isToday ? weather.temperature : undefined,
    summary: day.summary || day.weather_summary || day.climate || weather.summary || 'N/A',
  },
  rainfall: {
    past: rainfallData.past_rainfall || [],
    today: rainfallData.today_rainfall || {},
  },
};


          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayItem, isToday && { backgroundColor: 'transparent', borderRadius: 0 }]}
              onPress={() => navigation.navigate('DayDetails1', { dayData: fullDayData })}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.dayText, isPast && { color: 'grey' }, isToday && { color: '#3399ff' }]}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dateText, isPast && { color: 'grey' }, isToday && { color: '#3399ff' }]}>
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                {/* 🧼 No more icons here */}
                <Text style={[styles.tempText, isPast && { color: 'grey' }, isToday && { color: '#3399ff' }]}>
                  ↑ {day.temp_max}°
                </Text>
                <Text style={[styles.tempText, isPast && { color: 'grey' }, isToday && { color: '#3399ff' }]}>
                  ↓ {day.temp_min}°
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  ) : null;


  return (
    <ScrollView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.locationText}>{weather.location || locationName}</Text>
        <Text style={styles.weatherIcon}>{weatherIcon}</Text>
        <Text style={styles.temperatureText}>{weather.temperature}°C</Text>
        <Text style={styles.climateText}>{weather.summary}</Text>
      </View>

      {renderWeekSection('Previous Week', previousWeek)}
      {renderWeekSection('Current Week', currentWeek, true)}
      {renderWeekSection('Next Week', nextWeek)}

      <Text style={styles.sectionTitle}>Satellite View</Text>
      {satelliteUrl ? (
        <TouchableOpacity onPress={() => setSatelliteModalVisible(true)}>
          <Image source={{ uri: satelliteUrl }} style={styles.satelliteImage} />
        </TouchableOpacity>
      ) : (
        <Text style={{ color: '#aaa', textAlign: 'center', marginBottom: 20 }}>Satellite image not available</Text>
      )}

      <Text style={styles.sectionTitle}>Soil Properties</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View style={styles.soilCard}>
          <View style={styles.soilRow}>
            <Text style={styles.soilIcon}>🌿</Text>
            <Text style={styles.soilLabel}>NDVI Value:</Text>
            <Text style={styles.soilValue}>{soil.ndvi_mean}</Text>
          </View>
          <View style={styles.soilRow}>
            <Text style={styles.soilIcon}>💧</Text>
            <Text style={styles.soilLabel}>Humidity & Rain:</Text>
            <Text style={styles.soilValue}>
              {soil.humidity}% | {soil.rain} mm
            </Text>
          </View>
          <View style={styles.soilRow}>
            <Text style={styles.soilIcon}>🪨</Text>
            <Text style={styles.soilLabel}>Soil Condition:</Text>
            <Text style={styles.soilValue}>{soil.estimated_condition}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Soil Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Animated.View style={[styles.popupCard, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>
            <Text style={styles.popupTitle}>🌱 Soil Properties</Text>
            <Text style={styles.popupItem}>
              🌿 NDVI Value: <Text style={styles.popupValue}>{soil.ndvi_mean}</Text>
            </Text>
            <Text style={styles.popupItem}>
              💧 Humidity & Rain: <Text style={styles.popupValue}>{soil.humidity}% | {soil.rain} mm</Text>
            </Text>
            <Text style={styles.popupItem}>
              🪨 Soil Condition: <Text style={styles.popupValue}>{soil.estimated_condition}</Text>
            </Text>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Satellite Modal */}
      <Modal transparent visible={satelliteModalVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSatelliteModalVisible(false)}>
          <Animated.View style={[styles.popupCard, { transform: [{ scale: satelliteScaleAnim }] }]}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSatelliteModalVisible(false)}>
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>
            <Text style={styles.popupTitle}>🛰️ Satellite View</Text>
            <Image
              source={{ uri: satelliteUrl }}  
              style={{ width: '100%', height: 200, borderRadius: 10, marginTop: 10 }}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', flex: 1, paddingTop: 60 },
  topSection: { alignItems: 'center', marginBottom: 30 },
  locationText: { color: 'grey', fontSize: 24, fontWeight: 'bold', marginBottom: 20,fontFamily:'Oswald' },
  weatherIcon: { fontSize: 120, marginBottom: 20 },
  weatherIconSmall: { fontSize: 30, marginBottom: 5 },
  temperatureText: { color: '#fff', fontSize: 80, fontWeight: 'bold', marginBottom: 10,fontFamily:'Oswald'},
  climateText: { color: '#fff', fontSize: 24, marginBottom: 20, opacity: 0.9,fontFamily:'Oswald' },
  sectionTitle: { color: '#fff', fontSize: 23, fontWeight: 'bold', marginLeft: 20, marginBottom: 10,fontFamily:'Oswald' },
  row: { paddingLeft: 20, marginBottom: 30 },
  dayItem: { alignItems: 'center', marginRight: 15 },
  dayText: { color: '#fff', fontSize: 18, marginBottom: 4 ,fontFamily:'Oswald'},
  dateText: { color: '#aaa', fontSize: 15,fontFamily:'Oswald' },
  tempText: { color: '#fff', fontSize: 16,fontFamily:'Oswald' },
  satelliteImage: {
    width: '90%',
    height: 200,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginBottom: 40,
    borderRadius: 10,
  },
  soilCard: {
    backgroundColor: '#111',
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 20,
    borderRadius: 12,
  },
  soilRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  soilIcon: { fontSize: 22, marginRight: 10 },
  soilLabel: { color: '#aaa', fontSize: 15, flex: 1 ,fontFamily:'Oswald'},
  soilValue: { color: '#fff', fontSize: 15, fontWeight: 'bold',fontFamily:'Oswald' },
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
  popupTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 15,fontFamily:'Oswald' },
  popupItem: { color: '#ccc', fontSize: 16, marginBottom: 10 ,fontFamily:'Oswald'},
  popupValue: { color: '#fff', fontWeight: 'bold',fontFamily:'Oswald'},
  closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  closeButtonText: { color: '#fff', fontSize: 20 },
});