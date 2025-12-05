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

interface ExteriorSectionProps {
  beadingCarId: string;
}

const ExteriorSection: React.FC<ExteriorSectionProps> = ({beadingCarId}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    BonnetHood: '',
    RightDoorFront: '',
    LeftDoorFront: '',
    LeftFender: '',
    RightFender: '',
    LeftQuarterPanel: '',
    RightQuarterPanel: '',
    Roof: '',
    DickyDoor: '',
    LeftDoorRear: '',
    RightDoorRear: '',
    LHSFrontTyre: '',
    RHSFrontTyre: '',
    LHSRearTyre: '',
    RHSRearTyre: '',
    SpareTyre: '',
    Windshield: '',
    FrontWindshield: '',
    RearWindshield: '',
    Light: '',
    FrontBumper: '',
    RearBumper: '',
    LHSHeadlight: '',
    RHSHeadlight: '',
    LHSTaillight: '',
    RHSTaillight: '',
    HeadLightSupport: '',
    RadiatorSupport: '',
    AlloyWheel: '',
    CowlTop: '',
    BootFloor: '',
    RightApronLEG: '',
    LeftApronLEG: '',
    RightApron: '',
    LeftApron: '',
    LeftPillar: '',
    LeftPillarA: '',
    LeftPillarB: '',
    LeftPillarC: '',
    RightPillar: '',
    RightPillarA: '',
    RightPillarB: '',
    RightPillarC: '',
  });

  const [uploadedImages, setUploadedImages] = useState({
    BonnetHoods: null as string | null,
    RightDoorFronts: null as string | null,
    LeftDoorFronts: null as string | null,
    LeftFenders: null as string | null,
    RightFenders: null as string | null,
    LeftQuarterPanels: null as string | null,
    RightQuarterPanels: null as string | null,
    Roofs: null as string | null,
    DickyDoors: null as string | null,
    LeftDoorRears: null as string | null,
    RightDoorRears: null as string | null,
    LHSFrontTyres: null as string | null,
    RHSFrontTyres: null as string | null,
    LHSRearTyres: null as string | null,
    RHSRearTyres: null as string | null,
    SpareTyres: null as string | null,
    Windshields: null as string | null,
    FrontWindshields: null as string | null,
    RearWindshields: null as string | null,
    Lights: null as string | null,
    FrontBumpers: null as string | null,
    RearBumpers: null as string | null,
    LHSHeadlights: null as string | null,
    RHSHeadlights: null as string | null,
    LHSTaillights: null as string | null,
    RHSTaillights: null as string | null,
    HeadLightSupports: null as string | null,
    RadiatorSupports: null as string | null,
    AlloyWheels: null as string | null,
    CowlTops: null as string | null,
    BootFloors: null as string | null,
    RightApronLEGs: null as string | null,
    LeftApronLEGs: null as string | null,
    RightAprons: null as string | null,
    LeftAprons: null as string | null,
    LeftPillars: null as string | null,
    LeftPillarAs: null as string | null,
    LeftPillarBs: null as string | null,
    LeftPillarCs: null as string | null,
    RightPillars: null as string | null,
    RightPillarAs: null as string | null,
    RightPillarBs: null as string | null,
    RightPillarCs: null as string | null,
  });

  const fetchExteriorData = async () => {
    setLoading(true);
    setError('');
    try {
      const docType = 'Exterior';
      const response = await fetch(
        `${BASE_URL}/uploadFileBidCar/getBidCarIdType?beadingCarId=${beadingCarId}&docType=${docType}`,
      );
      const text = await response.text();
      const data = JSON.parse(text);

      console.log('Exterior Data:', data);

      if (data?.object && Array.isArray(data.object)) {
        data.object.forEach((item: any) => {
          switch (item.subtype) {
            case 'BonnetHood':
              setFormData(prev => ({...prev, BonnetHood: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                BonnetHoods: item.documentLink,
              }));
              break;
            case 'RightDoorFront':
              setFormData(prev => ({...prev, RightDoorFront: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightDoorFronts: item.documentLink,
              }));
              break;
            case 'LeftDoorFront':
              setFormData(prev => ({...prev, LeftDoorFront: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftDoorFronts: item.documentLink,
              }));
              break;
            case 'RightFender':
              setFormData(prev => ({...prev, RightFender: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightFenders: item.documentLink,
              }));
              break;
            case 'LeftQuarterPanel':
              setFormData(prev => ({...prev, LeftQuarterPanel: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftQuarterPanels: item.documentLink,
              }));
              break;
            case 'RightQuarterPanel':
              setFormData(prev => ({...prev, RightQuarterPanel: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightQuarterPanels: item.documentLink,
              }));
              break;
            case 'Roof':
              setFormData(prev => ({...prev, Roof: item.comment}));
              setUploadedImages(prev => ({...prev, Roofs: item.documentLink}));
              break;
            case 'DickyDoor':
              setFormData(prev => ({...prev, DickyDoor: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                DickyDoors: item.documentLink,
              }));
              break;
            case 'LeftDoorRear':
              setFormData(prev => ({...prev, LeftDoorRear: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftDoorRears: item.documentLink,
              }));
              break;
            case 'LeftFender':
              setFormData(prev => ({...prev, LeftFender: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftFenders: item.documentLink,
              }));
              break;
            case 'RightDoorRear':
              setFormData(prev => ({...prev, RightDoorRear: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightDoorRears: item.documentLink,
              }));
              break;
            case 'LHSFrontTyre':
              setFormData(prev => ({...prev, LHSFrontTyre: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LHSFrontTyres: item.documentLink,
              }));
              break;
            case 'RHSFrontTyre':
              setFormData(prev => ({...prev, RHSFrontTyre: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RHSFrontTyres: item.documentLink,
              }));
              break;
            case 'LHSRearTyre':
              setFormData(prev => ({...prev, LHSRearTyre: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LHSRearTyres: item.documentLink,
              }));
              break;
            case 'RHSRearTyre':
              setFormData(prev => ({...prev, RHSRearTyre: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RHSRearTyres: item.documentLink,
              }));
              break;
            case 'SpareTyre':
              setFormData(prev => ({...prev, SpareTyre: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                SpareTyres: item.documentLink,
              }));
              break;
            case 'Windshield':
              setFormData(prev => ({...prev, Windshield: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                Windshields: item.documentLink,
              }));
              break;
            case 'FrontWindshield':
              setFormData(prev => ({...prev, FrontWindshield: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                FrontWindshields: item.documentLink,
              }));
              break;
            case 'RearWindshield':
              setFormData(prev => ({...prev, RearWindshield: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RearWindshields: item.documentLink,
              }));
              break;
            case 'Light':
              setFormData(prev => ({...prev, Light: item.comment}));
              setUploadedImages(prev => ({...prev, Lights: item.documentLink}));
              break;
            case 'FrontBumper':
              setFormData(prev => ({...prev, FrontBumper: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                FrontBumpers: item.documentLink,
              }));
              break;
            case 'RearBumper':
              setFormData(prev => ({...prev, RearBumper: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RearBumpers: item.documentLink,
              }));
              break;
            case 'LHSHeadlight':
              setFormData(prev => ({...prev, LHSHeadlight: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LHSHeadlights: item.documentLink,
              }));
              break;
            case 'RHSHeadlight':
              setFormData(prev => ({...prev, RHSHeadlight: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RHSHeadlights: item.documentLink,
              }));
              break;
            case 'LHSTaillight':
              setFormData(prev => ({...prev, LHSTaillight: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LHSTaillights: item.documentLink,
              }));
              break;
            case 'RHSTaillight':
              setFormData(prev => ({...prev, RHSTaillight: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RHSTaillights: item.documentLink,
              }));
              break;
            case 'HeadLightSupport':
              setFormData(prev => ({...prev, HeadLightSupport: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                HeadLightSupports: item.documentLink,
              }));
              break;
            case 'RadiatorSupport':
              setFormData(prev => ({...prev, RadiatorSupport: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RadiatorSupports: item.documentLink,
              }));
              break;
            case 'AlloyWheel':
              setFormData(prev => ({...prev, AlloyWheel: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                AlloyWheels: item.documentLink,
              }));
              break;
            case 'CowlTop':
              setFormData(prev => ({...prev, CowlTop: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                CowlTops: item.documentLink,
              }));
              break;
            case 'BootFloor':
              setFormData(prev => ({...prev, BootFloor: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                BootFloors: item.documentLink,
              }));
              break;
            case 'RightApronLEG':
              setFormData(prev => ({...prev, RightApronLEG: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightApronLEGs: item.documentLink,
              }));
              break;
            case 'LeftApronLEG':
              setFormData(prev => ({...prev, LeftApronLEG: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftApronLEGs: item.documentLink,
              }));
              break;
            case 'RightApron':
              setFormData(prev => ({...prev, RightApron: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightAprons: item.documentLink,
              }));
              break;
            case 'LeftApron':
              setFormData(prev => ({...prev, LeftApron: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftAprons: item.documentLink,
              }));
              break;
            case 'LeftPillar':
              setFormData(prev => ({...prev, LeftPillar: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftPillars: item.documentLink,
              }));
              break;
            case 'LeftPillarA':
              setFormData(prev => ({...prev, LeftPillarA: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftPillarAs: item.documentLink,
              }));
              break;
            case 'LeftPillarB':
              setFormData(prev => ({...prev, LeftPillarB: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftPillarBs: item.documentLink,
              }));
              break;
            case 'LeftPillarC':
              setFormData(prev => ({...prev, LeftPillarC: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                LeftPillarCs: item.documentLink,
              }));
              break;
            case 'RightPillar':
              setFormData(prev => ({...prev, RightPillar: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightPillars: item.documentLink,
              }));
              break;
            case 'RightPillarA':
              setFormData(prev => ({...prev, RightPillarA: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightPillarAs: item.documentLink,
              }));
              break;
            case 'RightPillarB':
              setFormData(prev => ({...prev, RightPillarB: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightPillarBs: item.documentLink,
              }));
              break;
            case 'RightPillarC':
              setFormData(prev => ({...prev, RightPillarC: item.comment}));
              setUploadedImages(prev => ({
                ...prev,
                RightPillarCs: item.documentLink,
              }));
              break;
            default:
              break;
          }
        });
      }
    } catch (err) {
      console.error('Error fetching exterior data:', err);
      setError('Failed to load exterior data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (beadingCarId) {
      fetchExteriorData();
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
        <Text style={styles.loadingText}>Loading exterior data...</Text>
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
        <Text style={styles.mainTitle}>Exterior</Text>

        <Text style={styles.sectionTitle}>Exterior Panel</Text>
        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {renderItem(
              'Bonnet Hood',
              formData.BonnetHood,
              uploadedImages.BonnetHoods,
            )}
            {renderItem(
              'Right Door Front',
              formData.RightDoorFront,
              uploadedImages.RightDoorFronts,
            )}
            {renderItem(
              'Left Door Front',
              formData.LeftDoorFront,
              uploadedImages.LeftDoorFronts,
            )}
            {renderItem(
              'Left Fender',
              formData.LeftFender,
              uploadedImages.LeftFenders,
            )}
            {renderItem(
              'Right Fender',
              formData.RightFender,
              uploadedImages.RightFenders,
            )}
            {renderItem(
              'Left Quarter Panel',
              formData.LeftQuarterPanel,
              uploadedImages.LeftQuarterPanels,
            )}
            {renderItem(
              'Right Quarter Panel',
              formData.RightQuarterPanel,
              uploadedImages.RightQuarterPanels,
            )}
            {renderItem('Roof', formData.Roof, uploadedImages.Roofs)}
            {renderItem(
              'Dicky Door',
              formData.DickyDoor,
              uploadedImages.DickyDoors,
            )}
            {renderItem(
              'Left Door Rear',
              formData.LeftDoorRear,
              uploadedImages.LeftDoorRears,
            )}
            {renderItem(
              'Right Door Rear',
              formData.RightDoorRear,
              uploadedImages.RightDoorRears,
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tyre</Text>
        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {renderItem(
              'LHS Front Tyre',
              formData.LHSFrontTyre,
              uploadedImages.LHSFrontTyres,
            )}
            {renderItem(
              'RHS Front Tyre',
              formData.RHSFrontTyre,
              uploadedImages.RHSFrontTyres,
            )}
            {renderItem(
              'LHS Rear Tyre',
              formData.LHSRearTyre,
              uploadedImages.LHSRearTyres,
            )}
            {renderItem(
              'RHS Rear Tyre',
              formData.RHSRearTyre,
              uploadedImages.RHSRearTyres,
            )}
            {renderItem(
              'Spare Tyre',
              formData.SpareTyre,
              uploadedImages.SpareTyres,
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Windshield and Lights</Text>
        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {renderItem(
              'Windshield',
              formData.Windshield,
              uploadedImages.Windshields,
            )}
            {renderItem(
              'Front Windshield',
              formData.FrontWindshield,
              uploadedImages.FrontWindshields,
            )}
            {renderItem(
              'Rear Windshield',
              formData.RearWindshield,
              uploadedImages.RearWindshields,
            )}
            {renderItem('Light', formData.Light, uploadedImages.Lights)}
            {renderItem(
              'Front Bumper',
              formData.FrontBumper,
              uploadedImages.FrontBumpers,
            )}
            {renderItem(
              'Rear Bumper',
              formData.RearBumper,
              uploadedImages.RearBumpers,
            )}
            {renderItem(
              'LHS Headlight',
              formData.LHSHeadlight,
              uploadedImages.LHSHeadlights,
            )}
            {renderItem(
              'RHS Headlight',
              formData.RHSHeadlight,
              uploadedImages.RHSHeadlights,
            )}
            {renderItem(
              'LHS Taillight',
              formData.LHSTaillight,
              uploadedImages.LHSTaillights,
            )}
            {renderItem(
              'RHS Taillight',
              formData.RHSTaillight,
              uploadedImages.RHSTaillights,
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Other Components</Text>
        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {renderItem(
              'Head Light Support',
              formData.HeadLightSupport,
              uploadedImages.HeadLightSupports,
            )}
            {renderItem(
              'Radiator Support',
              formData.RadiatorSupport,
              uploadedImages.RadiatorSupports,
            )}
            {renderItem(
              'Alloy Wheel',
              formData.AlloyWheel,
              uploadedImages.AlloyWheels,
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Structure</Text>
        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {renderItem('Cowl Top', formData.CowlTop, uploadedImages.CowlTops)}
            {renderItem(
              'Boot Floor',
              formData.BootFloor,
              uploadedImages.BootFloors,
            )}
            {renderItem(
              'Right Apron LEG',
              formData.RightApronLEG,
              uploadedImages.RightApronLEGs,
            )}
            {renderItem(
              'Left Apron LEG',
              formData.LeftApronLEG,
              uploadedImages.LeftApronLEGs,
            )}
            {renderItem(
              'Right Apron',
              formData.RightApron,
              uploadedImages.RightAprons,
            )}
            {renderItem(
              'Left Apron',
              formData.LeftApron,
              uploadedImages.LeftAprons,
            )}
            {renderItem(
              'Left Pillar',
              formData.LeftPillar,
              uploadedImages.LeftPillars,
            )}
            {renderItem(
              'Left Pillar A',
              formData.LeftPillarA,
              uploadedImages.LeftPillarAs,
            )}
            {renderItem(
              'Left Pillar B',
              formData.LeftPillarB,
              uploadedImages.LeftPillarBs,
            )}
            {renderItem(
              'Left Pillar C',
              formData.LeftPillarC,
              uploadedImages.LeftPillarCs,
            )}
            {renderItem(
              'Right Pillar',
              formData.RightPillar,
              uploadedImages.RightPillars,
            )}
            {renderItem(
              'Right Pillar A',
              formData.RightPillarA,
              uploadedImages.RightPillarAs,
            )}
            {renderItem(
              'Right Pillar B',
              formData.RightPillarB,
              uploadedImages.RightPillarBs,
            )}
            {renderItem(
              'Right Pillar C',
              formData.RightPillarC,
              uploadedImages.RightPillarCs,
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
    padding: 15,
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
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#c7d2fe',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 0,    // <<< UPDATED
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
    marginBottom: 20,
  },
  gridContainer: {
    gap: 10,
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

export default ExteriorSection;
