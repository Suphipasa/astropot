import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DailyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📅 Günlük Yorum Yakında...</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 20 }
});