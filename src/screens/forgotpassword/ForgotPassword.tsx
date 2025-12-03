// ForgotPassword.tsx - FINAL (Blue Theme + Centered Logo + Separate Styles)

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import styles from './ForgotPasswordStyles';

// Navigation types
type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

const ForgotPassword = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Validation Error', 'Please enter your email.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'https://car01.dostenterprises.com/cars/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({email: trimmedEmail}),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          'Password reset link has been sent to your email.',
          [{text: 'OK', onPress: () => navigation.navigate('Login')}],
        );
      } else {
        const message =
          data.message ||
          'Email not supported or invalid. Please check and try again.';
        Alert.alert('Error', message);
      }
    } catch (error: any) {
      console.error('Network Error:', error);
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

      {/* Top Section with Centered Logo */}
      <View style={styles.topCurvedSection}>
        <Image
          source={require('../../assets/images/caryanam.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* <Text style={styles.logoTitle}>CARYANAMINDIA</Text> */}
      </View>

      {/* White Curved Card */}
      <View style={styles.cardContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Forgot Password</Text>

          <Text style={styles.label}>Enter your email</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ForgotPassword;
