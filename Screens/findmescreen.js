import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Pressable, Animated, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import * as Location from 'expo-location';
import moment from 'moment';

//Climate icon function
const getWeatherIcon = (summary = '') => {
  const lower = summary.toLowerCase();
  if (lower.includes('cloud')) return '☁️';
  if (lower.includes('rain')) return '🌧️';
  if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
  if (lower.includes('storm')) return '⛈️';
  if (lower.includes('snow')) return '❄️';
  if (lower.includes('fog') || lower.includes('haze')) return '🌫️';
  if (lower.includes('wind')) return '💨';
  if (lower.includes('overcast')) return '🌥️';
  return '🌍';
};

export default function FindMeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [satelliteModalVisible, setSatelliteModalVisible] = useState(false);
  const [locationName, setLocationName] = useState('Fetching...');
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const satelliteScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: modalVisible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [modalVisible]);

  useEffect(() => {
    Animated.spring(satelliteScaleAnim, {
      toValue: satelliteModalVisible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [satelliteModalVisible]);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Permission Denied');
        setIsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let geo = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const currentDate = new Date().toISOString().split('T')[0];
      const name = geo[0].city || geo[0].district || geo[0].region || 'Unknown';
      setLocationName(name);

      const response = await fetch('YOUR IPV4:5000/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          location: name,
          date: currentDate,
        }),
      });

      const resJson = await response.json();
      setWeatherData(resJson?.data || null);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching location or weather:", error);
      setLocationName('Location Error');
      setIsLoading(false);
    }
  };

  const renderWeekSection = (title, data) => {
    if (!data || data.length === 0) return null;

    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {data.map((item, index) => {
            const date = moment(item.date);
            const isToday = date.isSame(moment(), 'day');
            return (
              <TouchableOpacity key={index} onPress={() => handleDayPress(item)} style={styles.dayItem}>
                <Text style={[styles.dayText, isToday && styles.todayBlue]}>{date.format('ddd')}</Text>
                <Text style={[styles.dateText, isToday && styles.todayBlue]}>{date.format('MMM D')}</Text>
                <Text style={[styles.tempText, isToday && styles.todayBlue]}>↑ {item.temp_max}°C</Text>
                <Text style={[styles.tempText, isToday && styles.todayBlue]}>↓ {item.temp_min}°C</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </>
    );
  };

  const handleDayPress = (item) => {
    navigation.navigate('DayDetails', {
      dayData: item,
      location: locationName,
      weatherDetails: weatherData?.weather_details?.weather,
      rainfall: {
        today: weatherData?.rainfall?.today_rainfall,
        past: weatherData?.rainfall?.past_rainfall,
      },
      hourlyTemperatures: weatherData?.hourly_forecast || [],
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00aaff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Fetching real weather data...</Text>
      </View>
    );
  }

  const weekly = weatherData?.weekly_summary || {};
  const satelliteUrl = weatherData?.satellite_image?.image_url
    ? weatherData.satellite_image.image_url.startsWith('http')
      ? weatherData.satellite_image.image_url
      : `YOUR IPV4:5000${weatherData.satellite_image.image_url.startsWith('/') ? '' : '/'}${weatherData.satellite_image.image_url}`
    : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.locationText}>{locationName}</Text>
        <Text style={styles.weatherIcon}>
          {getWeatherIcon(weatherData?.weather_details?.weather?.summary || '')}
        </Text>
        <Text style={styles.temperatureText}>
          {weatherData?.weather_details?.weather?.temperature
            ? `${weatherData.weather_details.weather.temperature}°C`
            : 'N/A'}
        </Text>
        <Text style={styles.climateText}>
          {weatherData?.weather_details?.weather?.summary || '—'}
        </Text>
      </View>

      {renderWeekSection('Previous Week', weekly.previous_week)}
      {renderWeekSection('Current Week', weekly.current_week)}
      {renderWeekSection('Next Week', weekly.next_week)}

      <Text style={styles.sectionTitle}>Satellite View</Text>
      {satelliteUrl ? (
        <TouchableOpacity onPress={() => setSatelliteModalVisible(true)}>
          <Image
            source={{ uri: satelliteUrl }}
            style={styles.satelliteImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : (
        <Text style={{ color: '#aaa', textAlign: 'center', marginVertical: 20 }}>Satellite image not available</Text>
      )}

      <Text style={styles.sectionTitle}>Soil Properties</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View style={styles.soilCard}>
          <View style={styles.soilRow}>
            <Text style={styles.soilIcon}>🌿</Text>
            <Text style={styles.soilLabel}>NDVI Value:</Text>
            <Text style={styles.soilValue}>{weatherData?.soil_condition?.ndvi_mean ?? '0.78'}</Text>
          </View>
          <View style={styles.soilRow}>
            <Text style={styles.soilIcon}>💧</Text>
            <Text style={styles.soilLabel}>Humidity & Rain:</Text>
            <Text style={styles.soilValue}>{weatherData?.soil_condition?.humidity ?? '65%'} | {weatherData?.soil_condition?.rain ?? 'Moderate'}</Text>
          </View>
          <View style={styles.soilRow}>
            <Text style={styles.soilIcon}>🪨</Text>
            <Text style={styles.soilLabel}>Soil Condition:</Text>
            <Text style={styles.soilValue}>{weatherData?.soil_condition?.estimated_condition ?? 'Good (Loamy)'}</Text>
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
              🌿 NDVI Value: <Text style={styles.popupValue}>{weatherData?.soil_condition?.ndvi_mean ?? 'N/A'}</Text>
            </Text>
            <Text style={styles.popupItem}>
              💧 Humidity & Rain: <Text style={styles.popupValue}>{weatherData?.soil_condition?.humidity ?? '—'}% | {weatherData?.soil_condition?.rain ?? '—'} mm</Text>
            </Text>
            <Text style={styles.popupItem}>
              🪨 Soil Condition: <Text style={styles.popupValue}>{weatherData?.soil_condition?.estimated_condition ?? '—'}</Text>
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
            <Text style={styles.popupTitle}>🛰️ Satellite Image</Text>
            {satelliteUrl ? (
              <Image
                source={{ uri: satelliteUrl }}
                style={{ width: '100%', height: 200, borderRadius: 10, marginTop: 10 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: '#ccc', textAlign: 'center', marginTop: 20 }}>Satellite image not available</Text>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', flex: 1, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  topSection: { alignItems: 'center', marginBottom: 30 },
  locationText: { color: 'grey', fontSize: 24, fontWeight: 'bold', marginBottom: 20,fontFamily:'Oswald' },
  weatherIcon: { fontSize: 120, marginBottom: 20 },
  temperatureText: { color: '#fff', fontSize: 80, fontWeight: 'bold', marginBottom: 10 ,fontFamily:'Oswald'},
  climateText: { color: '#fff', fontSize: 24, marginBottom: 20, opacity: 0.9,fontFamily:'Oswald' },
  sectionTitle: { color: '#fff', fontSize: 23, fontWeight: 'bold', marginLeft: 20, marginBottom: 10,fontFamily:'Oswald'},
  row: { paddingLeft: 20, marginBottom: 30 },
  dayItem: { alignItems: 'center', marginRight: 15},
  dayText: { color: '#fff', fontSize: 18 ,fontFamily:'Oswald'},
  dateText: { color: '#aaa', fontSize: 15, marginBottom: 5,fontFamily:'Oswald' },
  tempText: { color: '#fff', fontSize: 16,fontFamily:'Oswald' },
  todayBlue: { color: '#4db8ff' },
  satelliteImage: { width: '90%', height: 200, resizeMode: 'cover', alignSelf: 'center', marginBottom: 40, borderRadius: 10 },
  soilCard: { backgroundColor: '#111', marginHorizontal: 20, marginBottom: 40, padding: 20, borderRadius: 12},
  soilRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  soilIcon: { fontSize: 22, marginRight: 10 },
  soilLabel: { color: '#aaa', fontSize: 15, flex: 1,fontFamily:'Oswald' },
  soilValue: { color: '#fff', fontSize: 15, fontWeight: 'bold',fontFamily:'Oswald'},
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  popupCard: { backgroundColor: '#222', padding: 25, borderRadius: 12, width: '85%', position: 'relative' },
  popupTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 15,fontFamily:'Oswald'},
  popupItem: { color: '#ccc', fontSize: 16, marginBottom: 10 },
  popupValue: { color: '#fff', fontWeight: 'bold',fontFamily:'Oswald' },
  closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  closeButtonText: { color: '#fff', fontSize: 20 },
});
