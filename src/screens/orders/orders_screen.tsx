import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles, { COLORS, responsive } from './OrderScreen.styles';

const lostCars = [
  {
    id: '10695486765',
    date: '21-08-2025',
    name: '2004 QUALIS GS G4',
    price: '₹ 1,41,000',
    image: require('../../assets/images/car1.png'),
  },
  {
    id: '10601821706',
    date: '01-03-2025',
    name: '2012 Vento COMFORTLINE 1.6',
    price: '₹ 1,96,000',
    image: require('../../assets/images/car2.png'),
  },
  {
    id: '12584789725',
    date: '08-05-2024',
    name: '2012 A Star VXI (ABS) AT',
    price: '₹ 1,44,600',
    image: require('../../assets/images/car3.png'),
  },
  {
    id: '10319486766',
    date: '27-04-2024',
    name: '2015 Wagon R Stingray VXI',
    price: '₹ 2,76,600',
    image: require('../../assets/images/car4.png'),
  },
];

type RootStackParamList = {
  Home: undefined;
  Main: { screen: string } | undefined;
  Orders: undefined;
};

const OrderScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [mainTab, setMainTab] = useState<
    'InNegotiation' | 'Procured' | 'RCTransfer'
  >('InNegotiation');

  const [subTab, setSubTab] = useState<'InNego' | 'Lost'>('InNego');

  const refreshSpin = React.useRef(new Animated.Value(0)).current;

  const onRefreshPress = () => {
    refreshSpin.setValue(0);
    Animated.timing(refreshSpin, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.linear),
      useNativeDriver: true,
    }).start(() => refreshSpin.setValue(0));
  };

  const spin = refreshSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderContent = () => {
    if (mainTab === 'InNegotiation') {
      if (subTab === 'InNego') {
        return (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="car-outline" size={80} color="#a9acd6" />
            <Text style={styles.title}>Nothing to see here</Text>
            <Text style={styles.subtitle}>
              Go back to home to participate in auctions
            </Text>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => {
                try {
                  navigation.navigate('HomeTab');
                } catch {
                  navigation.navigate('Main', { screen: 'Home' });
                }
              }}>
              <Text style={styles.homeButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        return (
          <ScrollView style={{ padding: responsive(16) }}>
            {lostCars.map(car => (
              <Animated.View key={car.id} style={styles.card}>
                <Text style={styles.lostDate}>LOST ON {car.date}</Text>
                <View style={styles.cardContent}>
                  <Image
                    source={car.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, paddingLeft: responsive(10) }}>
                    <Text style={styles.carTitle}>{car.name}</Text>
                    <Text style={styles.carPrice}>{car.price}</Text>
                    <Text style={styles.carId}>Appt.ID- {car.id}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        );
      }
    } else if (mainTab === 'Procured') {
      return (
        <View style={styles.procuredContainer}>
          <View style={styles.procuredBox}>
            <View style={styles.procuredRow}>
              <Text style={styles.procuredLabel}>Total Payable</Text>
              <Text style={styles.procuredAmount}>₹ 0</Text>
            </View>
            <View style={styles.procuredRow}>
              <Text style={styles.procuredLabel}>Account Balance</Text>
              <Text style={styles.procuredAmount}>₹ 0</Text>
            </View>
            <View style={[styles.procuredRow, styles.procuredRowHighlight]}>
              <Text style={styles.procuredLabel}>Pending deposit</Text>
              <Text style={styles.procuredAmount}>₹ 0</Text>
            </View>
          </View>

          <View style={styles.emptyStateContainer}>
            <Text style={styles.subtitle}>Oops, you have no procured cars.</Text>
            <Text style={styles.subtitle}>Keep Bidding!</Text>
            <TouchableOpacity style={styles.disabledRefreshButton}>
              <Text style={styles.disabledRefreshText}>REFRESH</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="car-outline" size={80} color="#a9acd6" />
          <Text style={styles.title}>No data available</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          {/* Logo Circle */}
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/images/caryanam.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Orders</Text>
            <Text style={styles.subTitle}>Track your bids & wins</Text>
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={onRefreshPress}>
            <Animated.View
              style={[styles.refreshButton, { transform: [{ rotate: spin }] }]}>
              <Text style={styles.refreshIcon}>⟳</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tabs */}
      <View style={styles.mainTabs}>
        {['In Negotiation', 'Procured', 'RC Transfer'].map(tab => {
          const value = tab.replace(' ', '') as
            | 'InNegotiation'
            | 'Procured'
            | 'RCTransfer';
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.mainTabButton,
                mainTab === value && styles.activeMainTab,
              ]}
              onPress={() => setMainTab(value)}>
              <Text
                style={[
                  styles.mainTabText,
                  mainTab === value && styles.activeMainTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sub Tabs */}
      {mainTab === 'InNegotiation' && (
        <View style={styles.subTabsContainer}>
          <View style={styles.subTabs}>
            {['InNego', 'Lost'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.subTabButton,
                  subTab === tab && styles.activeSubTab,
                ]}
                onPress={() => setSubTab(tab as any)}>
                <Text
                  style={[
                    styles.subTabText,
                    subTab === tab && styles.activeSubTabText,
                  ]}>
                  {tab === 'InNego' ? 'In nego 0' : 'Lost'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {renderContent()}
    </SafeAreaView>
  );
};

export default OrderScreen;
