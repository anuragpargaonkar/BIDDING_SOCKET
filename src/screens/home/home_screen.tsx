import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useWebSocket} from '../../utility/WebSocketConnection';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {useWishlist} from '../../context/WishlistContext';
import {styles} from './HomeScreen.styles';
// IMPORT BASE_URL FROM YOUR CONFIG
import {BASE_URL} from '../../utility/serverConfig';

interface Car {
  id: string;
  imageUrl?: string;
  isScrap?: boolean;
  city?: string;
  rtoCode?: string;
  make?: string;
  model?: string;
  variant?: string;
  engine?: string;
  kmsDriven?: number;
  owner?: string;
  fuelType?: string;
  remainingTime?: string;
  currentBid?: number;
  auctionStartTime?: string | number;
  auctionEndTime?: string | number;
  startTime?: string | number;
  endTime?: string | number;
  createdAt?: string | number;
  beadingCarId?: string;
  bidCarId?: string;
}

interface LivePriceData {
  price: number;
  remainingTime?: string;
  timeLeft?: string;
  auctionStartTime?: string;
  auctionEndTime?: string;
}

interface Notification {
  id: string;
  carId: string;
  message: string;
  type: 'bid' | 'outbid' | 'won' | 'time';
  timestamp: number;
}

type RootStackParamList = {
  Login: undefined;
  Home: {token: string; userId: string; userInfo: any};
  ForgotPassword: undefined;
  InspectionReport: {beadingCarId: string};
};

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';
const AUCTION_DURATION_MS = 30 * 60 * 1000;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {wishlist, toggleWishlist, isWishlisted} = useWishlist();
  const [activeTab, setActiveTab] = useState<'LIVE' | 'OCB'>('LIVE');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [biddingStates, setBiddingStates] = useState<{[key: string]: boolean}>(
    {},
  );
  const [livePrices, setLivePrices] = useState<{[key: string]: LivePriceData}>(
    {},
  );
  const [carImageData, setCarImageData] = useState<{[key: string]: string}>({});
  const [carDetailsData, setCarDetailsData] = useState<{[key: string]: any}>(
    {},
  );
  const [carAuctionTimes, setCarAuctionTimes] = useState<{
    [key: string]: {start: number; end: number};
  }>({});
  const [countdownTimers, setCountdownTimers] = useState<{
    [key: string]: string;
  }>({});
  const [filteredLiveCars, setFilteredLiveCars] = useState<Car[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [carDetailsModalVisible, setCarDetailsModalVisible] = useState(false);
  const [selectedCarForDetails, setSelectedCarForDetails] =
    useState<Car | null>(null);
  const [selectedCar, setSelectedCar] = useState<{
    bidCarId: string;
    price: number;
  } | null>(null);
  const [bidAmounts, setBidAmounts] = useState<{[bidCarId: string]: string}>(
    {},
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(true);

  const [bidModalPriceCache, setBidModalPriceCache] = useState<{
    [bidCarId: string]: number;
  }>({});

  const bidInitializedRef = useRef<string | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const notificationAnim = useRef(new Animated.Value(-100)).current;
  const hasRequestedLiveCarsRef = useRef(false);
  const prevFilteredLiveCarsLengthRef = useRef(0);
  
  // Ref for polling to access latest cars without resetting interval
  const filteredLiveCarsRef = useRef<Car[]>([]);

  // NEW: fetch lock set to prevent duplicate concurrent fetches
  const fetchingRef = useRef<Set<string>>(new Set());

  const route = useRoute<HomeScreenRouteProp>();
  const routeParams = route.params;
  const {
    liveCars,
    getLiveCars,
    connectWebSocket,
    isConnected,
    connectionError,
    connectionStatus,
  } = useWebSocket();

  // === NOTIFICATION SYSTEM ===
  /* const showNotification = useCallback(
    (car: Car, type: 'bid' | 'outbid' | 'won' | 'time') => {
      const carName = `${car.make || 'Toyota'} ${car.model || 'Innova'} ${
        car.variant || '2.8 ZX'
      }`;
      let message = '';
      switch (type) {
        case 'bid':
          message = `You placed a bid on ${carName} at ₹${(
            livePrices[car.id]?.price || 0
          ).toLocaleString()}`;
          break;
        case 'outbid':
          message = `You've been outbid on ${carName}! New bid: ₹${(
            (livePrices[car.id]?.price || 0) + 5000
          ).toLocaleString()}`;
          break;
        case 'won':
          message = `Congratulations! You won ${carName} for ₹${(
            livePrices[car.id]?.price || 0
          ).toLocaleString()}`;
          break;
        case 'time':
          message = `Only 5 minutes left for ${carName}!`;
          break;
      }
      const newNotif: Notification = {
        id: `${car.id}-${Date.now()}`,
        carId: car.id,
        message,
        type,
        timestamp: Date.now(),
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
      notificationAnim.setValue(-100);
      Animated.timing(notificationAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(notificationAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        });
      }, 4000);
      // }, [livePrices, notificationAnim]);
    },
    [livePrices, notificationAnim],
  );

  const handleNotificationClick = () => {
    if (filteredLiveCars.length === 0) {
      Alert.alert('No Cars', 'No live cars to show demo notifications.');
      return;
    }
    const randomCar =
      filteredLiveCars[Math.floor(Math.random() * filteredLiveCars.length)];
    const types: Array<'bid' | 'outbid' | 'won' | 'time'> = [
      'bid',
      'outbid',
      'time',
      'won',
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];
    showNotification(randomCar, randomType);
  };
  */

  // === HELPER FUNCTIONS ===
  const getCurrentDateTimeForAPI = useCallback((): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }, []);

  const parseDateTime = useCallback((dateTime: any): number | null => {
    if (!dateTime) return null;
    try {
      if (typeof dateTime === 'number') return dateTime;
      if (typeof dateTime === 'string') {
        const parsed = new Date(dateTime).getTime();
        if (!isNaN(parsed)) return parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  const formatCountdown = useCallback((milliseconds: number): string => {
    if (milliseconds <= 0) return '00:00:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(seconds).padStart(2, '0')}`;
  }, []);

  // Update ref whenever state changes
  useEffect(() => {
    filteredLiveCarsRef.current = filteredLiveCars;
  }, [filteredLiveCars]);

  // === IMMEDIATE CAR DISPLAY (FALLBACK) ===
  useEffect(() => {
    // Set filteredLiveCars immediately when liveCars changes, but don't clear on empty
    if (liveCars.length > 0) {
      setFilteredLiveCars(liveCars);

      // ✅ NEW: Sync WebSocket bid updates to livePrices state instantly
      // This ensures that when a socket update comes in, the pricing logic everywhere (Modal, Card) sees it
      setLivePrices(prev => {
        const next = {...prev};
        let changed = false;
        liveCars.forEach(car => {
          const id = car.id;
          const bidId = car.bidCarId;
          const currentBid = car.currentBid || 0;

          // Update if socket has a newer/higher price than what we have in cache
          if (currentBid > 0) {
            // Update for main ID
            if (!next[id] || currentBid > next[id].price) {
              next[id] = {
                ...(next[id] || {}),
                price: currentBid,
                timeLeft: next[id]?.timeLeft || '',
              };
              changed = true;
            }
            // Update for bidId if it exists and is different
            if (
              bidId &&
              bidId !== id &&
              (!next[bidId] || currentBid > next[bidId].price)
            ) {
              next[bidId] = {
                ...(next[bidId] || {}),
                price: currentBid,
                timeLeft: next[bidId]?.timeLeft || '',
              };
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
      
      // ✅ Trigger an immediate refresh of prices from API to be safe
      // This ensures if socket data was slightly stale, we correct it instantly
      setTimeout(() => {
         const currentCars = filteredLiveCarsRef.current;
         if (currentCars.length > 0) {
            currentCars.forEach(car => {
               if (car.id) fetchLivePrice(car.id);
            });
         }
      }, 500);
    }
  }, [liveCars]);

  // === AUTOMATIC PRICE POLLING (3 Seconds) ===
  useEffect(() => {
    const interval = setInterval(() => {
      const currentCars = filteredLiveCarsRef.current;
      if (currentCars.length > 0) {
        // Fetch fresh prices for all visible cars
        currentCars.forEach(car => {
          if (car.id) {
            fetchLivePrice(car.id);
          }
        });
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, []); // Run once on mount

  // === AUCTION TIME LOGIC ===
  useEffect(() => {
    const now = Date.now();
    const newAuctionTimes: {[key: string]: {start: number; end: number}} = {
      ...carAuctionTimes,
    };
    let hasNewCars = false;
    liveCars.forEach(car => {
      if (car.id && !carAuctionTimes[car.id]) {
        let startTime =
          parseDateTime(car.auctionStartTime) ||
          parseDateTime(car.startTime) ||
          parseDateTime(car.createdAt) ||
          now;
        let endTime =
          parseDateTime(car.auctionEndTime) ||
          parseDateTime(car.endTime) ||
          startTime + AUCTION_DURATION_MS;

        // Ensure endTime is always in the future
        if (endTime <= now) {
          endTime = now + AUCTION_DURATION_MS; // Set to 30 minutes from now
          startTime = now;
        }

        newAuctionTimes[car.id] = {start: startTime, end: endTime};
        hasNewCars = true;
      }
    });
    if (hasNewCars) {
      setCarAuctionTimes(newAuctionTimes);
    }
  }, [liveCars, parseDateTime]);

  useEffect(() => {
    if (Object.keys(carAuctionTimes).length === 0) {
      return;
    }
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    countdownInterval.current = setInterval(() => {
      const now = Date.now();
      const newTimers: {[key: string]: string} = {};
      const activeCars: Car[] = [];
      const expiredCarIds: string[] = [];
      liveCars.forEach(car => {
        if (!car.id) {
          return;
        }
        const auctionTime = carAuctionTimes[car.id];
        if (!auctionTime) {
          // Keep cars visible even if they don't have auction times set yet
          activeCars.push(car);
          newTimers[car.id] = '00:30:00'; // Default timer
          return;
        }
        const remainingMs = auctionTime.end - now;
        if (remainingMs > 0) {
          newTimers[car.id] = formatCountdown(remainingMs);
          activeCars.push(car);
        } else {
          expiredCarIds.push(car.id);
        }
      });
      setCountdownTimers(newTimers);
      setFilteredLiveCars(activeCars);
      if (expiredCarIds.length > 0) {
        setCarAuctionTimes(prev => {
          const updated = {...prev};
          const updatedLivePrices = {...livePrices}; // Also cleanup old price data
          expiredCarIds.forEach(id => {
            delete updated[id];
            delete updatedLivePrices[id];
          });
          setLivePrices(updatedLivePrices);
          return updated;
        });
      }
    }, 1000);
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [liveCars, carAuctionTimes, formatCountdown]);

  // === AUTH & WEBSOCKET ===
  useEffect(() => {
    loadStoredAuthData();
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  const loadStoredAuthData = async () => {
    try {
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_ID_KEY),
      ]);
      if (token) setStoredToken(token);
      if (userId) setStoredUserId(userId);
    } catch (error) {}
  };

  const token = routeParams?.token || storedToken;
  const userId = routeParams?.userId || storedUserId;
  const userInfo = routeParams?.userInfo;

  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      connectWebSocket();
    }
  }, [connectionStatus]);
  // }, []);

  useEffect(() => {
    if (connectionStatus === 'connected' || connectionStatus === 'error') {
      setIsLoading(false);
    } else if (connectionStatus === 'connecting') {
      setIsLoading(true);
    }
    // }, [connectionStatus]);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isConnected) {
        getLiveCars();
        // Also force a price update
        refreshAllCarPrices();
      }
      else connectWebSocket();
    } catch (error) {
    } finally {
      setTimeout(() => setRefreshing(false), 2000);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    connectWebSocket();
  };

  // === API CALLS ===
  const fetchLivePrice = async (
    bidCarId: string,
  ): Promise<LivePriceData | null> => {
    try {
      // UPDATED: Use BASE_URL
      const livePriceUrl = `${BASE_URL}/Bid/getliveValue?bidCarId=${bidCarId}`;
      const response = await fetch(livePriceUrl);
      const data = await response.json();
      const price = data?.object?.price ?? 0;
      const livePriceData = {
        price,
        remainingTime: data?.object?.remainingTime || '',
        timeLeft: data?.object?.timeLeft || '',
        auctionStartTime:
          data?.object?.auctionStartTime || data?.object?.startTime,
        auctionEndTime: data?.object?.auctionEndTime || data?.object?.endTime,
      };
      setLivePrices(prev => ({...prev, [bidCarId]: livePriceData}));
      return livePriceData;
    } catch (error) {
      return null;
    }
  };

  const refreshAllCarPrices = async () => {
    const promises = filteredLiveCars.map(car => {
      if (car.id) return fetchLivePrice(car.id);
      return Promise.resolve(null);
    });
    await Promise.all(promises);
  };

  const fetchCarImageAndDetails = async (
    beadingCarId: string,
    bidCarId: string,
  ) => {
    // NEW: prevent concurrent duplicate fetches for same car
    const key = `${beadingCarId}-${bidCarId}`;
    if (fetchingRef.current.has(key)) {
      // already fetching this car
      return;
    }
    fetchingRef.current.add(key);

    try {
      // UPDATED: Use BASE_URL
      const imageUrl = `${BASE_URL}/uploadFileBidCar/getByBidCarID?beadingCarId=${beadingCarId}`;
      const imageResponse = await fetch(imageUrl);
      const imageText = await imageResponse.text();
      let imageDataArray: any[] = [];
      try {
        const parsed = JSON.parse(imageText);
        if (Array.isArray(parsed)) {
          imageDataArray = parsed;
        } else if (Array.isArray(parsed?.object)) {
          imageDataArray = parsed.object;
        } else if (Array.isArray(parsed?.data)) {
          imageDataArray = parsed.data;
        }
      } catch (err) {}
      const coverImageData = imageDataArray.find(
        item =>
          (item.documentType?.toLowerCase() === 'coverimage' ||
            item.doctype?.toLowerCase() === 'coverimage' ||
            item.subtype?.toLowerCase() === 'coverimage') &&
          String(item.beadingCarId) === String(beadingCarId),
      );
      // UPDATED: Use BASE_URL
      const carIdUrl = `${BASE_URL}/BeadingCarController/getByBidCarId/${bidCarId}`;
      const carIdResponse = await fetch(carIdUrl);
      const carIdText = await carIdResponse.text();
      let carIdData: any = null;
      try {
        carIdData = carIdText ? JSON.parse(carIdText) : null;
      } catch (e) {}
      const imageLink = coverImageData?.documentLink;
      if (imageLink) {
        setCarImageData(prev => ({...prev, [beadingCarId]: imageLink}));
      }
      if (carIdData) {
        setCarDetailsData(prev => ({...prev, [bidCarId]: carIdData || {}}));
      }
      // Fetch live price only if not already cached
      if (!livePrices[bidCarId]) {
        fetchLivePrice(bidCarId);
      }
    } catch (error: any) {
      // optional: set some error state / logging
      console.error('Error fetching car image/details', error);
    } finally {
      // release lock
      fetchingRef.current.delete(key);
    }
  };

  const triggerFetchCarData = () => {
    console.log('triggerFetchCarData called1');
    console.log('filteredLiveCars:', filteredLiveCars); // Check content here
    filteredLiveCars.forEach(car => {
      const beadingId = car.beadingCarId || car.id;
      const bidId = car.bidCarId || car.id;
      console.log(
        `2.Checking car - Beading ID: ${beadingId}, Bid ID: ${bidId}`,
      );
      if (!carDetailsData[bidId] || !carImageData[beadingId]) {
        console.log(
          `3.Fetching data for car - Beading ID: ${beadingId}, Bid ID: ${bidId}`,
        );
        fetchCarImageAndDetails(beadingId, bidId);
      }
    });
  };

  useEffect(() => {
    // Check if length is different from previous
    if (filteredLiveCars.length === prevFilteredLiveCarsLengthRef.current) {
      return;
    }

    filteredLiveCars.forEach(car => {
      const beadingId = car.beadingCarId || car.id;
      const bidId = car.bidCarId || car.id;

      if (!carDetailsData[bidId] || !carImageData[beadingId]) {
        fetchCarImageAndDetails(beadingId, bidId);
      }
    });

    // Update previous length
    prevFilteredLiveCarsLengthRef.current = filteredLiveCars.length;
  }, [filteredLiveCars]);

  // === MODAL HANDLERS ===
  const openCarDetailsModal = async (car: Car) => {
    setSelectedCarForDetails(car);
    setCarDetailsModalVisible(true);
    // ✅ NEW: Fetch latest price immediately on view
    if (car.id) {
      await fetchLivePrice(car.id);
    }
  };

  const openBidModal = async (bidCarId: string) => {
    try {
      const priceData = await fetchLivePrice(bidCarId);
      const currentPrice = priceData?.price ?? 0;

      setBidModalPriceCache(prev => ({...prev, [bidCarId]: currentPrice}));
      setSelectedCar({bidCarId, price: currentPrice});
      const initialBid = (currentPrice + 2000).toString();
      setBidAmounts(prev => ({...prev, [bidCarId]: initialBid}));
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Could not load current price. Try again.');
    }
  };

  useEffect(() => {
    if (modalVisible && selectedCar) {
      const livePriceData = livePrices[selectedCar.bidCarId];
      const currentPrice = livePriceData?.price ?? 0;
      if (currentPrice > 0 && selectedCar.price !== currentPrice) {
        setSelectedCar(prev => (prev ? {...prev, price: currentPrice} : null));
      }
    }

    triggerFetchCarData();
  }, [modalVisible, livePrices[selectedCar?.bidCarId || '']?.price]);

  useEffect(() => {
    if (!modalVisible) {
      bidInitializedRef.current = null;
      if (selectedCar) {
        setBidModalPriceCache(prev => {
          const updated = {...prev};
          delete updated[selectedCar.bidCarId];
          return updated;
        });
      }
    }
  }, [modalVisible]);

  const handleBidInputChange = (text: string) => {
    if (selectedCar) {
      setBidAmounts(prev => ({...prev, [selectedCar.bidCarId]: text}));
    }
  };

  const handleDecreaseBid = () => {
    if (selectedCar) {
      const cachedPrice =
        bidModalPriceCache[selectedCar.bidCarId] ?? selectedCar.price ?? 0;
      const current =
        parseInt(bidAmounts[selectedCar.bidCarId] || '0') || cachedPrice + 2000;
      if (current - 2000 > cachedPrice) {
        setBidAmounts(prev => ({
          ...prev,
          [selectedCar.bidCarId]: (current - 2000).toString(),
        }));
      }
    }
  };

  const handleIncreaseBid = () => {
    if (selectedCar) {
      const current =
        parseInt(bidAmounts[selectedCar.bidCarId] || '0') ||
        selectedCar.price + 2000;
      setBidAmounts(prev => ({
        ...prev,
        [selectedCar.bidCarId]: (current + 2000).toString(),
      }));
    }
  };

  const handlePlaceBid = async () => {
    if (!token || !userId || !selectedCar) {
      Alert.alert('Error', 'Please login to place a bid.');
      return;
    }

    const cachedPrice = bidModalPriceCache[selectedCar.bidCarId] ?? 0;
    const bidValue = parseInt(bidAmounts[selectedCar.bidCarId] || '0');

    if (isNaN(bidValue) || bidValue <= cachedPrice) {
      Alert.alert(
        'Invalid Bid',
        `Bid amount (₹${bidValue}) must be greater than current bid (₹${cachedPrice}).`,
      );
      return;
    }

    setBiddingStates(prev => ({...prev, [selectedCar.bidCarId]: true}));

    try {
      const currentDateTime = getCurrentDateTimeForAPI();
      const requestBody = {
        userId: Number(userId),
        bidCarId: Number(selectedCar.bidCarId),
        dateTime: currentDateTime,
        amount: bidValue,
      };

      // UPDATED: Use BASE_URL
      const bidUrl = `${BASE_URL}/Bid/placeBid?bidCarId=${selectedCar.bidCarId}`;
      const response = await fetch(bidUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      let data = null;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {}

      if (response.ok) {
        setModalVisible(false);
        Alert.alert(
          'Bid Placed Successfully!',
          `Your bid of ₹${bidValue.toLocaleString()} has been placed.`,
          [
            {
              text: 'OK',
              onPress: async () => {
                await refreshAllCarPrices();
                getLiveCars();
                const car = filteredLiveCars.find(
                  c => c.id === selectedCar.bidCarId,
                );
                // ✅ TRIGGER NOTIFICATION
                // if (car) showNotification(car, 'bid');
              },
            },
          ],
        );
      } else {
        let errorMessage = 'Server Error';
        let debugInfo = 'Unable to place bid. Please try again.';
        Alert.alert(errorMessage, debugInfo, [
          {
            text: 'Refresh & Retry',
            onPress: async () => {
              await refreshAllCarPrices();
              getLiveCars();
            },
          },
          {text: 'Close', style: 'cancel'},
        ]);
      }
    } catch (error: any) {
      Alert.alert('Network Error', 'Unable to connect to server.', [
        {text: 'Retry', onPress: () => handlePlaceBid()},
        {text: 'Close', style: 'cancel'},
      ]);
    } finally {
      setBiddingStates(prev => ({...prev, [selectedCar.bidCarId]: false}));
    }
  };

  // === RENDER FUNCTIONS ===
  const renderCarCard = (car: Car, idx: number) => {
    const carId = car.id || `car-${idx}`;
    const beadingId = car.beadingCarId || carId;
    const bidId = car.bidCarId || carId;
    const imageUrl =
      carImageData[carId] ||
      carImageData[beadingId] ||
      carImageData[bidId] ||
      car.imageUrl ||
      'https://photos.caryanamindia.com/1453c850-c6a4-4d46-ab36-6c4dbab27f4c-crysta%201%20-%20Copy.jpg';
    // Look up carDetails using bidId first (as that's what we store it with), then carId
    const carDetails = carDetailsData[bidId] || carDetailsData[carId];
    // Look up live price using bidId first (as that's what we store it with), then carId
    const livePriceData = livePrices[bidId] || livePrices[carId];

    // ✅ UPDATED PRICE LOGIC: Takes the highest of API Price or WebSocket Price
    const apiPrice = livePriceData?.price ?? 0;
    const socketPrice = car.currentBid ?? 0;
    const detailsPrice = carDetails?.price ?? 0;
    const currentBid = Math.max(apiPrice, socketPrice, detailsPrice);

    const timeLeft = countdownTimers[carId] || '00:30:00';
    const wishlisted = isWishlisted(carId);

    return (
      <TouchableOpacity
        key={carId}
        style={styles.card}
        activeOpacity={0.95}
        onPress={() => openCarDetailsModal(car)}>
        <Image source={{uri: imageUrl}} style={styles.carImage} />
        {/* <TouchableOpacity
          style={styles.heartIcon}
          onPress={e => {
            e.stopPropagation();
            toggleWishlist(carId);
          }}>
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={24}
            color={wishlisted ? '#e74c3c' : '#fff'}
          />
        </TouchableOpacity> */}
        {car.isScrap && (
          <View style={styles.scrapBadge}>
            <Text style={styles.scrapText}>SCRAP CAR</Text>
          </View>
        )}
        <View style={styles.cardDetails}>
          <Text style={styles.carName}>
            {carDetails?.brand || car.make || 'Car'}{' '}
            {carDetails?.model || car.model || 'Model'} (
            {(carDetails?.variant || car.variant || 'Variant')?.trim()})
          </Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#a9acd6"
            />
            <Text style={styles.locationTextSmall}>
              {carDetails?.city || car.city || 'Unknown'} •{' '}
              {carDetails?.registration || car.rtoCode || 'N/A'}
            </Text>
          </View>
          <Text style={styles.carInfo}>
            {(carDetails?.kmDriven || car.kmsDriven || 0).toLocaleString()} km •{' '}
            {carDetails?.ownerSerial || car.owner || '1st'} Owner •{' '}
            {carDetails?.fuelType || car.fuelType || 'Petrol'}
          </Text>
          <View style={styles.bidSection}>
            <View>
              <Text style={styles.highestBid}>
                {livePriceData ? 'Live Bid 🔴' : 'Highest Bid'}
              </Text>
              <Text style={styles.bidAmount}>
                ₹{currentBid.toLocaleString()}
              </Text>
            </View>
            <View style={styles.timerContainer}>
              <Text style={styles.timeRemaining}>🕒 Time Left</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{timeLeft}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              openCarDetailsModal(car);
            }}
            activeOpacity={0.8}>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>VIEW</Text>
              <Ionicons
                name="eye"
                size={16}
                color="#fff"
                style={{marginLeft: 6}}
              />
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTab = (tab: 'LIVE' | 'OCB', count: number) => {
    const active = activeTab === tab;
    return (
      <TouchableOpacity
        style={styles.tabContainer}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.8}>
        <Text style={[styles.tabText, active && styles.activeTabText]}>
          {tab}
        </Text>
        <View
          style={[styles.tabCountBadge, active && styles.activeTabCountBadge]}>
          <Text style={[styles.tabCount, active && styles.activeTabCountText]}>
            {count}
          </Text>
        </View>
        {active && <View style={styles.activeTabIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderCarDetailsModal = () => {
    if (!selectedCarForDetails) return null;
    const carId = selectedCarForDetails.id;
    const beadingId = selectedCarForDetails.beadingCarId || carId;
    const bidId = selectedCarForDetails.bidCarId || carId;
    const imageUrl =
      carImageData[carId] ||
      carImageData[beadingId] ||
      carImageData[bidId] ||
      selectedCarForDetails.imageUrl ||
      'https://photos.caryanamindia.com/1453c850-c6a4-4d46-ab36-6c4dbab27f4c-crysta%201%20-%20Copy.jpg';

    // ✅ NEW: Always look up the latest live car data from the list
    // This ensures that even if selectedCarForDetails is stale, we get the fresh price/data
    const liveCar =
      filteredLiveCars.find(c => c.id === carId) || selectedCarForDetails;

    const carDetails = carDetailsData[carId] || carDetailsData[bidId];
    const livePriceData = livePrices[carId];

    // ✅ UPDATED PRICE LOGIC IN MODAL
    // Uses livePrices (synced with socket) OR the liveCar object from the list
    const apiPrice = livePriceData?.price ?? 0;
    const socketPrice = liveCar.currentBid ?? 0;
    const detailsPrice = carDetails?.price ?? 0;
    const currentBid = Math.max(apiPrice, socketPrice, detailsPrice);

    const timeLeft = countdownTimers[carId] || '23:24:00';

    const brand = carDetails?.brand || selectedCarForDetails.make || '2021';
    const model =
      carDetails?.model || selectedCarForDetails.model || 'FORCE ONE';
    const variant =
      carDetails?.variant ||
      selectedCarForDetails.variant ||
      'BLUE & AUTOMATIC';
    const kmDriven =
      carDetails?.kmDriven || selectedCarForDetails.kmsDriven || 50000;
    const ownerSerial =
      carDetails?.ownerSerial || selectedCarForDetails.owner || '2ND OWNER';
    const fuelType =
      carDetails?.fuelType || selectedCarForDetails.fuelType || 'DIESEL';
    const registration =
      carDetails?.registration || selectedCarForDetails.rtoCode || 'MH-12';
    const city =
      carDetails?.city || selectedCarForDetails.city || 'Kharadi, Kharadi';
    const transmission = carDetails?.transmission || 'Automatic';
    const makeYear = carDetails?.makeYear || carDetails?.year || '2021';
    const insuranceType = carDetails?.insuranceType || 'Third Party';

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={carDetailsModalVisible}
        onRequestClose={() => setCarDetailsModalVisible(false)}>
        <SafeAreaView style={styles.detailsModalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <View style={styles.detailsHeader}>
            <TouchableOpacity
              onPress={() => setCarDetailsModalVisible(false)}
              style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#262a4f" />
            </TouchableOpacity>
            <Text style={styles.detailsHeaderTitle}>Car Details</Text>
            {/* <TouchableOpacity
              onPress={() => toggleWishlist(carId)}
              style={styles.headerHeartIcon}>
              <Ionicons
                name={isWishlisted(carId) ? 'heart' : 'heart-outline'}
                size={24}
                color={isWishlisted(carId) ? '#e74c3c' : '#262a4f'}
              />
            </TouchableOpacity> */}
          </View>

          <ScrollView
            style={styles.detailsScrollView}
            showsVerticalScrollIndicator={false}>
            <View style={styles.detailsImageContainer}>
              <Image source={{uri: imageUrl}} style={styles.detailsCarImage} />
              {selectedCarForDetails.isScrap && (
                <View style={styles.detailsScrapBadge}>
                  <Text style={styles.scrapText}>SCRAP CAR</Text>
                </View>
              )}
            </View>
            <View style={styles.detailsTitleSection}>
              <Text style={styles.detailsCarTitle}>
                {makeYear} {model.toUpperCase()}
              </Text>
              <Text style={styles.detailsCarSubtitle}>{variant}</Text>
              <View style={styles.quickInfoBadges}>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>
                    {kmDriven.toLocaleString()} KM
                  </Text>
                </View>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>{ownerSerial}</Text>
                </View>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>{fuelType}</Text>
                </View>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>{registration}</Text>
                </View>
              </View>
              <View style={styles.locationTestDriveRow}>
                <View style={styles.locationInfoBox}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color="#10B981"
                  />
                  <Text style={styles.locationInfoText}>Parked at: {city}</Text>
                </View>
              </View>
              <View style={styles.testDriveAvailable}>
                <Ionicons name="home" size={18} color="#10B981" />
                <Text style={styles.testDriveText}>
                  Home Test Drive Available
                </Text>
              </View>

              <TouchableOpacity
                style={styles.inspectionReportButton}
                onPress={() => {
                  setCarDetailsModalVisible(false);
                  navigation.navigate('InspectionReport', {
                    beadingCarId: selectedCarForDetails.beadingCarId,
                  });
                }}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={20}
                  color="#a9acd6"
                />
                <Text style={styles.inspectionReportText}>
                  View Inspection Report
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceTimerSection}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>
                  Amount: ₹{currentBid.toLocaleString()}
                </Text>
                <Text style={styles.priceSubLabel}>FIXED ROAD PRICE</Text>
                <Text style={styles.timerLabelBig}>{timeLeft}</Text>
              </View>
            </View>
            <View style={styles.knowYourCarSection}>
              <Text style={styles.sectionTitle}>Know your Car</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <MaterialCommunityIcons
                      name="card-account-details"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.detailLabel}>Reg Number</Text>
                  <Text style={styles.detailValue}>{registration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.detailLabel}>Make Year</Text>
                  <Text style={styles.detailValue}>{makeYear}</Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <MaterialCommunityIcons
                      name="gas-station"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.detailLabel}>Fuel Type</Text>
                  <Text style={styles.detailValue}>{fuelType}</Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <MaterialCommunityIcons
                      name="cog"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.detailLabel}>Transmission</Text>
                  <Text style={styles.detailValue}>{transmission}</Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <MaterialCommunityIcons
                      name="car"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.detailLabel}>KM Driven</Text>
                  <Text style={styles.detailValue}>
                    {kmDriven.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.detailLabel}>Ownership</Text>
                  <Text style={styles.detailValue}>
                    {ownerSerial === '2ND OWNER' ? '2' : ownerSerial}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.detailLabel}>Insurance Type</Text>
                  <Text style={styles.detailValue}>{insuranceType}</Text>
                </View>
              </View>
            </View>
            <View style={styles.topFeaturesSection}>
              <Text style={styles.sectionTitle}>Top Features</Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="bluetooth"
                    size={28}
                    color="#262a4f"
                  />
                  <Text style={styles.featureText}>
                    Bluetooth Compatibility
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="air-conditioner"
                    size={28}
                    color="#262a4f"
                  />
                  <Text style={styles.featureText}>Air Conditioning</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="window-closed"
                    size={28}
                    color="#262a4f"
                  />
                  <Text style={styles.featureText}>Power Windows</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="camera-rear"
                    size={28}
                    color="#262a4f"
                  />
                  <Text style={styles.featureText}>Rear Parking Camera</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="car-brake-abs"
                    size={28}
                    color="#262a4f"
                  />
                  <Text style={styles.featureText}>ABS</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="airbag"
                    size={28}
                    color="#262a4f"
                  />
                  <Text style={styles.featureText}>Air Bag</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="power"
                    size={28}
                    color="#262a4f"
                  />
                  <Text style={styles.featureText}>Button Start</Text>
                </View>
              </View>
            </View>
            <View style={{height: 120}} />
          </ScrollView>

          <View style={styles.bottomActionBar}>
            <TouchableOpacity
              style={styles.placeBidButtonLarge}
              onPress={() => {
                setCarDetailsModalVisible(false);
                setTimeout(() => openBidModal(carId), 300);
              }}
              activeOpacity={0.8}>
              <Text style={styles.placeBidButtonText}>PLACE BID</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.interestedButton}
              activeOpacity={0.8}>
              <Text style={styles.interestedButtonText}>I am Interested</Text>
            </TouchableOpacity> */}
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  // === MAIN RENDER ===
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#262a4f" />
      <LinearGradient
        colors={['#262a4f', '#353a65', '#262a4f']}
        style={styles.gradientBackground}>
        {/* {notifications.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleNotificationClick}
            style={[
              styles.notificationBanner,
              {
                backgroundColor:
                  notifications[0].type === 'bid'
                    ? '#10B981'
                    : notifications[0].type === 'outbid'
                    ? '#EF4444'
                    : notifications[0].type === 'won'
                    ? '#8B5CF6'
                    : '#F59E0B',
                transform: [{translateY: notificationAnim}],
              },
            ]}>
            <MaterialCommunityIcons
              name={
                notifications[0].type === 'bid'
                  ? 'check-circle'
                  : notifications[0].type === 'outbid'
                  ? 'alert'
                  : notifications[0].type === 'won'
                  ? 'trophy'
                  : 'clock-alert'
              }
              size={20}
              color="#fff"
              style={{marginRight: 8}}
            />
            <Text style={styles.notificationText}>
              {notifications[0].message}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color="#fff"
              style={{marginLeft: 8}}
            />
          </TouchableOpacity>
        )} */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.profileSection}>
              {/* LOGO */}
              <Image
                source={require('../../assets/images/logo1.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity
              style={styles.notificationIcon}
              // onPress={handleNotificationClick}
              >
              <Ionicons
                name="notifications-outline"
                size={26}
                color="#a9acd6"
              />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#262a4f" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search auction"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
        <View style={styles.whiteContentArea}>
          <ScrollView
            style={styles.scrollViewContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#a9acd6']}
              />
            }
            showsVerticalScrollIndicator={false}>
            <View style={styles.tabs}>
              {renderTab('LIVE', filteredLiveCars.length)}
              {renderTab('OCB', 0)}
            </View>
            {/* <View style={styles.banner}>
              <View style={{flex: 1}}>
                <View style={styles.newLaunchBadge}>
                  <Text style={styles.bannerTitle}>New launch</Text>
                </View>
                <Text style={styles.bannerDesc}>
                  Get used car loan for your customers{'\n'}Instant valuation |
                  100% digital
                </Text>
                <TouchableOpacity activeOpacity={0.8}>
                  <View style={styles.exploreBtn}>
                    <Text style={styles.exploreText}>Explore</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <Image
                source={require('../../assets/images/car3.png')}
                style={styles.bannerImage}
              />
            </View> */}
            <View style={styles.liveCarsHeaderContainer}>
              <View>
                <Text style={styles.liveCarsHeader}>Live Cars</Text>
                {filteredLiveCars.length > 0 && (
                  <Text style={styles.liveCarsSubtext}>
                    {filteredLiveCars.length} cars available
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={onRefresh} activeOpacity={0.7}>
                <View style={styles.refreshGradient}>
                  <Ionicons name="refresh" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#a9acd6" />
                <Text style={styles.loadingText}>Loading cars...</Text>
              </View>
            ) : filteredLiveCars.length > 0 ? (
              filteredLiveCars.map(renderCarCard)
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="car-off"
                  size={60}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyText}>No live cars available</Text>
                {/* <TouchableOpacity onPress={handleRetry} activeOpacity={0.8}>
                  <View style={styles.retryButton}>
                    <Text style={styles.retryText}>Retry</Text>
                  </View>
                </TouchableOpacity> */}
              </View>
            )}
            <View style={{height: 100}} />
          </ScrollView>
        </View>
      </LinearGradient>

      {/* BID MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Your Bid</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Your Bid Amount</Text>
              <View style={styles.bidInputContainer}>
                <TouchableOpacity onPress={handleDecreaseBid}>
                  <View style={styles.adjustButtonMinus}>
                    <Text style={styles.adjustButtonText}>-</Text>
                  </View>
                </TouchableOpacity>
                <TextInput
                  style={styles.bidInput}
                  value={selectedCar ? bidAmounts[selectedCar.bidCarId] : ''}
                  onChangeText={handleBidInputChange}
                  keyboardType="numeric"
                  placeholder="Enter amount"
                />
                <TouchableOpacity onPress={handleIncreaseBid}>
                  <View style={styles.adjustButtonPlus}>
                    <Text style={styles.adjustButtonText}>+</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePlaceBid}
                disabled={biddingStates[selectedCar?.bidCarId || '']}>
                <View style={styles.confirmButton}>
                  {biddingStates[selectedCar?.bidCarId || ''] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>CONFIRM BID</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CAR DETAILS MODAL */}
      {renderCarDetailsModal()}
    </SafeAreaView>
  );
};

export default HomeScreen;