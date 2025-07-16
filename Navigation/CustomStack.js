import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomLocation from '.Screens/customlocation';
import CustomResultScreen from '.Screens/CustomResultScreen';

const Stack = createNativeStackNavigator();

export default function CustomStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomLocation" component={CustomLocation} />
      <Stack.Screen name="CustomResult" component={CustomResultScreen} />
    </Stack.Navigator>
  );
}
