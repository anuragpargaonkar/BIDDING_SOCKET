// src/screens/HomeScreen.styles.ts

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Scale relative to a standard 375px screen width
const scale = width / 375;

// Responsive size
const RS = (size: number) => Math.round(size * scale);

// Responsive font
const RF = (size: number) => Math.round(size * scale);

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#262a4f' },
  gradientBackground: { flex: 1 },

  header: { paddingHorizontal: RS(20), paddingTop: RS(15), paddingBottom: RS(20) },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RS(16),
  },

  profileSection: { flexDirection: 'row', alignItems: 'center' },

  logoImage: {
    width: RS(50),
    height: RS(50),
  },

  notificationIcon: { position: 'relative' },

  notificationBadge: {
    position: 'absolute',
    top: RS(2),
    right: RS(2),
    width: RS(10),
    height: RS(10),
    borderRadius: RS(5),
    backgroundColor: '#EF4444',
    borderWidth: RS(2),
    borderColor: '#262a4f',
  },

  searchContainer: {
    flexDirection: 'row',
    gap: RS(12),
    width: '100%',
    height: RS(60),
    paddingHorizontal: RS(16),
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RS(16),
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
    gap: RS(10),
  },

  searchInput: {
    flex: 1,
    color: '#1F2937',
    fontSize: RF(15),
    fontWeight: '500',
  },

  whiteContentArea: {
    flex: 1,
    backgroundColor: '#f8f9fc',
    borderTopLeftRadius: RS(30),
    borderTopRightRadius: RS(30),
    paddingTop: RS(20),
  },

  scrollViewContent: { flex: 1 },

  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: RS(10),
    paddingHorizontal: RS(20),
    gap: RS(40),
  },

  tabContainer: { alignItems: 'center' },

  tabText: {
    fontSize: RF(18),
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },

  activeTabText: { color: '#262a4f' },

  tabCountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: RS(10),
    paddingVertical: RS(3),
    borderRadius: RS(12),
    marginTop: RS(6),
  },

  activeTabCountBadge: { backgroundColor: '#e6e8f3' },

  tabCount: {
    fontSize: RF(13),
    fontWeight: '800',
    color: '#6B7280',
  },

  activeTabCountText: { color: '#262a4f' },

  activeTabIndicator: {
    height: RS(4),
    marginTop: RS(8),
    width: RS(50),
    borderRadius: RS(2),
    backgroundColor: '#a9acd6',
  },

  banner: {
    marginHorizontal: RS(16),
    padding: RS(20),
    borderRadius: RS(20),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6e8f3',
    shadowColor: '#262a4f',
    shadowOffset: { width: 0, height: RS(8) },
    shadowOpacity: 0.15,
    shadowRadius: RS(12),
    elevation: 8,
  },

  newLaunchBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: RS(12),
    paddingVertical: RS(6),
    borderRadius: RS(8),
    marginBottom: RS(10),
    backgroundColor: '#262a4f',
  },

  bannerTitle: {
    fontSize: RF(13),
    fontWeight: '800',
    color: '#a9acd6',
    letterSpacing: 0.5,
  },

  bannerDesc: {
    fontSize: RF(13),
    color: '#4B5563',
    marginVertical: RS(8),
    lineHeight: RF(18),
    fontWeight: '500',
  },

  exploreBtn: {
    borderRadius: RS(12),
    paddingHorizontal: RS(18),
    paddingVertical: RS(10),
    marginTop: RS(8),
    alignSelf: 'flex-start',
    backgroundColor: '#a9acd6',
    shadowColor: '#a9acd6',
    shadowOffset: { width: 0, height: RS(4) },
    shadowOpacity: 0.3,
    shadowRadius: RS(8),
    elevation: 4,
  },

  exploreText: {
    color: '#262a4f',
    fontSize: RF(14),
    fontWeight: '700',
  },

  bannerImage: {
    width: RS(110),
    height: RS(100),
    resizeMode: 'contain',
    marginLeft: RS(10),
  },

  liveCarsHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RS(20),
    marginTop: RS(24),
    marginBottom: RS(16),
  },

  liveCarsHeader: {
    fontSize: RF(24),
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },

  liveCarsSubtext: {
    fontSize: RF(13),
    color: '#6B7280',
    marginTop: RS(2),
    fontWeight: '500',
  },

  refreshGradient: {
    width: RS(40),
    height: RS(40),
    borderRadius: RS(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a9acd6',
    shadowColor: '#a9acd6',
    shadowOffset: { width: 0, height: RS(4) },
    shadowOpacity: 0.3,
    shadowRadius: RS(8),
    elevation: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: RS(20),
    marginHorizontal: RS(16),
    marginBottom: RS(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: RS(16),
    shadowOffset: { width: 0, height: RS(8) },
    elevation: 8,
  },

  carImage: {
    width: '100%',
    height: RS(200),
    resizeMode: 'cover',
  },

  heartIcon: {
    position: 'absolute',
    top: RS(14),
    right: RS(14),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: RS(10),
    borderRadius: RS(24),
  },

  scrapBadge: {
    position: 'absolute',
    top: RS(14),
    left: RS(14),
    backgroundColor: '#EF4444',
    paddingHorizontal: RS(14),
    paddingVertical: RS(8),
    borderRadius: RS(12),
  },

  scrapText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: RF(11),
  },

  cardDetails: { padding: RS(18) },

  carName: {
    fontSize: RF(19),
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: RF(26),
    letterSpacing: -0.3,
  },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: RS(4) },

  locationTextSmall: {
    fontSize: RF(13),
    color: '#6B7280',
    fontWeight: '600',
  },

  carInfo: {
    fontSize: RF(13),
    color: '#9CA3AF',
    marginTop: RS(6),
    fontWeight: '500',
  },

  bidSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: RS(16),
    paddingTop: RS(16),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  highestBid: {
    fontSize: RF(12),
    color: '#9CA3AF',
    marginBottom: RS(6),
    fontWeight: '600',
  },

  bidAmount: {
    fontSize: RF(22),
    fontWeight: '800',
    color: '#262a4f',
    letterSpacing: -0.5,
  },

  timerContainer: { alignItems: 'flex-end' },

  timeRemaining: {
    fontSize: RF(11),
    color: '#9CA3AF',
    marginBottom: RS(6),
    fontWeight: '600',
  },

  timerBox: {
    paddingHorizontal: RS(12),
    paddingVertical: RS(8),
    borderRadius: RS(10),
    backgroundColor: '#262a4f',
  },

  timerText: {
    color: '#a9acd6',
    fontWeight: '800',
    fontSize: RF(14),
    letterSpacing: 0.5,
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: RS(16),
    borderRadius: RS(16),
    marginTop: RS(16),
    backgroundColor: '#262a4f',
    shadowColor: '#262a4f',
    elevation: 6,
  },

  viewButtonText: {
    color: '#fff',
    fontSize: RF(16),
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  loadingContainer: { alignItems: 'center', marginTop: RS(80) },

  loadingText: {
    marginTop: RS(16),
    color: '#a9acd6',
    fontSize: RF(16),
    fontWeight: '600',
  },

  emptyContainer: { alignItems: 'center', marginTop: RS(80) },

  emptyText: {
    fontSize: RF(20),
    fontWeight: '800',
    color: '#6B7280',
    marginTop: RS(16),
  },

  retryButton: {
    paddingHorizontal: RS(28),
    paddingVertical: RS(14),
    borderRadius: RS(14),
    marginTop: RS(20),
    backgroundColor: '#a9acd6',
  },

  retryText: {
    color: '#262a4f',
    fontWeight: '800',
    fontSize: RF(15),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 42, 79, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: RS(20),
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: RS(28),
    width: '100%',
    maxWidth: RS(420),
    overflow: 'hidden',
    alignSelf: 'center',
  },

  modalHeader: { padding: RS(24), alignItems: 'center', backgroundColor: '#262a4f' },

  modalTitle: {
    fontSize: RF(24),
    fontWeight: '800',
    color: '#a9acd6',
    letterSpacing: -0.5,
  },

  amountContainer: { padding: RS(24), paddingTop: RS(16) },

  amountLabel: {
    fontSize: RF(15),
    color: '#6B7280',
    marginBottom: RS(12),
    fontWeight: '600',
  },

  // FIXED ₹ OVERLAPPING PROBLEM (IMPORTANT)
  bidInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: RS(12),
  },

  rupeeSymbol: {
    fontSize: RF(24),
    fontWeight: '800',
    color: '#262a4f',
    marginRight: RS(8),
  },

  bidInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: RS(2),
    borderColor: '#e6e8f3',
    borderRadius: RS(30),
    overflow: 'hidden',
  },

  bidInput: {
    flex: 1,
    fontSize: RF(22),
    fontWeight: '800',
    paddingVertical: RS(12),
    color: '#1F2937',
    textAlign: 'left',
  },

  adjustButtonMinus: {
    width: RS(60),
    height: RS(60),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },

  adjustButtonPlus: {
    width: RS(60),
    height: RS(60),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a9acd6',
  },

  modalActions: { flexDirection: 'row', padding: RS(24), paddingTop: 0, gap: RS(12) },

  cancelButton: {
    flex: 1,
    paddingVertical: RS(16),
    borderRadius: RS(14),
    backgroundColor: '#fff',
    borderWidth: RS(2),
    borderColor: '#e6e8f3',
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#262a4f',
    fontSize: RF(15),
    fontWeight: '800',
  },

  confirmButton: {
    flex: 1,
    paddingVertical: RS(16),
    borderRadius: RS(14),
    alignItems: 'center',
    backgroundColor: '#a9acd6',
  },

  confirmButtonText: {
    color: '#262a4f',
    fontSize: RF(15),
    fontWeight: '800',
  },

  // SUCCESS MODAL

  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: RS(20),
    padding: RS(30),
    alignItems: 'center',
    width: '85%',
  },

  successTitle: {
    fontSize: RF(22),
    fontWeight: 'bold',
    color: '#262a4f',
    marginTop: RS(20),
    textAlign: 'center',
  },

  successAmount: {
    fontSize: RF(32),
    fontWeight: 'bold',
    color: '#10B981',
    marginVertical: RS(15),
  },

  successMessage: {
    fontSize: RF(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: RS(20),
  },

  successButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: RS(50),
    paddingVertical: RS(14),
    borderRadius: RS(25),
    marginTop: RS(10),
    width: '100%',
    alignItems: 'center',
  },

  successButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: RF(16),
  },

  modalCloseButton: {
    position: 'absolute',
    top: RS(20),
    right: RS(20),
  },

  currentBidInfo: {
    padding: RS(24),
    paddingBottom: RS(16),
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
  },

  currentBidLabel: {
    fontSize: RF(14),
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: RS(4),
  },

  currentBidAmount: {
    fontSize: RF(28),
    fontWeight: '800',
    color: '#262a4f',
  },

  bidIncrementHint: {
    fontSize: RF(13),
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: RS(12),
    fontWeight: '500',
  },

  quickBidOptions: {
    padding: RS(24),
    paddingTop: 0,
  },

  quickBidLabel: {
    fontSize: RF(14),
    fontWeight: '700',
    color: '#262a4f',
    marginBottom: RS(12),
  },

  quickBidButtonsRow: {
    flexDirection: 'row',
    gap: RS(8),
    justifyContent: 'space-between',
  },

  quickBidButton: {
    flex: 1,
    paddingVertical: RS(12),
    backgroundColor: '#e6e8f3',
    borderRadius: RS(12),
    alignItems: 'center',
  },

  quickBidButtonText: {
    fontSize: RF(13),
    fontWeight: '700',
    color: '#262a4f',
  },

  confirmButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },

  successIconContainer: {
    width: RS(100),
    height: RS(100),
    borderRadius: RS(50),
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: RS(16),
  },

  successAmountContainer: {
    alignItems: 'center',
    marginVertical: RS(10),
  },

  successAmountLabel: {
    fontSize: RF(14),
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: RS(4),
  },

  successDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginVertical: RS(20),
  },

  viewAllBidsButton: {
    marginTop: RS(12),
    paddingVertical: RS(12),
    alignItems: 'center',
  },

  viewAllBidsText: {
    color: '#a9acd6',
    fontSize: RF(14),
    fontWeight: '600',
  },

  detailsModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RS(20),
    paddingVertical: RS(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    elevation: 3,
  },

  backButton: {
    padding: RS(8),
  },

  detailsHeaderTitle: {
    fontSize: RF(18),
    fontWeight: '800',
    color: '#262a4f',
    letterSpacing: -0.3,
    marginRight: RS(115),
  },

  detailsScrollView: { flex: 1 },

  detailsImageContainer: {
    width: '100%',
    height: RS(280),
    position: 'relative',
    backgroundColor: '#f8f9fc',
  },

  detailsCarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  detailsScrapBadge: {
    position: 'absolute',
    top: RS(20),
    left: RS(20),
    backgroundColor: '#EF4444',
    paddingHorizontal: RS(16),
    paddingVertical: RS(10),
    borderRadius: RS(12),
  },

  detailsTitleSection: {
    padding: RS(20),
    backgroundColor: '#fff',
  },

  detailsCarTitle: {
    fontSize: RF(26),
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
    marginBottom: RS(8),
  },

  detailsCarSubtitle: {
    fontSize: RF(16),
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: RS(16),
  },

  quickInfoBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: RS(10),
    marginBottom: RS(16),
  },

  infoBadge: {
    backgroundColor: '#f8f9fc',
    paddingHorizontal: RS(14),
    paddingVertical: RS(8),
    borderRadius: RS(10),
    borderWidth: 1,
    borderColor: '#e6e8f3',
  },

  infoBadgeText: {
    fontSize: RF(13),
    fontWeight: '700',
    color: '#262a4f',
  },

  locationInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RS(8),
  },

  locationInfoText: {
    fontSize: RF(14),
    fontWeight: '600',
    color: '#1F2937',
  },

  testDriveAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RS(8),
    marginBottom: RS(16),
  },

  testDriveText: {
    fontSize: RF(14),
    fontWeight: '600',
    color: '#10B981',
  },

  inspectionReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RS(8),
    paddingVertical: RS(12),
    paddingHorizontal: RS(16),
    backgroundColor: '#f8f9fc',
    borderRadius: RS(12),
    borderWidth: 1,
    borderColor: '#e6e8f3',
  },

  inspectionReportText: {
    fontSize: RF(14),
    fontWeight: '700',
    color: '#a9acd6',
  },

  priceTimerSection: {
    padding: RS(20),
    backgroundColor: '#fff',
    marginTop: RS(8),
  },

  priceBox: {
    backgroundColor: '#f8f9fc',
    padding: RS(20),
    borderRadius: RS(16),
    borderWidth: 2,
    borderColor: '#e6e8f3',
    alignItems: 'center',
  },

  priceLabel: {
    fontSize: RF(22),
    fontWeight: '800',
    color: '#262a4f',
    marginBottom: RS(4),
  },

  priceSubLabel: {
    fontSize: RF(11),
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: RS(12),
  },

  timerLabelBig: {
    fontSize: RF(32),
    fontWeight: '800',
    color: '#a9acd6',
    letterSpacing: 1,
  },

  knowYourCarSection: {
    padding: RS(20),
    backgroundColor: '#fff',
    marginTop: RS(8),
  },

  sectionTitle: {
    fontSize: RF(20),
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: RS(20),
  },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  detailItem: {
    width: '31%',
    alignItems: 'center',
    marginBottom: RS(24),
  },

  detailIconCircle: {
    width: RS(56),
    height: RS(56),
    borderRadius: RS(28),
    backgroundColor: '#f8f9fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: RS(10),
    borderWidth: RS(2),
    borderColor: '#e6e8f3',
  },

  detailLabel: {
    fontSize: RF(11),
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: RS(4),
  },

  detailValue: {
    fontSize: RF(13),
    fontWeight: '800',
    color: '#1F2937',
  },

  topFeaturesSection: {
    padding: RS(20),
    backgroundColor: '#fff',
    marginTop: RS(8),
  },

  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  featureItem: {
    width: '31%',
    alignItems: 'center',
    marginBottom: RS(24),
    backgroundColor: '#f8f9fc',
    padding: RS(16),
    borderRadius: RS(12),
    borderWidth: 1,
    borderColor: '#e6e8f3',
  },

  featureText: {
    fontSize: RF(11),
    fontWeight: '700',
    color: '#1F2937',
    marginTop: RS(8),
    textAlign: 'center',
  },

  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: RS(16),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: RS(12),
    elevation: 10,
  },

  placeBidButtonLarge: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: RS(16),
    borderRadius: RS(14),
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeBidButtonText: {
    color: '#fff',
    fontSize: RF(16),
    fontWeight: '800',
  },

  interestedButton: {
    flex: 1,
    backgroundColor: '#FCD34D',
    paddingVertical: RS(16),
    borderRadius: RS(14),
    alignItems: 'center',
    justifyContent: 'center',
  },

  interestedButtonText: {
    color: '#1F2937',
    fontSize: RF(16),
    fontWeight: '800',
  },

  locationTestDriveRow: {
  marginBottom: RS(12),
},

});
