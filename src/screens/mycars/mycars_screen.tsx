// src/screens/Home/MyCarsScreen.tsx - FINAL (original card UI + pre-fetch)
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useWishlist} from '../../context/WishlistContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

/* --------------------------------------------------------------
   Types
   -------------------------------------------------------------- */
interface Car {
  id: string;
  imageUrl?: string;
  images?: string[]; // fetched from API on load
  isScrap?: boolean;
  city?: string;
  rtoCode?: string;
  make?: string;
  model?: string;
  variant?: string;
  kmsDriven?: number;
  owner?: string;
  fuelType?: string;
  brand?: string;
  registration?: string;
  kmDriven?: number;
  ownerSerial?: string;
  beadingCarId?: string;
  bidCarId?: string;
}

/* --------------------------------------------------------------
   MyCarsScreen – Dealer APIs Only
   -------------------------------------------------------------- */
const MyCarsScreen = ({navigation}: any) => {
  const [selectedTab, setSelectedTab] = useState('My Cars');
  const [bidCars, setBidCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const {wishlist, toggleWishlist, isWishlisted} = useWishlist();
  const refreshSpin = useRef(new Animated.Value(0)).current;

  // Modal states
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [carImages, setCarImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Track which cars are still fetching images
  const [fetchingImages, setFetchingImages] = useState<Set<string>>(new Set());

  /* ----------------------------------------------------------------
     USER DATA
     ---------------------------------------------------------------- */
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const userIdFromStorage = await AsyncStorage.getItem('user_id');
        const dealerIdFromStorage = await AsyncStorage.getItem('dealerId');

        if (userData) {
          const parsed = JSON.parse(userData);
          const extractedUserId =
            parsed.id || parsed.userId || parsed.user_id || userIdFromStorage;
          setUserId(extractedUserId);

          const extractedDealerId =
            parsed.dealerId ||
            parsed.dealer_id ||
            parsed.dealerID ||
            dealerIdFromStorage;
          if (extractedDealerId) {
            setDealerId(String(extractedDealerId));
          } else {
            Alert.alert(
              'Setup Required',
              'Your account does not have a dealer ID assigned.',
              [{text: 'OK', onPress: () => navigation.goBack()}],
            );
          }
        } else if (dealerIdFromStorage) {
          setDealerId(dealerIdFromStorage);
          setUserId(userIdFromStorage || null);
        } else {
          Alert.alert('Login Required', 'Please login to view your cars.', [
            {text: 'OK', onPress: () => navigation.goBack()},
          ]);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data.');
      }
    };
    getUserData();
  }, []);

  /* ----------------------------------------------------------------
     IMAGE FETCHER (single car)
     ---------------------------------------------------------------- */
  const fetchImagesForCar = async (car: Car): Promise<string[]> => {
    const beadingCarId = car.beadingCarId || car.bidCarId || car.id;
    try {
      const response = await fetch(
        `https://car01.dostenterprises.com/uploadFileBidCar/getByBidCarID?beadingCarId=${beadingCarId}`,
      );
      const text = await response.text();
      let imgArray: any[] = [];

      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) imgArray = data;
        else if (data?.object)
          imgArray = Array.isArray(data.object) ? data.object : [data.object];
        else if (data?.data)
          imgArray = Array.isArray(data.data) ? data.data : [data.data];

        const urls = imgArray
          .map(
            (item: any) =>
              item.documentLink || item.imageUrl || item.filePath || item.url,
          )
          .filter(Boolean);

        if (urls.length > 0) {
          // try to warm the native image cache so images appear quickly
          try {
            await Promise.allSettled(urls.map(u => Image.prefetch(String(u))));
          } catch (e) {
            // ignore prefetch failures
          }
          return urls;
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }

    // fallback
    return [
      car.imageUrl ||
        'https://photos.caryanamindia.com/1453c850-c6a4-4d46-ab36-6c4dbab27f4c-crysta1-Copy.jpg',
    ];
  };

  /* ----------------------------------------------------------------
     FETCH CARS + PRE-FETCH IMAGES
     ---------------------------------------------------------------- */
  const CACHE_KEY_PREFIX = 'cached_bidCars_dealer_';

  const fetchBidCars = async (showLoading = true) => {
    if (!dealerId) return;
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(
        `https://car01.dostenterprises.com/BeadingCarController/getByDealerID/${dealerId}`,
      );
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setBidCars([]);
        setLoading(false);
        return;
      }

      let cars: Car[] = [];
      if (Array.isArray(data)) cars = data;
      else if (data?.object)
        cars = Array.isArray(data.object) ? data.object : [data.object];
      else if (data?.data)
        cars = Array.isArray(data.data) ? data.data : [data.data];
      else if (data?.beadingCarId) cars = [data];

      cars = cars.map((car, i) => ({
        ...car,
        id: car.id || car.bidCarId || car.beadingCarId || `car-${i}`,
      }));

      // show cards immediately
      setBidCars(cars);

      // start image fetching
      setFetchingImages(new Set(cars.map(c => c.id)));

      const imagePromises = cars.map(async car => ({
        id: car.id,
        images: await fetchImagesForCar(car),
      }));

      const results = await Promise.all(imagePromises);

      // merge fetched images into the cars array and persist
      const updatedCars = cars.map(car => {
        const found = results.find(r => r.id === car.id);
        return found ? {...car, images: found.images} : car;
      });

      setBidCars(updatedCars);

      // Persist to AsyncStorage (best-effort)
      try {
        AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${dealerId}`, JSON.stringify(updatedCars)).catch(() => {});
      } catch (e) {
        // ignore
      }

      setFetchingImages(new Set());
    } catch (error) {
      setBidCars([]);
      Alert.alert('Error', 'Failed to fetch cars.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load cached cars first so the UI can show immediately, and then
  // revalidate in the background (no loading spinner when cache present).
  useEffect(() => {
    if (!dealerId) return;

    let cancelled = false;

    (async () => {
      try {
        const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${dealerId}`);
        if (!cached) {
          // no cache — show loader
          await fetchBidCars(true);
          return;
        }

        const parsed: Car[] = JSON.parse(cached);
        if (cancelled) return;

        // Display cached data immediately without showing loader
        setBidCars(parsed);

        // mark images that still need fetching
        setFetchingImages(new Set(parsed.filter(c => !c.images || c.images.length === 0).map(c => c.id)));

        // Warm native cache for any images we already have in cache
        const urlsToPrefetch: string[] = [];
        parsed.forEach(c => {
          if (c.images && Array.isArray(c.images) && c.images.length > 0) {
            urlsToPrefetch.push(...c.images);
          } else if (c.imageUrl) urlsToPrefetch.push(c.imageUrl);
        });

        if (urlsToPrefetch.length > 0) {
          // fire-and-forget prefetch
          Promise.allSettled(urlsToPrefetch.map(u => Image.prefetch(String(u)))).then(() => {
            // Images warmed — clear their ids from fetching set
            setFetchingImages(prev => {
              const next = new Set(prev);
              parsed.forEach(c => {
                if (c.images && c.images.length > 0) next.delete(c.id);
                if (c.imageUrl && !(c.images && c.images.length > 0)) next.delete(c.id);
              });
              return next;
            });
          }).catch(()=>{});
        }

        // Revalidate in background quietly (no global spinner)
        fetchBidCars(false);
      } catch (err) {
        // If cached read/parsing fails, fall back to a normal fetch
        fetchBidCars(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dealerId]);

  /* ----------------------------------------------------------------
     REFRESH ANIMATION
     ---------------------------------------------------------------- */
  const onRefreshPress = () => {
    refreshSpin.setValue(0);
    Animated.timing(refreshSpin, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.linear),
      useNativeDriver: true,
    }).start(() => refreshSpin.setValue(0));
    fetchBidCars();
  };

  const spin = refreshSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /* ----------------------------------------------------------------
     TAB / WISHLIST LOGIC
     ---------------------------------------------------------------- */
  const wishlistCount = bidCars.filter(c => isWishlisted(c.id)).length;
  const dataToShow =
    selectedTab === 'Wishlist'
      ? bidCars.filter(c => isWishlisted(c.id))
      : selectedTab === 'My Cars'
      ? bidCars
      : [];

  /* ----------------------------------------------------------------
     MODAL OPEN (images already in car.images)
     ---------------------------------------------------------------- */
  const openCarDetails = (car: Car) => {
    setSelectedCar(car);
    setModalVisible(true);
    setCarImages(car.images ?? []);
    setLoadingImages(false);
  };

  /* ----------------------------------------------------------------
     CARD RENDERER – ORIGINAL UI (no extra wrapper around image)
     ---------------------------------------------------------------- */
  const renderCarItem = ({item}: {item: Car}) => {
    const wishlisted = isWishlisted(item.id);
    const stillFetching = fetchingImages.has(item.id);

    const imageUri =
      item.images?.[0] ||
      item.imageUrl ||
      'https://photos.caryanamindia.com/1453c850-c6a4-4d46-ab36-6c4dbab27f4c-crysta1-Copy.jpg';

    return (
      <TouchableOpacity
        onPress={() => openCarDetails(item)}
        activeOpacity={0.9}>
        <Animated.View style={styles.card}>
          {/* IMAGE */}
          <Image
            source={{uri: imageUri}}
            style={styles.carImage}
            resizeMode="cover"
            onError={e =>
              console.warn('Card image error:', e.nativeEvent.error)
            }
          />

          {/* SPINNER WHILE FETCHING IMAGE URLs */}
          {stillFetching && (
            <View style={styles.imageLoader}>
              <ActivityIndicator size="small" color="#999" />
            </View>
          )}

          {/* HEART ICON */}
          <TouchableOpacity
            style={styles.heartIcon}
            onPress={e => {
              e.stopPropagation();
              toggleWishlist(item.id);
            }}>
            <Ionicons
              name={wishlisted ? 'heart' : 'heart-outline'}
              size={24}
              color={wishlisted ? '#e74c3c' : '#fff'}
            />
          </TouchableOpacity>

          {/* SCRAP BADGE */}
          {item.isScrap && (
            <View style={styles.scrapBadge}>
              <Text style={styles.scrapText}>SCRAP CAR</Text>
            </View>
          )}

          {/* DETAILS */}
          <View style={styles.cardDetails}>
            <Text style={styles.carName}>
              {item.brand || item.make} {item.model} ({item.variant})
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="#777"
              />
              <Text style={styles.locationTextSmall}>
                {item.city} • {item.registration || item.rtoCode}
              </Text>
            </View>
            <Text style={styles.carInfo}>
              {(item.kmDriven ?? item.kmsDriven ?? 0).toLocaleString()} km •{' '}
              {item.ownerSerial || item.owner} Owner • {item.fuelType}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  /* ----------------------------------------------------------------
     UI
     ---------------------------------------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.logoButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/images/caryanam.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Cars</Text>
            <Text style={styles.subTitle}>Your live auction cars</Text>
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={onRefreshPress}>
            <Animated.View
              style={[styles.refreshButton, {transform: [{rotate: spin}]}]}>
              <Text style={styles.refreshIcon}>⟳</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        {['My Cars', 'OCB nego', 'Wishlist'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab)}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
            {tab === 'Wishlist' && wishlistCount > 0 && (
              <View style={styles.wishlistBadge}>
                <Text style={styles.wishlistBadgeText}>{wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST / EMPTY / LOADING */}
      {dataToShow.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={selectedTab === 'Wishlist' ? 'heart-outline' : 'car-outline'}
            size={80}
            color="#a9acd6"
          />
          <Text style={styles.emptyTitle}>
            {selectedTab === 'Wishlist'
              ? 'No wishlisted cars'
              : 'No cars available'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedTab === 'Wishlist'
              ? 'Add cars to your wishlist by tapping the heart icon'
              : 'Start exploring and bid your favorite cars now!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={dataToShow}
          keyExtractor={i => i.id}
          renderItem={renderCarItem}
          contentContainerStyle={{padding: 12}}
        />
      )}

      {/* MODAL – FULL DETAILS */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {selectedCar ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {loadingImages ? (
                  <View style={styles.loadingImageContainer}>
                    <Text style={styles.loadingText}>Loading images...</Text>
                  </View>
                ) : carImages.length > 0 ? (
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScrollView}>
                    {carImages.map((url, idx) => (
                      <Image
                        key={idx}
                        source={{uri: url}}
                        style={styles.modalImage}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <Image
                    source={{
                      uri: 'https://photos.caryanamindia.com/1453c850-c6a4-4d46-ab36-6c4dbab27f4c-crysta1-Copy.jpg',
                    }}
                    style={styles.modalImage}
                  />
                )}

                {carImages.length > 1 && (
                  <View style={styles.imageIndicator}>
                    <Text style={styles.imageIndicatorText}>
                      Swipe to view more images ({carImages.length} photos)
                    </Text>
                  </View>
                )}

                <View style={styles.modalContent}>
                  <Text style={styles.modalYear}>2020</Text>
                  <Text style={styles.modalTitle}>
                    {selectedCar.brand || selectedCar.make} {selectedCar.model}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedCar.variant} & MANUAL
                  </Text>

                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {(
                          selectedCar.kmDriven ??
                          selectedCar.kmsDriven ??
                          0
                        ).toLocaleString()}{' '}
                        KM
                      </Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {selectedCar.ownerSerial || selectedCar.owner} OWNER
                      </Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {selectedCar.fuelType}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {selectedCar.registration || selectedCar.rtoCode}
                    </Text>
                  </View>

                  {/* KNOW YOUR CAR */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Know your Car</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <MaterialCommunityIcons
                            name="card-text"
                            size={20}
                            color="#4caf50"
                          />
                          <Text style={styles.infoLabel}>Reg Number</Text>
                          <Text style={styles.infoValue}>
                            {selectedCar.registration || selectedCar.rtoCode}
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <MaterialCommunityIcons
                            name="calendar"
                            size={20}
                            color="#4caf50"
                          />
                          <Text style={styles.infoLabel}>Make Year</Text>
                          <Text style={styles.infoValue}>2020</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <MaterialCommunityIcons
                            name="gas-station"
                            size={20}
                            color="#4caf50"
                          />
                          <Text style={styles.infoLabel}>Fuel Type</Text>
                          <Text style={styles.infoValue}>
                            {selectedCar.fuelType}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <MaterialCommunityIcons
                            name="car-shift-pattern"
                            size={20}
                            color="#4caf50"
                          />
                          <Text style={styles.infoLabel}>Transmission</Text>
                          <Text style={styles.infoValue}>Manual</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <MaterialCommunityIcons
                            name="speedometer"
                            size={20}
                            color="#4caf50"
                          />
                          <Text style={styles.infoLabel}>KM Driven</Text>
                          <Text style={styles.infoValue}>
                            {(
                              selectedCar.kmDriven ??
                              selectedCar.kmsDriven ??
                              0
                            ).toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <MaterialCommunityIcons
                            name="account"
                            size={20}
                            color="#4caf50"
                          />
                          <Text style={styles.infoLabel}>Ownership</Text>
                          <Text style={styles.infoValue}>
                            {selectedCar.ownerSerial || selectedCar.owner}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* TOP FEATURES */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Top Features</Text>
                    <View style={styles.featuresCard}>
                      <View style={styles.featureRow}>
                        <MaterialCommunityIcons
                          name="window-maximize"
                          size={24}
                          color="#333"
                        />
                        <Text style={styles.featureText}>Power Windows</Text>
                      </View>
                      <View style={styles.featureRow}>
                        <MaterialCommunityIcons
                          name="camera-rear"
                          size={24}
                          color="#333"
                        />
                        <Text style={styles.featureText}>
                          Rear Parking Camera
                        </Text>
                      </View>
                      <View style={styles.featureRow}>
                        <MaterialCommunityIcons
                          name="car-brake-abs"
                          size={24}
                          color="#333"
                        />
                        <Text style={styles.featureText}>ABS</Text>
                      </View>
                      <View style={styles.featureRow}>
                        <MaterialCommunityIcons
                          name="shield-lock"
                          size={24}
                          color="#333"
                        />
                        <Text style={styles.featureText}>
                          Child Safety Locks
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* LOCATION INFO */}
                  <View style={styles.locationInfo}>
                    <MaterialCommunityIcons
                      name="home"
                      size={18}
                      color="#4caf50"
                    />
                    <Text style={styles.locationText}>
                      Home Test Drive Available
                    </Text>
                  </View>
                  <View style={styles.locationInfo}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={18}
                      color="#4caf50"
                    />
                    <Text style={styles.locationText}>
                      Parked at: {selectedCar.city}
                    </Text>
                  </View>
                  <View style={styles.locationInfo}>
                    <MaterialCommunityIcons
                      name="file-document"
                      size={18}
                      color="#4caf50"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        const id =
                          selectedCar?.beadingCarId ||
                          selectedCar?.bidCarId ||
                          selectedCar?.id;
                        navigation.navigate('InspectionReport', {
                          beadingCarId: id,
                        });
                      }}>
                      <Text style={styles.locationText}>
                        View Inspection Report
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.modalContent}>
                <Text>No car selected</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyCarsScreen;

/* --------------------------------------------------------------
   STYLES – EXACTLY SAME AS YOUR ORIGINAL CARD
   -------------------------------------------------------------- */
const COLORS = {
  primary: '#262a4f',
  secondary: '#a9acd6',
  background: '#f5f6fa',
  white: '#FFFFFF',
  textDark: '#0F172A',
  textGray: '#374151',
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},

  /* ---------- HEADER ---------- */
  header: {
    paddingBottom: 10,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    elevation: 8,
    backgroundColor: COLORS.white,
    shadowColor: '#64748B',
    shadowOpacity: 0.12,
    shadowOffset: {width: 0, height: 6},
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  logoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {width: 40, height: 40},
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },
  subTitle: {color: COLORS.secondary, fontSize: 12, marginTop: 2},
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {fontSize: 18, fontWeight: '700', color: COLORS.primary},

  /* ---------- TABS ---------- */
  tabRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 12,
    backgroundColor: '#e9e9f2',
    borderRadius: 30,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTabButton: {backgroundColor: COLORS.primary},
  tabText: {fontSize: 14, color: COLORS.primary, fontWeight: '500'},
  activeTabText: {color: '#fff', fontWeight: '700'},
  wishlistBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  wishlistBadgeText: {color: '#fff', fontSize: 11, fontWeight: '700'},

  /* ---------- CARD – ORIGINAL DESIGN ---------- */
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#00000060',
    borderRadius: 20,
    padding: 6,
  },
  scrapBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#e63946',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scrapText: {color: '#fff', fontSize: 10, fontWeight: '600'},
  cardDetails: {padding: 10},
  carName: {fontSize: 16, fontWeight: '700', color: COLORS.primary},
  locationRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  locationTextSmall: {fontSize: 12, color: '#666', marginLeft: 4},
  carInfo: {fontSize: 12, color: '#777', marginTop: 4},

  /* ---------- EMPTY STATE ---------- */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: COLORS.primary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginTop: 4,
  },

  /* ---------- MODAL ---------- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  loadingImageContainer: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {fontSize: 14, color: '#666'},
  imageScrollView: {width: '100%', height: 240},
  modalImage: {width: width * 0.95, height: 240, resizeMode: 'cover'},
  imageIndicator: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    borderRadius: 12,
    marginTop: -30,
    marginBottom: 10,
  },
  imageIndicatorText: {color: '#fff', fontSize: 12, fontWeight: '500'},
  modalContent: {padding: 20},
  modalYear: {fontSize: 16, color: '#666', fontWeight: '500', marginBottom: 4},
  modalTitle: {fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 4},
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 16,
  },
  badgeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12},
  badge: {
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {fontSize: 13, fontWeight: '600', color: '#000'},
  sectionContainer: {marginTop: 24},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  infoCard: {backgroundColor: '#f8f8f8', borderRadius: 12, padding: 16},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {flex: 1, alignItems: 'flex-start'},
  infoLabel: {fontSize: 13, color: '#666', marginTop: 6, marginBottom: 4},
  infoValue: {fontSize: 15, fontWeight: '700', color: '#000'},
  featuresCard: {backgroundColor: '#f8f8f8', borderRadius: 12, padding: 16},
  featureRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  featureText: {fontSize: 16, fontWeight: '600', color: '#000', marginLeft: 12},
  locationInfo: {flexDirection: 'row', alignItems: 'center', marginTop: 12},
  locationText: {fontSize: 14, color: '#333', marginLeft: 8, fontWeight: '500'},
});
