import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BASE_URL } from '../../utility/serverConfig';

interface InteriorSectionProps {
  beadingCarId: string;
}

const InteriorSection: React.FC<InteriorSectionProps> = ({beadingCarId}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    LeatherSeat: '',
    Odometer: '',
    Dashboard: '',
    CabinFloor: '',
  });

  const [uploadedImages, setUploadedImages] = useState({
    LeatherSeats: null as string | null,
    Odometers: null as string | null,
    CabinFloors: null as string | null,
    Dashboards: null as string | null,
  });

  const fetchInteriorData = async () => {
    setLoading(true);
    setError('');
    try {
      const docType = 'Interior';
      const response = await fetch(
        `${BASE_URL}/uploadFileBidCar/getBidCarIdType?beadingCarId=${beadingCarId}&docType=${docType}`,
      );
      const text = await response.text();
      const data = JSON.parse(text);

      console.log('Interior Data:', data);

      if (data?.object && Array.isArray(data.object)) {
        data.object.forEach((item: any) => {
          switch (item.subtype) {
            case 'LeatherSeat':
              setFormData(prev => ({...prev, LeatherSeat: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeatherSeats: item.documentLink,
              }));
              break;
            case 'Odometer':
              setFormData(prev => ({...prev, Odometer: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                Odometers: item.documentLink,
              }));
              break;
            case 'CabinFloor':
              setFormData(prev => ({...prev, CabinFloor: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                CabinFloors: item.documentLink,
              }));
              break;
            case 'Dashboard':
              setFormData(prev => ({...prev, Dashboard: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                Dashboards: item.documentLink,
              }));
              break;
            default:
              break;
          }
        });
      }
    } catch (err) {
      console.error('Error fetching interior data:', err);
      setError('Failed to load interior data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (beadingCarId) {
      fetchInteriorData();
    }
  }, [beadingCarId]);

  const renderItem = (
    label: string,
    value: string,
    imageUrl: string | null,
  ) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {label}: {value || '-'}
      </Text>
      {imageUrl && <Image source={{uri: imageUrl}} style={styles.image} />}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#262a4f" />
        <Text style={styles.loadingText}>Loading interior data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.mainTitle}>Interior</Text>

        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {renderItem(
              'Leather Seat',
              formData.LeatherSeat,
              uploadedImages.LeatherSeats,
            )}
            {renderItem(
              'Odometer',
              formData.Odometer,
              uploadedImages.Odometers,
            )}
            {renderItem(
              'Dashboard',
              formData.Dashboard,
              uploadedImages.Dashboards,
            )}
            {renderItem(
              'Cabin Floor',
              formData.CabinFloor,
              uploadedImages.CabinFloors,
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#374151',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 550,
  },
  gridContainer: {
    gap: 20,
  },
  itemContainer: {
    marginBottom: 16,
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 8,
    resizeMode: 'cover',
    borderRadius: 4,
  },
});

export default InteriorSection;
