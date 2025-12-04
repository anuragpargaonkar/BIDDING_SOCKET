import {StyleSheet} from 'react-native';
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 
  keyboardAvoidingView: {
    flex: 1,
  },
 
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // optional: centers vertically if content is short
  },
 
  topCurvedSection: {
    paddingTop: 100, // Reduced slightly since we can scroll now
    paddingBottom: 30,
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
    backgroundColor: '#fff',
    borderRadius: 40,
    marginHorizontal: 20,
    marginBottom: 50, // Reduced from 140 to allow better scroll access
    paddingTop: 40,
    paddingBottom: 40, // Added padding bottom for internal breathing room
    paddingHorizontal: 30,
    elevation: 15,
 
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
 
  content: {
    // flex: 1, // Removed flex: 1 to allow container to size based on children
  },
 
  formGroup: {
    marginBottom: 20,
  },
 
  label: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
 
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: '#333',
  },
 
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
 
  eyeIconFront: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
 
  passwordInput: {
    paddingLeft: 10,
    flex: 1,
  },
 
  forgotContainer: {
    alignItems: 'flex-end',
    marginTop: -10,
    marginBottom: 15,
  },
 
  forgotText: {
    color: '#61AFFE',
    fontSize: 14,
    fontWeight: '500',
  },
 
  loginButton: {
    backgroundColor: '#61AFFE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
 
    shadowColor: '#61AFFE',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
 
  loginButtonDisabled: {
    opacity: 0.6,
  },
 
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
});
 
export default styles;
 