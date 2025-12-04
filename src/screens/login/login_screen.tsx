import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import {useWebSocket} from '../../utility/WebSocketConnection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './Login.styles';
 
const {width, height} = Dimensions.get('window');
 
const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';
const USER_EMAIL_KEY = 'user_email';
const DEALER_ID_KEY = 'dealerId';
const USER_DATA_KEY = 'userData';
 
type RootStackParamList = {
  Login: undefined;
  Home: {
    token: string;
    userId: string;
    userInfo: any;
  };
  ForgotPassword: undefined;
};
 
type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;
 
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {connectWebSocket} = useWebSocket();
 
  const storeAuthData = async (
    token: string,
    userId: string,
    email: string,
    dealerId: string | null,
    fullUserData: any,
  ) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_ID_KEY, userId);
      await AsyncStorage.setItem(USER_EMAIL_KEY, email);
 
      if (dealerId) {
        await AsyncStorage.setItem(DEALER_ID_KEY, dealerId);
        console.log('Dealer ID stored:', dealerId);
      }
 
      await AsyncStorage.setItem(
        USER_DATA_KEY,
        JSON.stringify({
          id: userId,
          userId: userId,
          email: email,
          dealerId: dealerId,
          ...fullUserData,
        }),
      );
 
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };
 
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  };
 
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username and Password are required');
      return;
    }
 
    try {
      setLoading(true);
 
      const response = await fetch(
        'https://car01.dostenterprises.com/jwt/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim(),
          }),
        },
      );
 
      const responseText = await response.text();
      console.log('LOGIN RESPONSE:', responseText);
 
      let token: string | null = null;
 
      try {
        const data = JSON.parse(responseText);
        if (data.token) token = data.token;
        else if (typeof data === 'string' && data.length > 100) token = data;
      } catch {
        if (
          responseText &&
          responseText.includes('.') &&
          responseText.length > 100
        ) {
          token = responseText;
        }
      }
 
      if (response.ok && token) {
        const decodedToken = parseJwt(token);
        const userId =
          decodedToken?.userId ||
          decodedToken?.sub ||
          decodedToken?.id ||
          username;
        const userEmail = decodedToken?.email || username;
 
        const dealerId =
          decodedToken?.dealerId ||
          decodedToken?.dealer_id ||
          decodedToken?.dealerID ||
          decodedToken?.DealerId ||
          decodedToken?.dealer ||
          null;
 
        await storeAuthData(token, userId, userEmail, dealerId, decodedToken);
        connectWebSocket();
 
        // Check dealer access
        if (!dealerId) {
          Alert.alert(
            'Access Denied',
            'You are not a dealer. Only dealers can log in.',
          );
          setLoading(false);
          return;
        }
 
        Alert.alert('Success', 'Login Successful!');
 
        setTimeout(() => {
          navigation.navigate('Home', {
            token: token!,
            userId: userId,
            userInfo: decodedToken,
          });
        }, 1000);
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to server. Please check your internet connection.',
      );
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <LinearGradient
      colors={['#051A2F', '#051A2F', '#051A2F']}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#051A2F" />
 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Top Section */}
          <View style={styles.topCurvedSection}>
            <Image
              source={require('../../assets/images/caryanam.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
 
          {/* Card */}
          <View style={styles.cardContainer}>
            <View style={styles.content}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Username/Email</Text>
                <TextInput
                  placeholder="Enter username or email"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
 
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
 
                <View style={styles.passwordContainer}>
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIconFront}>
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
 
                  <TextInput
                    placeholder="Enter password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
 
              <TouchableOpacity
                style={styles.forgotContainer}
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
 
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};
 
export default Login;
 