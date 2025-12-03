import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
 
// Screens
import LoginScreen from '../screens/login/login_screen';
import BottomNavigationScreen from '../components/BottomNavigation/bottomnavigation_screen';
import SignUpScreen from '../screens/signup/signup_screen';
import ForgotPasswordScreen from '../screens/forgotpassword/ForgotPassword';
import InspectionReport from '../screens/mycars/InspectionReport';
 
/**
 * Define the navigation stack parameter list.
 */
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  SignUp: undefined;
  ForgotPassword: undefined; // 👈 add route here
  InspectionReport: { beadingCarId: string }; // ✅ add this

};
 
const Stack = createNativeStackNavigator<RootStackParamList>();
 
const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={BottomNavigationScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="InspectionReport" component={InspectionReport} />
    </Stack.Navigator>
  );
};
 
export default AppNavigator;
