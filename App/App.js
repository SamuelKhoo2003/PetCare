import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BottomNavigator from './src/navigation/BottomNavigator';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // Simulate a loading delay
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
        <>
            <Stack.Screen name="Login">
            {props => <LoginScreen
              {...props}
              onLogin={() => setIsAuthenticated(true)} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
            {() => <RegisterScreen onRegister={() => setIsAuthenticated(true)} />}
            </Stack.Screen>
        </>
        ) : (
          <Stack.Screen name="Main" component={BottomNavigator} />
        )}
    </Stack.Navigator>
  );
}