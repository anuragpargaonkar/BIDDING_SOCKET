import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
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
import styles from '../account/AccountScreen.styles'; // Imported styles

const TOKEN_KEY = 'auth_token';

const AccountScreen = ({navigation}: any) => {
  const [doNotDisturb, setDoNotDisturb] = useState(false);
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
    } catch (error) {
      console.error('JWT Parse Error:', error);
      return null;
    }
  };

  const fetchDealerData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        Alert.alert('Error', 'Missing authentication token.');
        setLoading(false);
        return;
      }

      const decoded = parseJwt(token);
      const dealerId = decoded?.dealerId;
      const userId = decoded?.userId;
      if (!dealerId || !userId) {
        Alert.alert('Error', 'User or Dealer ID not found.');
        setLoading(false);
        return;
      }

      const dealerRes = await fetch(
        `https://car01.dostenterprises.com/dealer/${dealerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const dealerJson = await dealerRes.json();
      if (dealerRes.ok && dealerJson?.dealerDto)
        setDealerData(dealerJson.dealerDto);

      const photoRes = await fetch(
        `https://car01.dostenterprises.com/ProfilePhoto/getbyuserid?userId=${userId}`,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      if (photoRes.ok) {
        const blob = await photoRes.blob();
        const reader = new FileReader();
        reader.onload = () => {
          setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } else {
        setPhotoUrl(null);
      }
    } catch (error) {
      console.error('Error fetching dealer data:', error);
      Alert.alert('Error', 'Unable to fetch dealer data.');
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return Alert.alert('Error', 'Missing token.');
      const decoded = parseJwt(token);
      const userId = decoded?.userId;
      if (!userId) return Alert.alert('Error', 'User ID not found.');

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.didCancel || !result.assets?.length) return;

      const file = result.assets[0];
      if (!file.uri) return Alert.alert('Error', 'Image URI not found.');

      const formData = new FormData();
      formData.append('image', {
        uri: file.uri,
        name: file.fileName || 'photo.jpg',
        type: file.type || 'image/jpeg',
      } as any);

      formData.append('userId', userId.toString());

      setLoading(true);
      const res = await fetch(
        'https://car01.dostenterprises.com/ProfilePhoto/add',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (res.ok) {
        Alert.alert('Success', 'Profile photo added successfully.');
        fetchDealerData();
      } else {
        const errorText = await res.text();
        console.error('Upload failed:', errorText);
        Alert.alert('Error', 'Failed to upload photo.');
      }
    } catch (error) {
      console.error('Add image error:', error);
      Alert.alert('Error', 'Could not upload photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return Alert.alert('Error', 'Missing token.');
      const decoded = parseJwt(token);
      const userId = decoded?.userId;
      if (!userId) return Alert.alert('Error', 'User ID not found.');

      setLoading(true);
      const res = await fetch(
        `https://car01.dostenterprises.com/ProfilePhoto/deletebyuserid?userId=${userId}`,
        {
          method: 'DELETE',
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      if (res.ok) {
        setPhotoUrl(null);
        Alert.alert('Deleted', 'Profile photo removed successfully.');
        fetchDealerData();
      } else {
        const errorText = await res.text();
        console.error('Delete failed:', errorText);
        let msg = 'Failed to delete photo.';
        try {
          const err = JSON.parse(errorText);
          if (err.message?.includes('not found')) {
            setPhotoUrl(null);
            Alert.alert('Info', 'No profile photo to delete.');
            fetchDealerData();
            return;
          }
          msg = err.message || msg;
        } catch {}
        Alert.alert('Error', msg);
      }
    } catch (error) {
      console.error('Delete image error:', error);
      Alert.alert('Error', 'Could not delete photo.');
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
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            navigation.replace('Login');
          } catch {
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
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
            onPress={() => navigation.navigate('Home')}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/images/caryanam.png')}
                style={styles.logoImage}
                resizeMode="cover"
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
        <View style={styles.topBanner}>
          <Text style={styles.topBannerText}>Get unlimited app access</Text>
          <Text style={styles.topBannerSub}>
            Buy <Text style={styles.highlight}>Basic</Text> at just ₹500 / month
          </Text>
          <TouchableOpacity style={{marginTop: 8}}>
            <Text style={styles.knowMore}>Know more</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.profileCard}
          onPress={openModal}>
          {photoUrl ? (
            <Image source={{uri: photoUrl}} style={styles.profileAvatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={64} color="#262A4F" />
          )}
          <View style={styles.profileText}>
            <Text style={styles.profileName}>
              {dealerData
                ? `${dealerData.firstName} ${dealerData.lastName || ''}`
                : loading
                ? 'Loading...'
                : 'Name not available'}
            </Text>
            <Text style={styles.profileDetails}>
              {dealerData?.mobileNo ||
                (loading ? 'Loading...' : 'Mobile not available')}
            </Text>
            <Text style={styles.profileDetails}>
              Shop: {dealerData?.shopName || (loading ? 'Loading...' : '—')}
            </Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="#A9ACD6" />
        </TouchableOpacity>

        <View style={styles.twoCards}>
          <View style={styles.bigCard}>
            <Ionicons name="wallet-outline" size={34} color="#262A4F" />
            <Text style={styles.bigCardTitle}>Payment details</Text>
            <TouchableOpacity style={styles.rechargeBtn}>
              <Text style={styles.bigRechargeText}>₹0 | RECHARGE NOW</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.bigAccentLink}>Recharge more</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bigCard}>
            <Ionicons name="person-outline" size={34} color="#262A4F" />
            <Text style={styles.bigCardTitle}>Sales agent</Text>
            <Text style={styles.bigCardSub}>Organic Mumbai</Text>
            <TouchableOpacity style={{marginTop: 'auto'}}>
              <Text style={styles.bigAccentLink}>Call agent</Text>
            </TouchableOpacity>
          </View>
        </View>

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

        {/*
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Do not disturb</Text>
          <Switch
            value={doNotDisturb}
            onValueChange={setDoNotDisturb}
            thumbColor="#262A4F"
            trackColor={{ false: '#E5E7FF', true: '#61AFFE' }}
            ios_backgroundColor="#E5E7FF"
          />
        </View>
        */}

        <TouchableOpacity style={styles.rewardsCard}>
          <Ionicons name="gift-outline" size={28} color="#262A4F" />
          <Text style={styles.rewardsText}>My rewards</Text>
        </TouchableOpacity>

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
                  <Image
                    source={{uri: photoUrl}}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={120}
                    color="#ccc"
                  />
                )}
                <View style={styles.imageButtonRow}>
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
                </View>
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
                <Text style={styles.editButtonText}>EDIT PROFILE</Text>
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

// FIXED: Address wraps to next line
const DetailRow = ({label, value}: {label: string; value?: string}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={styles.detailValueContainer}>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  </View>
);

export default AccountScreen;
