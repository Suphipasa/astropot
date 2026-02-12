import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface CrystalLoaderProps {
  text?: string;
}

export const CrystalLoader = ({ text = "Yıldızlarla bağlantı kuruluyor..." }: CrystalLoaderProps) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/astrology.json')} // Dosya isminin doğru olduğundan emin ol
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  lottie: { width: 250, height: 250 },
  text: { color: '#A855F7', marginTop: 20, fontSize: 16, fontWeight: 'bold', fontStyle: 'italic' }
});