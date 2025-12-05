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

interface ElectricalSectionProps {
  beadingCarId: string;
}

const ElectricalSection: React.FC<ElectricalSectionProps> = ({
  beadingCarId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    FourPowerWindows: '',
    AirBagFeatures: '',
    MusicSystem: '',
    Sunroof: '',
    ABS: '',
    InteriorParkingSensor: '',
    Electricalwiring: '',
  });

  const [images, setImages] = useState({
    FourPowerWindowss: null as string | null,
    AirBagFeaturess: null as string | null,
    MusicSystems: null as string | null,
    Sunroofs: null as string | null,
    ABSs: null as string | null,
    InteriorParkingSensors: null as string | null,
    Electricalwirings: null as string | null,
  });

  const fetchElectricalData = async () => {
    setLoading(true);
    setError('');
    try {
      const docType = 'Eletrical';
      const response = await fetch(
        `${BASE_URL}/uploadFileBidCar/getBidCarIdType?beadingCarId=${beadingCarId}&docType=${docType}`,
      );
      const text = await response.text();
      const data = JSON.parse(text);

      console.log('Electrical Data:', data);

      if (data?.object && Array.isArray(data.object)) {
        data.object.forEach((item: any) => {
          switch (item.subtype) {
            case 'FourPowerWindows':
              setFormData(prev => ({...prev, FourPowerWindows: item.comment}));
              setImages(prev => ({
                ...prev,
                FourPowerWindowss: item.documentLink,
              }));
              break;
            case 'AirBagFeatures':
              setFormData(prev => ({...prev, AirBagFeatures: item.comment}));
              setImages(prev => ({
                ...prev,
                AirBagFeaturess: item.documentLink,
              }));
              break;
            case 'MusicSystem':
              setFormData(prev => ({...prev, MusicSystem: item.comment}));
              setImages(prev => ({...prev, MusicSystems: item.documentLink}));
              break;
            case 'Sunroof':
              setFormData(prev => ({...prev, Sunroof: item.comment}));
              setImages(prev => ({...prev, Sunroofs: item.documentLink}));
              break;
            case 'ABS':
              setFormData(prev => ({...prev, ABS: item.comment}));
              setImages(prev => ({...prev, ABSs: item.documentLink}));
              break;
            case 'InteriorParkingSensor':
              setFormData(prev => ({
                ...prev,
                InteriorParkingSensor: item.comment,
              }));
              setImages(prev => ({
                ...prev,
                InteriorParkingSensors: item.documentLink,
              }));
              break;
            case 'Electricalwiring':
              setFormData(prev => ({...prev, Electricalwiring: item.comment}));
              setImages(prev => ({
                ...prev,
                Electricalwirings: item.documentLink,
              }));
              break;
            default:
              break;
          }
        });
      }
    } catch (err) {
      console.error('Error fetching electrical data:', err);
      setError('Failed to load electrical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (beadingCarId) {
      fetchElectricalData();
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
        <Text style={styles.loadingText}>Loading electrical data...</Text>
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
        <Text style={styles.mainTitle}>Electricals</Text>

        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {renderItem(
              'Four Power Windows',
              formData.FourPowerWindows,
              images.FourPowerWindowss,
            )}
            {renderItem(
              'AirBag Features',
              formData.AirBagFeatures,
              images.AirBagFeaturess,
            )}
            {renderItem(
              'Music System',
              formData.MusicSystem,
              images.MusicSystems,
            )}
            {renderItem('Sunroof', formData.Sunroof, images.Sunroofs)}
            {renderItem('ABS', formData.ABS, images.ABSs)}
            {renderItem(
              'Interior Parking Sensor',
              formData.InteriorParkingSensor,
              images.InteriorParkingSensors,
            )}
            {renderItem(
              'Electrical Wiring',
              formData.Electricalwiring,
              images.Electricalwirings,
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
    marginBottom: 24,
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

export default ElectricalSection;
