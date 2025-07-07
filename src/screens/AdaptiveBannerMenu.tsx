import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/header';
import { Button } from '../components/button';
import { RootStackParamList } from '../navigation/RootNavigation';

type Nav = NativeStackNavigationProp<
  RootStackParamList,
  'AdaptiveBannerMenu'
>;

export const AdaptiveBannerMenu = ({ navigation }: { navigation: Nav }) => (
  <View style={styles.container}>
    <Header title="Choose Adaptive Banner Type" />
    <Button
      title="Inline Adaptive Banner"
      onPress={() =>
        navigation.navigate('AdaptiveBannerAdScreen', { mode: 'inline' })
      }
    />
    <Button
      title="Current-Orientation Inline Banner"
      onPress={() =>
        navigation.navigate('AdaptiveBannerAdScreen', { mode: 'orientation' })
      }
    />
    <Button
      title="Anchored Adaptive Banner"
      onPress={() =>
        navigation.navigate('AdaptiveBannerAdScreen', { mode: 'anchored' })
      }
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
});