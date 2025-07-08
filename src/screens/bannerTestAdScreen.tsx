// File: js/screens/BannerTestAdScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Header } from '../components/header';
import { NavigationProp } from '@react-navigation/native';
import { BannerAdEvent, BannerAdView } from 'adster-react-native-client';
import { showToastMessage } from '../utils/showToastMessage';
import { Button } from '../components/button';

export const BannerTestAdScreen = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  const [loadError, setLoadError] = useState(false);
  const [toastMessages, setToastMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adKey, setAdKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Resets state and bumps key to remount <BannerAdView>
  const resetAndReload = useCallback(() => {
    setLoadError(false);
    setToastMessages([]);
    setLoading(true);
    setAdKey((k) => k + 1);
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    resetAndReload();
  }, [resetAndReload]);

  return (
    <View style={styles.container}>
      <Header
        title="Banner Test 320X50"
        back
        onPressBack={() =>
          navigation.canGoBack() && navigation.goBack()
        }
      />

      <ScrollView
        contentContainerStyle={styles.viewContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {loading && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
          />
        )}

        <BannerAdView
          key={`banner-${adKey}`}
          bannerContainerStyle={styles.bannerContainer}
          placementName="Adster_Banner_Test"
          onAdLoaded={(event: BannerAdEvent) => {
            const { message } = event.nativeEvent;
            showToastMessage('Banner Ad loaded successfully');
            setToastMessages((prev) => [...prev, message]);
            setLoadError(false);
            setLoading(false);
            setRefreshing(false);
          }}
          onAdLoadFailure={(event: BannerAdEvent) => {
            const { error } = event.nativeEvent;
            showToastMessage('Banner Ad failed to load');
            setToastMessages((prev) => [
              ...prev,
              `Load failure: ${error}`,
            ]);
            setLoadError(true);
            setLoading(false);
            setRefreshing(false);
          }}
          onAdClicked={(event: BannerAdEvent) => {
            const { message } = event.nativeEvent;
            showToastMessage('Banner Ad clicked');
            setToastMessages((prev) => [...prev, message]);
          }}
          onAdImpression={(event: BannerAdEvent) => {
            const { message } = event.nativeEvent;
            showToastMessage('Banner Ad impression');
            setToastMessages((prev) => [...prev, message]);
          }}
        />

        {loadError && (
          <Button
            title="Reload Banner Ad"
            onPress={resetAndReload}
          />
        )}

        {toastMessages.map((msg, idx) => (
          <Text
            key={idx}
            style={styles.toastMessageStyle}
          >
            {msg}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  viewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 20,
  },
  bannerContainer: {
    marginVertical: 20,
    width: 320,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
  },
  toastMessageStyle: {
    fontSize: 15,
    color: 'black',
    width: '80%',
    textAlign: 'center',
  },
});
