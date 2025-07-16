import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import LocationScreen from '../Screens/locationscreen';
import FindMeScreen from '../Screens/findmescreen';
import CustomLocationScreen from '../Screens/customlocation';
import CustomResultScreen from '../Screens/CustomResultScreen';

const Tab = createBottomTabNavigator();
const SearchStack = createNativeStackNavigator();

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="CustomLocation" component={CustomLocationScreen} />
      <SearchStack.Screen name="CustomResult" component={CustomResultScreen} />
    </SearchStack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#ccc',
        tabBarStyle: { backgroundColor: '#000', borderTopWidth: 0 },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'FindMe') iconName = 'location';
          else if (route.name === 'Search') iconName = 'search';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={LocationScreen} />
      <Tab.Screen name="FindMe" component={FindMeScreen} />
      <Tab.Screen name="Search" component={SearchStackNavigator} />
    </Tab.Navigator>
  );
}
