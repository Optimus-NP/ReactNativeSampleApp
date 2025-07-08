// File: js/screens/BannerAdScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Header } from '../components/header';
import { NavigationProp } from '@react-navigation/native';
import {
  BannerAdEvent,
  BannerAdView,
  testPlacementNames,
} from 'adster-react-native-client';
import { showToastMessage } from '../utils/showToastMessage';
import { Button } from '../components/button';

export const BannerAdScreen = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  // track errors & toast messages
  const [loadError, setLoadError] = useState(false);
  const [toastMessages, setToastMessages] = useState<string[]>([]);
  // loading spinner
  const [loading, setLoading] = useState(true);
  // key to force remount/reload
  const [adKey, setAdKey] = useState(0);
  // pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // common reset logic
  const resetAndReload = () => {
    setLoadError(false);
    setToastMessages([]);
    setLoading(true);
    setAdKey((k) => k + 1);
  };

  // pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    resetAndReload();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Banner Ad Screen"
        back
        onPressBack={() => navigation.canGoBack() && navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.viewContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && <ActivityIndicator size="large" color="#0000ff" />}

        <BannerAdView
          key={`banner-${adKey}`}
          bannerContainerStyle={styles.bannerContainer}
          placementName={testPlacementNames.banner}
          onAdLoaded={(event: BannerAdEvent) => {
            const message = event.nativeEvent.message;
            console.log('Ad loaded:', message);
            showToastMessage('Banner Ad loaded successfully');
            setToastMessages((prev) => [...prev, message]);
            setLoadError(false);
            setLoading(false);
            setRefreshing(false);
          }}
          onAdLoadFailure={(event: BannerAdEvent) => {
            const error = event.nativeEvent.error;
            console.error('Ad failed to load:', error);
            showToastMessage('Banner Ad failed to load');
            setToastMessages((prev) => [
              ...prev,
              'Load failure: ' + error,
            ]);
            setLoadError(true);
            setLoading(false);
            setRefreshing(false);
          }}
          onAdClicked={(event: BannerAdEvent) => {
            const message = event.nativeEvent.message;
            console.log('Ad clicked:', message);
            showToastMessage('Banner Ad clicked');
            setToastMessages((prev) => [...prev, message]);
          }}
          onAdImpression={(event: BannerAdEvent) => {
            const message = event.nativeEvent.message;
            console.log('Ad impression:', message);
            showToastMessage('Banner Ad impression');
            setToastMessages((prev) => [...prev, message]);
          }}
        />

        {loadError && (
          <Button title="Reload Banner Ad" onPress={resetAndReload} />
        )}

        {toastMessages.map((msg, idx) => (
          <Text key={idx} style={styles.toastMessage}>
            {msg}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 20,
  },
  bannerContainer: {
    marginVertical: 20,
    width: '90%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
  },
  toastMessage: {
    fontSize: 15,
    color: 'black',
    width: '80%',
    textAlign: 'center',
  },
});
