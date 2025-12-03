import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  SafeAreaView,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import styles, {COLORS} from './AddOns.styles'; // ✅ Imported styles

const {width} = Dimensions.get('window');

interface FinalBid {
  finalBidId: number;
  bidCarId: number;
  price: number;
  buyerDealerId: number;
  sellerDealerId: number | null;
  beadingCarId: number | null;
  createdAt?: string;
  updatedAt?: string;
}

const AddOnsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [finalBids, setFinalBids] = useState<FinalBid[]>([]);
  const [displayedBids, setDisplayedBids] = useState<FinalBid[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBid, setSelectedBid] = useState<FinalBid | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(true);

  const flatListRef = useRef<FlatList<FinalBid>>(null);

  const itemAnims = useRef<Animated.Value[]>([]);
  const modalAnim = useRef(new Animated.Value(0)).current;
  const refreshSpin = useRef(new Animated.Value(0)).current;

  const ITEMS_PER_PAGE = 6;
  const CACHE_KEY = 'cached_finalBids';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (!cached) {
          // no cache — show loader
          await fetchFinalBids(true);
          return;
        }

        const bids: FinalBid[] = JSON.parse(cached);
        if (cancelled) return;

        // show cached data immediately and revalidate in background
        setFinalBids(bids);
        setDisplayedBids(bids.slice(0, ITEMS_PER_PAGE));
        fetchFinalBids(false);
      } catch (e) {
        // fallback to normal fetch if cache read fails
        fetchFinalBids(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    itemAnims.current = displayedBids.map(() => new Animated.Value(0));
    animateListIn();
  }, [displayedBids]);

  const fetchFinalBids = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(
        'https://car01.dostenterprises.com/Bid/finalBids',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      const bids = json.finalBids || [];
      bids.sort((a: FinalBid, b: FinalBid) => {
        if (a.updatedAt && b.updatedAt)
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        return b.finalBidId - a.finalBidId;
      });
      setFinalBids(bids);
      setDisplayedBids(bids.slice(0, ITEMS_PER_PAGE));

      // persist the fetched result for instant subsequent loads
      try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(bids));
      } catch (e) {
        // best-effort cache write; ignore failures
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadMore = () => {
    if (loading) return;
    const nextPage = page + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE;
    const newItems = finalBids.slice(startIndex, nextPage * ITEMS_PER_PAGE);
    if (newItems.length > 0) {
      setDisplayedBids(prev => [...prev, ...newItems]);
      setPage(nextPage);
    }
  };

  const animateListIn = () => {
    const animations = itemAnims.current.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 450,
        delay: i * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    Animated.stagger(60, animations).start();
  };

  const onRefreshPress = () => {
    refreshSpin.setValue(0);
    Animated.timing(refreshSpin, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.linear),
      useNativeDriver: true,
    }).start(() => refreshSpin.setValue(0));
    fetchFinalBids();
  };

  const openDetails = (bid: FinalBid) => {
    setSelectedBid(bid);
    setModalVisible(true);
    modalAnim.setValue(0);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.back(0.6)),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedBid(null);
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (layoutMeasurement.height + contentOffset.y);
    setShowScrollButton(distanceFromBottom >= 60);
  };

  const scrollToBottom = () => {
    if (flatListRef.current && finalBids.length > 0) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  };

  const spin = refreshSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderBidCard = ({item, index}: {item: FinalBid; index: number}) => {
    const anim = itemAnims.current[index] || new Animated.Value(1);
    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    });
    const opacity = anim;

    return (
      <Animated.View
        style={[styles.card, {transform: [{translateY}], opacity}]}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => openDetails(item)}
          style={{flex: 1}}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.carIdText}>🏁 Car ID</Text>
              <Text style={styles.carIdNumber}>#{item.bidCarId}</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.priceLabel}>Winning</Text>
              <Text style={styles.priceValue}>
                ₹{item.price.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.detailRowSmall}>
              <Text style={styles.smallLabel}>Buyer Dealer</Text>
              <Text style={styles.smallValue}>ID {item.buyerDealerId}</Text>
            </View>
            <View style={styles.detailRowSmall}>
              <Text style={styles.smallLabel}>Seller Dealer</Text>
              <Text style={styles.smallValue}>
                {item.sellerDealerId ?? '—'}
              </Text>
            </View>
            <View style={styles.detailRowSmall}>
              <Text style={styles.smallLabel}>Beading ID</Text>
              <Text style={styles.smallValue}>{item.beadingCarId ?? '—'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/images/caryanam.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>WinZone</Text>
            <Text style={styles.subTitle}>Latest auction winners</Text>
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={onRefreshPress}>
            <Animated.View
              style={[styles.refreshButton, {transform: [{rotate: spin}]}]}>
              <Text style={styles.refreshIcon}>⟳</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentWrap}>
        {loading && displayedBids.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{marginTop: 40}}
          />
        ) : error ? (
          <Text style={styles.errorText}>❌ {error}</Text>
        ) : displayedBids.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="car-outline" size={80} color="#a9acd6" />
            <Text style={styles.emptyTitle}>No final bids</Text>
            <Text style={styles.emptySub}>
              Try refreshing or check back later.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayedBids}
            keyExtractor={item => item.finalBidId.toString()}
            renderItem={renderBidCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
        )}
      </View>

      {showScrollButton && displayedBids.length > 0 && (
        <TouchableOpacity style={styles.scrollButton} onPress={scrollToBottom}>
          <Icon name="arrow-down" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}>
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Car Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              {selectedBid ? (
                <>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Car ID</Text>
                    <Text style={styles.modalValue}>
                      #{selectedBid.bidCarId}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Winning Price</Text>
                    <Text
                      style={[
                        styles.modalValue,
                        {color: COLORS.primary, fontWeight: '700'},
                      ]}>
                      ₹{selectedBid.price.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Buyer Dealer ID</Text>
                    <Text style={styles.modalValue}>
                      {selectedBid.buyerDealerId}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Seller Dealer ID</Text>
                    <Text style={styles.modalValue}>
                      {selectedBid.sellerDealerId ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Beading Car ID</Text>
                    <Text style={styles.modalValue}>
                      {selectedBid.beadingCarId ?? 'N/A'}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.modalValue}>No details available.</Text>
              )}
            </ScrollView>

            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddOnsScreen;
