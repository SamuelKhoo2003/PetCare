import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import PetDetails from '../screens/PetDetails';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';

const Stack = createStackNavigator();
console.log("HomeMainScreen.js");
export default function HomeMainScreen(){
    return(
        <NavigationIndependentTree>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="HomeScreen" component={HomeScreen}/>
                <Stack.Screen name="PetDetails" component={PetDetails}/>
            </Stack.Navigator>
        </NavigationIndependentTree>
    );
}