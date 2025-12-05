import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  Image,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import styles from '../account/AccountScreen.styles';
import {apiConfig} from '../../utility/serverConfig';

const TOKEN_KEY = 'auth_token';

const AccountScreen = ({navigation}: any) => {
  const [dealerData, setDealerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

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
    } catch {
      return null;
    }
  };

  const fetchDealerData = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return Alert.alert('Error', 'Token missing.');

      const decoded = parseJwt(token);
      const dealerId = decoded?.dealerId;
      const userId = decoded?.userId;

      if (!dealerId || !userId) {
        Alert.alert('Error', 'User/Dealer ID missing.');
        return;
      }

      // -------- GET DEALER DATA (serverConfig) ----------
      const dealerResponse = await apiConfig.user.getDealerById(
        dealerId,
        token,
      );
      if (dealerResponse?.dealerDto) {
        setDealerData(dealerResponse.dealerDto);
      }

      // -------- GET PROFILE PHOTO (serverConfig) ----------
      const photoResponse = await apiConfig.user.getProfilePhoto(userId, token);

      if (photoResponse.ok) {
        const blob = await photoResponse.blob();
        const reader = new FileReader();
        reader.onload = () => setPhotoUrl(reader.result as string);
        reader.readAsDataURL(blob);
      } else {
        setPhotoUrl(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data.');
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return;

      const decoded = parseJwt(token);
      const userId = decoded?.userId;
      if (!userId) return;

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.didCancel || !result.assets?.length) return;

      const file = result.assets[0];

      const formData = new FormData();
      formData.append('image', {
        uri: file.uri,
        name: file.fileName || 'profile.jpg',
        type: file.type || 'image/jpeg',
      } as any);

      formData.append('userId', userId.toString());

      setLoading(true);

      // -------- ADD PROFILE PHOTO (serverConfig) ----------
      const uploadResponse = await apiConfig.user.addProfilePhoto(
        formData,
        token,
      );

      if (uploadResponse.ok) {
        Alert.alert('Success', 'Profile photo uploaded.');
        fetchDealerData();
      } else {
        Alert.alert('Error', 'Failed to upload photo.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to upload photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return;

      const decoded = parseJwt(token);
      const userId = decoded?.userId;
      if (!userId) return;

      setLoading(true);

      // -------- DELETE PROFILE PHOTO (serverConfig) ----------
      const deleteResponse = await apiConfig.user.deleteProfilePhoto(
        userId,
        token,
      );

      if (deleteResponse.ok) {
        setPhotoUrl(null);
        Alert.alert('Deleted', 'Profile photo removed.');
        fetchDealerData();
      } else {
        Alert.alert('Error', 'Failed to delete photo.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to delete photo.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(TOKEN_KEY);
          navigation.replace('Login');
        },
      },
    ]);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    fetchDealerData();
  }, []);

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('HomeTab')}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/images/caryanam.png')}
                style={styles.logoImage}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.subTitle}>Manage your account</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={confirmLogout}
            activeOpacity={0.85}>
            <Image
              source={require('../../assets/images/image.png')}
              style={styles.logoutIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{paddingBottom: 40}}>
        <TouchableOpacity style={styles.profileCard} onPress={openModal}>
          {photoUrl ? (
            <Image source={{uri: photoUrl}} style={styles.profileAvatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={64} color="#262A4F" />
          )}

          <View style={styles.profileText}>
            <Text style={styles.profileName}>
              {dealerData
                ? `${dealerData.firstName} ${dealerData.lastName || ''}`
                : 'Loading...'}
            </Text>

            <Text style={styles.profileDetails}>
              {dealerData?.mobileNo || '—'}
            </Text>

            <Text style={styles.profileDetails}>
              Shop: {dealerData?.shopName || '—'}
            </Text>
          </View>

          <Ionicons name="chevron-forward-outline" size={24} color="#A9ACD6" />
        </TouchableOpacity>

        <View style={styles.storyBanner}>
          <Text style={styles.storyText}>
            Your stories now have a new destination
          </Text>
          <Text style={styles.bigCardSub}>Follow CARYANAMINDIA Partners</Text>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => Linking.openURL('mailto:info@caryanam.in')}>
              <Ionicons name="mail-outline" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() =>
                Linking.openURL('https://www.instagram.com/caryanamindia_/')
              }>
              <Ionicons name="logo-instagram" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() =>
                Linking.openURL(
                  'https://www.facebook.com/p/CaryanamIndia-61564972127778/',
                )
              }>
              <Ionicons name="logo-facebook" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutCard} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={28} color="#262A4F" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL */}
      <Modal transparent visible={modalVisible} onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalAnim,
              transform: [
                {
                  scale: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}>
          {loading ? (
            <ActivityIndicator size="large" color="#262A4F" />
          ) : dealerData ? (
            <>
              <View style={styles.profileImageContainer}>
                {photoUrl ? (
                  <Image source={{uri: photoUrl}} style={styles.profileImage} />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={120}
                    color="#ccc"
                  />
                )}
                {/* <View style={styles.imageButtonRow}>
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={handleAddImage}>
                    <Text style={styles.addImageText}>ADD IMAGE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={handleDeleteImage}>
                    <Text style={styles.deleteImageText}>DELETE IMAGE</Text>
                  </TouchableOpacity>
                </View> */}
              </View>

              <View style={styles.detailBox}>
                <DetailRow label="First Name" value={dealerData.firstName} />
                <DetailRow label="Last Name" value={dealerData.lastName} />
                <DetailRow label="Mobile Number" value={dealerData.mobileNo} />
                <DetailRow label="Shop Name" value={dealerData.shopName} />
                <DetailRow label="Area" value={dealerData.area} />
                <DetailRow label="Email" value={dealerData.email} />
                <DetailRow label="City" value={dealerData.city} />
                <DetailRow label="Address" value={dealerData.address} />
              </View>

              <TouchableOpacity style={styles.editButton} onPress={closeModal}>
                <Text style={styles.editButtonText}>CLOSE PROFILE</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text>No data available.</Text>
          )}
        </Animated.View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#262A4F" />
        </View>
      )}
    </Animated.View>
  );
};

const DetailRow = ({label, value}: {label: string; value?: string}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={styles.detailValueContainer}>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  </View>
);

export default AccountScreen;
