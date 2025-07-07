// File: navigation/RootNavigation.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SdkLoadingScreen } from '../screens/sdkLoadingScreen';
import { HomeScreen } from '../screens/homeScreen';
import { BannerAdScreen } from '../screens/bannerAdScreen';
import { BannerTestAdScreen } from '../screens/bannerTestAdScreen';
import { BannerNewAdScreen } from '../screens/bannerNewAdScreen';
import { NativeAdScreen } from '../screens/nativeAdScreen';
import { UnifiedAdScreen } from '../screens/unifiedAdScreen';
import { InterstitialAdScreen } from '../screens/interstitialAdScreen';
import { RewardedAdScreen } from '../screens/rewardedAdScreen';
import { AdaptiveBannerMenu } from '../screens/AdaptiveBannerMenu';
import AdaptiveBannerAdScreen from '../screens/AdaptiveBannerAdScreen';

export type RootStackParamList = {
  SdkLoadingScreen: undefined;
  HomeScreen: undefined;
  BannerAdScreen: undefined;
  BannerTestAdScreen: undefined;
  BannerNewAdScreen: undefined;
  NativeAdScreen: undefined;
  UnifiedAdScreen: undefined;
  InterstitialAdScreen: undefined;
  RewardedAdScreen: undefined;
  AdaptiveBannerMenu: undefined;
  // Marked mode as optional since we provide an initialParam
  AdaptiveBannerAdScreen: { mode?: 'inline' | 'orientation' | 'anchored' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigation = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="SdkLoadingScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="SdkLoadingScreen"
        component={SdkLoadingScreen}
      />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="BannerAdScreen" component={BannerAdScreen} />
      <Stack.Screen
        name="BannerTestAdScreen"
        component={BannerTestAdScreen}
      />
      <Stack.Screen
        name="BannerNewAdScreen"
        component={BannerNewAdScreen}
      />
      <Stack.Screen name="NativeAdScreen" component={NativeAdScreen} />
      <Stack.Screen name="UnifiedAdScreen" component={UnifiedAdScreen} />
      <Stack.Screen
        name="InterstitialAdScreen"
        component={InterstitialAdScreen}
      />
      <Stack.Screen
        name="RewardedAdScreen"
        component={RewardedAdScreen}
      />
      <Stack.Screen
        name="AdaptiveBannerMenu"
        component={AdaptiveBannerMenu}
      />
      <Stack.Screen
        name="AdaptiveBannerAdScreen"
        component={AdaptiveBannerAdScreen}
        // Provide a default mode so route.params.mode is never undefined
        initialParams={{ mode: 'anchored' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);