// File: js/screens/AdaptiveBannerAdScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigation';
import { Header } from '../components/header';
import { AdaptiveBannerAd } from '../components/AdaptiveBannerAd';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'AdaptiveBannerAdScreen'
>;

const screenWidthDp = Dimensions.get('window').width / PixelRatio.get();

export default function AdaptiveBannerAdScreen({
  route,
  navigation,
}: Props) {
  const initialMode = route.params?.mode ?? 'anchored';
  const [mode, setMode] = useState<'inline' | 'anchored'>(initialMode);
  const placementId = 'adaptive_banner_test';
  const inlineWidthDp = mode === 'inline' ? 320 : undefined;

  const [height, setHeight] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerKey, setBannerKey] = useState(0);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');

  useEffect(() => {
    setLoaded(false);
    setError(null);
    setHeight(0);
    if (mode === 'anchored') {
      const random = Math.random();
      setPosition(random < 0.5 ? 'top' : 'bottom');
    }
  }, [mode, bannerKey]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLoaded(false);
    setError(null);
    setBannerKey((k) => k + 1);
  }, []);

  const renderBanner = () => (
    <View
      style={[
        styles.adWrapper,
        mode === 'inline' && {
          width: `${(inlineWidthDp! / screenWidthDp) * 100}%`,
          alignSelf: 'center',
        },
        { height },
      ]}
    >
      <AdaptiveBannerAd
        key={bannerKey}
        placementId={placementId}
        mode={mode}
        inlineWidthDp={inlineWidthDp}
        style={{ width: '100%', height }}
        onAdLoaded={(e) => {
          setHeight(e.nativeEvent.adHeight);
          setLoaded(true);
          setRefreshing(false);
        }}
        onAdFailedToLoad={(e) => {
          const msg = e.nativeEvent.error;
          if (mode === 'inline' && msg.includes('No fill')) {
            setMode('anchored');
          } else {
            setError(msg);
            setRefreshing(false);
          }
        }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <Header
          title={`Adaptive Banner (${mode})`}
          back
          onPressBack={() => navigation.goBack()}
        />
      </View>

      {/* Anchored ad at top */}
      {mode === 'anchored' && position === 'top' && renderBanner()}

      {/* Scrollable content with padding for header */}
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {!loaded && !error && (
          <ActivityIndicator style={styles.spinner} />
        )}
        {error && (
          <Text style={styles.errorText}>{String(error)}</Text>
        )}
        {mode === 'inline' && renderBanner()}
      </ScrollView>

      {/* Anchored ad at bottom */}
      {mode === 'anchored' && position === 'bottom' && renderBanner()}
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  spinner: {
    marginTop: 20,
  },
  adWrapper: {
    width: '100%',
    overflow: 'visible',
    marginTop: 16,
    minHeight: 50,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 12,
  },
});
