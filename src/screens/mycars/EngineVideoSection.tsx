import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { BASE_URL } from '../../utility/serverConfig';

interface EngineVideoSectionProps {
  beadingCarId: string;
}

const EngineVideoSection: React.FC<EngineVideoSectionProps> = ({
  beadingCarId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    EngineVideo: '',
  });

  const [uploadedImages, setUploadedImages] = useState({
    EngineVideo: null as string | null,
  });

  const fetchEngineVideoData = async () => {
    setLoading(true);
    setError('');
    try {
      const docType = 'EngineVideo';
      const response = await fetch(
        `${BASE_URL}/uploadFileBidCar/getBidCarIdType?beadingCarId=${beadingCarId}&docType=${docType}`,
      );
      const text = await response.text();
      const data = JSON.parse(text);

      console.log('Engine Video Data:', data);

      if (data?.object && Array.isArray(data.object)) {
        data.object.forEach((item: any) => {
          if (item.subtype === 'EngineVideo') {
            setFormData(prev => ({...prev, EngineVideo: item.comment}));
            setUploadedImages(prev => ({
              ...prev,
              EngineVideo: item.documentLink,
            }));
          }
        });
      }
    } catch (err) {
      console.error('Error fetching engine video data:', err);
      setError('Failed to load engine video data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (beadingCarId) {
      fetchEngineVideoData();
    }
  }, [beadingCarId]);

  const renderItem = (
    label: string,
    value: string,
    videoUrl: string | null,
  ) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {label}: {value || '-'}
      </Text>
      {videoUrl ? (
        <Video
          source={{uri: videoUrl}}
          style={styles.video}
          controls={true}
          resizeMode="contain"
          paused={false}
          onError={error => {
            console.error('Video Error:', error);
          }}
        />
      ) : (
        <Text style={styles.noVideoText}>No video available</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#262a4f" />
        <Text style={styles.loadingText}>Loading engine video data...</Text>
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
        <Text style={styles.mainTitle}>Engine Video</Text>

        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {renderItem(
              'Engine Video',
              formData.EngineVideo,
              uploadedImages.EngineVideo,
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
  video: {
    width: '100%',
    height: 250,
    marginTop: 8,
    backgroundColor: '#000',
    borderRadius: 4,
  },
  noVideoText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default EngineVideoSection;
