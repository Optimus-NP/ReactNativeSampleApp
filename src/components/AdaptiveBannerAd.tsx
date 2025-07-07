import { requireNativeComponent, ViewProps } from 'react-native';

interface Props extends ViewProps {
  placementId: string;
  mode?: 'inline' | 'anchored' | 'orientation';
  inlineWidthDp?: number; // NEW prop clearly defined
  onAdLoaded?: (event: any) => void;
  onAdFailedToLoad?: (event: any) => void;
}

export const AdaptiveBannerAd = requireNativeComponent<Props>('RNBannerAdView');