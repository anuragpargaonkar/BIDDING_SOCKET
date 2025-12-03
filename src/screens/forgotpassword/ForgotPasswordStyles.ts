// ForgotPasswordStyles.ts - Styles moved from ForgotPassword.tsx

import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {flex: 1},

  topCurvedSection: {
    paddingTop: 150,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 150,
    height: 100,
  },

  logoTitle: {
    marginBottom: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },

  cardContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 40,
    marginHorizontal: 20,
    marginBottom: 170,
    paddingTop: 40,
    paddingHorizontal: 30,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  content: {flex: 1, justifyContent: 'flex-start'},

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#051A2F',
    textAlign: 'center',
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
    fontWeight: '500',
  },

  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    color: '#333',
    fontSize: 15,
  },

  button: {
    backgroundColor: '#1B4F72',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1B4F72',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  buttonDisabled: {opacity: 0.6},

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },

  backButton: {
    marginTop: 25,
    alignItems: 'center',
  },

  backText: {
    color: '#051A2F',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default styles;
