// File: js/screens/UnifiedAdScreen.tsx

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
  UnifiedAdView,
  UnifiedAdEvent,
  testPlacementNames,
  IconView,
  HeadlineView,
  BodyView,
  AdvertiserView,
  CallToActionView,
} from 'adster-react-native-client';
import { showToastMessage } from '../utils/showToastMessage';
import { Button } from '../components/button';

export const UnifiedAdScreen = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  // state
  const [loadError, setLoadError] = useState(false);
  const [toastMessages, setToastMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // to force remount/reload
  const [adKey, setAdKey] = useState(0);

  // pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // reset & reload
  const resetAndReload = useCallback(() => {
    setLoadError(false);
    setToastMessages([]);
    setLoading(true);
    setAdKey((k) => k + 1);
  }, []);

  // pull‑to‑refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    resetAndReload();
  }, [resetAndReload]);

  return (
    <View style={styles.container}>
      <Header
        title="Unified Ad Screen"
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

        <UnifiedAdView
          key={`unified-${adKey}`}
          placementName={testPlacementNames.unified}
          nativeContainerStyle={styles.nativeAdWrapperContainer}
          bannerContainerStyle={styles.bannerContainer}
          style={styles.unifiedAdStyle}
          onBannerAdLoaded={(event: UnifiedAdEvent) => {
            const msg = event.nativeEvent.message;
            console.log('Unified Banner Ad loaded:', msg);
            showToastMessage('Unified Banner Ad loaded');
            setToastMessages((prev) => [...prev, msg]);
            setLoadError(false);
            setLoading(false);
            setRefreshing(false);
          }}
          onNativeAdLoaded={(event: UnifiedAdEvent) => {
            const msg = event.nativeEvent.message;
            console.log('Unified Native Ad loaded:', msg);
            showToastMessage('Unified Native Ad loaded');
            setToastMessages((prev) => [...prev, msg]);
            setLoadError(false);
            setLoading(false);
            setRefreshing(false);
          }}
          onFailure={(event: UnifiedAdEvent) => {
            const err = event.nativeEvent.error;
            console.error('Unified Ad failed to load:', err);
            showToastMessage('Unified Ad failed to load');
            setToastMessages((prev) => [
              ...prev,
              `Unified load failure: ${err}`,
            ]);
            setLoadError(true);
            setLoading(false);
            setRefreshing(false);
          }}
          onAdClicked={(event: UnifiedAdEvent) => {
            const msg = event.nativeEvent.message;
            console.log('Unified Ad clicked:', msg);
            showToastMessage('Unified Ad clicked');
            setToastMessages((prev) => [...prev, msg]);
          }}
          onAdImpression={(event: UnifiedAdEvent) => {
            const msg = event.nativeEvent.message;
            console.log('Unified Ad impression:', msg);
            showToastMessage('Unified Ad impression');
            setToastMessages((prev) => [...prev, msg]);
          }}
        >
          {/* Native layout */}
          <View style={styles.nativeAdContainer}>
            <View style={styles.iconHeadingRowContainer}>
              <IconView style={styles.iconViewStyle} />
              <View style={styles.headingBodyContainer}>
                <HeadlineView style={styles.headingStyle} />
                <BodyView numberOfLines={3} style={styles.bodyStyle} />
                <AdvertiserView style={styles.advertiserStyle} />
              </View>
            </View>
            <CallToActionView
              style={styles.ctaContainer}
              allCaps
              textStyle={styles.ctaTextStyle}
            />
          </View>
        </UnifiedAdView>

        {loadError && (
          <Button
            title="Reload Unified Ad"
            onPress={resetAndReload}
          />
        )}

        {toastMessages.map((message, idx) => (
          <Text key={idx} style={styles.toastMessageStyle}>
            {message}
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
  nativeAdWrapperContainer: {
    backgroundColor: '#E2F2FF',
    borderRadius: 20,
    width: '90%',
    marginBottom: 20,
  },
  bannerContainer: {
    marginVertical: 20,
    width: '90%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
  },
  unifiedAdStyle: {
    marginVertical: 20,
    width: '100%',
  },
  nativeAdContainer: {
    width: '100%',
    padding: 10,
  },
  iconViewStyle: {
    width: 100,
    height: 100,
  },
  iconHeadingRowContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  headingBodyContainer: {
    paddingHorizontal: 6,
    flex: 1,
    gap: 6,
    marginLeft: 6,
  },
  headingStyle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'black',
  },
  bodyStyle: {
    fontSize: 12,
    color: 'black',
  },
  advertiserStyle: {
    fontSize: 10,
    color: 'gray',
  },
  ctaContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    width: '100%',
    backgroundColor: '#43bce9',
    borderRadius: 10,
    minHeight: 40,
  },
  ctaTextStyle: {
    fontSize: 15,
    flexWrap: 'wrap',
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  toastMessageStyle: {
    fontSize: 15,
    color: 'black',
    width: '80%',
    textAlign: 'center',
  },
});
