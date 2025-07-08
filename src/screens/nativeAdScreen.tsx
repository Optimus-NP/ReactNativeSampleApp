// File: js/screens/NativeAdScreen.tsx

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
  NativeAdEvent,
  NativeAdView,
  HeadlineView,
  BodyView,
  IconView,
  AdvertiserView,
  CallToActionView,
  testPlacementNames,
} from 'adster-react-native-client';
import { showToastMessage } from '../utils/showToastMessage';
import { Button } from '../components/button';

export const NativeAdScreen = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  // State
  const [loadError, setLoadError] = useState(false);
  const [toastMessages, setToastMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Key to force remount
  const [adKey, setAdKey] = useState(0);
  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Reset state and bump key
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
        title="Native Ad Screen"
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
          <ActivityIndicator size="large" color="#0000ff" />
        )}

        <NativeAdView
          key={`native-${adKey}`}
          placementName={testPlacementNames.native}
          style={styles.nativeAdWrapper}
          onNativeAdLoaded={(event: NativeAdEvent) => {
            const msg = event.nativeEvent.message;
            console.log('Native Ad Loaded:', event.nativeEvent);
            showToastMessage('Native Ad loaded');
            setToastMessages((prev) => [...prev, msg]);
            setLoadError(false);
            setLoading(false);
            setRefreshing(false);
          }}
          onAdFailedToLoad={(event: NativeAdEvent) => {
            const err = event.nativeEvent.error;
            console.error('Native Ad failed to load:', err);
            showToastMessage('Native Ad failed to load');
            setToastMessages((prev) => [
              ...prev,
              `Load failure: ${err}`,
            ]);
            setLoadError(true);
            setLoading(false);
            setRefreshing(false);
          }}
          onAdClicked={(event: NativeAdEvent) => {
            const msg = event.nativeEvent.message;
            console.log('Native Ad Clicked:', msg);
            showToastMessage('Native Ad clicked');
            setToastMessages((prev) => [...prev, msg]);
          }}
          onAdImpression={(event: NativeAdEvent) => {
            const msg = event.nativeEvent.message;
            console.log('Native Ad Impression:', msg);
            showToastMessage('Native Ad impression');
            setToastMessages((prev) => [...prev, msg]);
          }}
        >
          <View style={styles.nativeAdContainer}>
            <View style={styles.iconHeadingRow}>
              <IconView style={styles.icon} />
              <View style={styles.textBlock}>
                <HeadlineView style={styles.headline} />
                <BodyView numberOfLines={3} style={styles.body} />
                <AdvertiserView style={styles.advertiser} />
              </View>
            </View>
            <CallToActionView
              style={styles.cta}
              allCaps
              textStyle={styles.ctaText}
            />
          </View>
        </NativeAdView>

        {loadError && (
          <Button
            title="Reload Native Ad"
            onPress={resetAndReload}
          />
        )}

        {toastMessages.map((msg, i) => (
          <Text key={i} style={styles.toastText}>
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
  nativeAdWrapper: {
    backgroundColor: '#E2F2FF',
    borderRadius: 20,
    width: '90%',
    marginBottom: 20,
  },
  nativeAdContainer: {
    width: '100%',
    padding: 10,
  },
  iconHeadingRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  icon: {
    width: 100,
    height: 100,
  },
  textBlock: {
    flex: 1,
    paddingHorizontal: 6,
    gap: 6,
    marginLeft: 6,
  },
  headline: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'black',
  },
  body: {
    fontSize: 12,
    color: 'black',
  },
  advertiser: {
    fontSize: 10,
    color: 'gray',
  },
  cta: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    width: '100%',
    backgroundColor: '#43bce9',
    borderRadius: 10,
    minHeight: 40,
  },
  ctaText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  toastText: {
    fontSize: 15,
    color: 'black',
    width: '80%',
    textAlign: 'center',
  },
});
