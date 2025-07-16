import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../Screens/splashscreen';
import LocationScreen from '../Screens/locationscreen';
import TabNavigator from '../Navigation/tabnavigator';
import DayDetailsScreen from '../Screens/DayDetailsScreen';
import DayDetailsScreen1 from '../Screens/DayDetailsScreen1';
import FindMeScreen from '../Screens/findmescreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="DayDetails" component={DayDetailsScreen} />
       <Stack.Screen name="FindMeScreen" component={FindMeScreen} />
      <Stack.Screen name="DayDetails1" component={DayDetailsScreen1} />
    </Stack.Navigator>
  );
}
