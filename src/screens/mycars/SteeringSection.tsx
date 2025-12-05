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

interface SteeringSectionProps {
  beadingCarId: string;
}

const SteeringSection: React.FC<SteeringSectionProps> = ({beadingCarId}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    Steering: '',
    Brake: '',
    Suspension: '',
  });

  const [uploadedImages, setUploadedImages] = useState({
    Steerings: null as string | null,
    Brakes: null as string | null,
    Suspensions: null as string | null,
  });

  const fetchSteeringData = async () => {
    setLoading(true);
    setError('');
    try {
      const docType = 'Steering';
      const response = await fetch(
        `${BASE_URL}/uploadFileBidCar/getBidCarIdType?beadingCarId=${beadingCarId}&docType=${docType}`,
      );
      const text = await response.text();
      const data = JSON.parse(text);

      console.log('Steering Data:', data);

      if (data?.object && Array.isArray(data.object)) {
        data.object.forEach((item: any) => {
          switch (item.subtype) {
            case 'Steering':
              setFormData(prev => ({...prev, Steering: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                Steerings: item.documentLink,
              }));
              break;
            case 'Brake':
              setFormData(prev => ({...prev, Brake: item.comment}));
              setUploadedImages(prev => ({...prev, Brakes: item.documentLink}));
              break;
            case 'Suspension':
              setFormData(prev => ({...prev, Suspension: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                Suspensions: item.documentLink,
              }));
              break;
            default:
              break;
          }
        });
      }
    } catch (err) {
      console.error('Error fetching steering data:', err);
      setError('Failed to load steering data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (beadingCarId) {
      fetchSteeringData();
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
        <Text style={styles.loadingText}>Loading steering data...</Text>
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
        <Text style={styles.mainTitle}>Steering</Text>

        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {renderItem(
              'Steering',
              formData.Steering,
              uploadedImages.Steerings,
            )}
            {renderItem('Brake', formData.Brake, uploadedImages.Brakes)}
            {renderItem(
              'Suspension',
              formData.Suspension,
              uploadedImages.Suspensions,
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
    marginBottom: 400,
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

export default SteeringSection;
