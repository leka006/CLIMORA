import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './Navigation/stacknavigator';
import { useFonts } from 'expo-font';
import { Text, View } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Oswald': require('./assets/font/Oswald-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontFamily: 'Oswald' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}
