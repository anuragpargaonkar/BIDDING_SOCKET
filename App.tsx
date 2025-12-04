// App.tsx
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/components/appnavigator';
import { WebSocketProvider } from './src/utility/WebSocketConnection';
import { WishlistProvider } from './src/context/WishlistContext';

const App = () => {
  return (
    <WishlistProvider>
      <WebSocketProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#051A2F" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </WebSocketProvider>
    </WishlistProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#051A2F',
     paddingTop: 7 // match your app theme color
  },
});

export default App;
