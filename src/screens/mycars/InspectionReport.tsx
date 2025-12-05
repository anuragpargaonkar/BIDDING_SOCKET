import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ExteriorSection from './ExteriorSection';
import InteriorSection from './InteriorSection';
import EngineSection from './EngineSection';
import ACSection from './ACSection';
import ElectricalSection from './ElectricalSection';
import SteeringSection from './SteeringSection';
import EngineVideoSection from './EngineVideoSection';
import { BASE_URL } from '../../utility/serverConfig';

const COLORS = {
  primary: '#262a4f',
  secondary: '#a9acd6',
  background: '#f5f6fa',
  white: '#FFFFFF',
  textDark: '#0F172A',
  textGray: '#374151',
};

const TABS = [
  'Document',
  'Exterior',
  'Interior',
  'Engine',
  'AC',
  'Electricals',
  'Engine Video',
  'Steering',
];

const formatDate = (val: string) => {
  if (!val) return '-';
  const d = new Date(val);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const InspectionReport = ({route, navigation}: any) => {
  const {beadingCarId} = route.params;
  const [activeTab, setActiveTab] = useState('Document');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/inspectionReport/getByBeadingCar?beadingCarId=${beadingCarId}`,
      );
      const text = await res.text();
      const data = JSON.parse(text);
      if (data?.object) setReport(data.object);
      else setReport(null);
    } catch {
      setError('Failed to load inspection report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const fieldMap: any = {
    rcavailability: 'RC Availability',
    rtonocissued: 'RTO NOC Issued',
    noClaimBonus: 'No Claim Bonus',
    roadTaxPaid: 'Road Tax Paid',
    duplicateKey: 'Duplicate Key',
    manufacturingDate: 'Manufacturing Date',
    rto: 'RTO',
    cnglpgfitmentInRC: 'CNG/LPG Fitment in RC',
    mismatchInRC: 'Mismatch in RC',
    insuranceType: 'Insurance Type',
    underHypothecation: 'Under Hypothecation',
    partipeshiRequest: 'Partipeshi Request',
    chassisNumberEmbossing: 'Chassis Number Embossing',
    registrationDate: 'Registration Date',
    fitnessUpto: 'Fitness Upto',
  };

  const renderDocumentSection = (data: any) => {
    const keys = Object.keys(fieldMap);

    return (
      <View style={styles.sectionBox}>
        {keys.map((key, idx) => {
          if (idx % 2 !== 0) return null;
          return (
            <View key={idx} style={styles.row}>
              {/* LEFT COLUMN */}
              <View style={styles.col}>
                <Text style={styles.label}>{fieldMap[key]}:</Text>
                <Text style={styles.value}>
                  {data[key]
                    ? key.includes('Date') || key.includes('Upto')
                      ? formatDate(data[key])
                      : data[key]
                    : '-'}
                </Text>
              </View>

              {/* RIGHT COLUMN */}
              {keys[idx + 1] && (
                <View style={styles.col}>
                  <Text style={styles.label}>{fieldMap[keys[idx + 1]]}:</Text>
                  <Text style={styles.value}>
                    {data[keys[idx + 1]]
                      ? keys[idx + 1].includes('Date') ||
                        keys[idx + 1].includes('Upto')
                        ? formatDate(data[keys[idx + 1]])
                        : data[keys[idx + 1]]
                      : '-'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderEmptySection = () => (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyText}>No data available</Text>
    </View>
  );

  const renderSection = () => {
    if (activeTab === 'Document') return renderDocumentSection(report);
    if (activeTab === 'Exterior')
      return <ExteriorSection beadingCarId={beadingCarId} />;
    if (activeTab === 'Interior')
      return <InteriorSection beadingCarId={beadingCarId} />;
    if (activeTab === 'Engine')
      return <EngineSection beadingCarId={beadingCarId} />;
    if (activeTab === 'AC') return <ACSection beadingCarId={beadingCarId} />;
    if (activeTab === 'Electricals')
      return <ElectricalSection beadingCarId={beadingCarId} />;
    if (activeTab === 'Engine Video')
      return <EngineVideoSection beadingCarId={beadingCarId} />;
    if (activeTab === 'Steering')
      return <SteeringSection beadingCarId={beadingCarId} />;

    return renderEmptySection();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.header}>Inspection Report</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !report ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>No report found.</Text>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabBar}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={styles.tabButton}
                onPress={() => setActiveTab(tab)}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false}>
            {renderSection()}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default InspectionReport;

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},

  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 18,
    color: COLORS.primary,
  },

  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, color: COLORS.textGray},
  errorText: {fontSize: 14, color: 'red'},

  tabBar: {
    backgroundColor: '#e9e9f2',
    paddingVertical: 10,
    marginTop: 12,
  },
  tabButton: {
    marginHorizontal: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  tabIndicator: {
    marginTop: 4,
    height: 3,
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  sectionBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 300,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  col: {
    width: '48%',
  },

  label: {fontSize: 14, fontWeight: '500', color: '#333'},
  value: {fontSize: 14, fontWeight: '700', color: '#000', marginTop: 2},

  emptyBox: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {fontSize: 14, color: COLORS.textGray, fontStyle: 'italic'},
});
