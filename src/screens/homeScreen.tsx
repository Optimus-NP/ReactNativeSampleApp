// File: js/screens/homeScreen.tsx

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Button } from '../components/button';
import { Header } from '../components/header';
import { NavigationProp } from '@react-navigation/native';
import { showToastMessage } from '../utils/showToastMessage';

export const HomeScreen = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Home Screen" />
      <ScrollView
        contentContainerStyle={styles.buttonsContainer}
        showsVerticalScrollIndicator={false}
      >
        <Button
          title="Banner Ad"
          onPress={() => navigation.navigate('BannerAdScreen')}
        />
        <Button
          title="Banner Ad 320X50"
          onPress={() => navigation.navigate('BannerTestAdScreen')}
        />
        <Button
          title="Banner Ad 300X250"
          onPress={() => navigation.navigate('BannerNewAdScreen')}
        />
        <Button
          title="Native Ad"
          onPress={() => navigation.navigate('NativeAdScreen')}
        />
        <Button
          title="Unified Ad"
          onPress={() => navigation.navigate('UnifiedAdScreen')}
        />
        <Button
          title="Interstitial Ad"
          onPress={() => navigation.navigate('InterstitialAdScreen')}
        />
        <Button
          title="Rewarded Ad"
          onPress={() => navigation.navigate('RewardedAdScreen')}
        />

        {/* Added two buttons to explicitly test different adaptive banner modes */}
        <Button
          title="Adaptive Banner Ad (Anchored)"
          onPress={() => {
            showToastMessage('Opening Adaptive Banner (Anchored) screen...');
            navigation.navigate('AdaptiveBannerAdScreen', { mode: 'anchored' });
          }}
        />
        <Button
          title="Adaptive Banner Ad (Inline)"
          onPress={() => {
            showToastMessage('Opening Adaptive Banner (Inline) screen...');
            navigation.navigate('AdaptiveBannerAdScreen', { mode: 'inline' });
          }}
        />
        <Button
          title="Adaptive Banner Ad (Orientation)"
          onPress={() => {
            showToastMessage('Opening Adaptive Banner (Orientation) screen...');
            navigation.navigate('AdaptiveBannerAdScreen', { mode: 'orientation' });
          }}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonsContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});