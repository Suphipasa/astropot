import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile } from '../types';
import { AIAnalysisResult } from '../services/ai';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HomeScreenProps {
  userProfile: UserProfile;
  aiAnalysis: AIAnalysisResult | null;
  onReset: () => void;
}

export default function HomeScreen({ userProfile, aiAnalysis, onReset }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.headerTitle}>ASTROPOT</Text>
        <Text style={styles.headerSubtitle}>Dobra Bestie Modu</Text>

        {/* KOZMİK KİMLİK KARTI */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.card}>
          <Text style={styles.cardTitle}>KOZMİK KİMLİK 🆔</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>İsim:</Text>
            <Text style={styles.infoValue}>{userProfile.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Meslek / İlişki:</Text>
            <Text style={styles.infoValue}>{userProfile.job} / {userProfile.relationship}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.planetRow}>
            <View style={styles.planetItem}>
              <Text style={styles.planetIcon}>☀️</Text>
              <Text style={styles.planetLabel}>GÜNEŞ</Text>
              <Text style={styles.planetValue}>{userProfile.chart?.sunSign}</Text>
            </View>
            <View style={styles.planetItem}>
              <Text style={styles.planetIcon}>🌙</Text>
              <Text style={styles.planetLabel}>AY</Text>
              <Text style={styles.planetValue}>{userProfile.chart?.moonSign}</Text>
            </View>
            <View style={styles.planetItem}>
              <Text style={styles.planetIcon}>🏹</Text>
              <Text style={styles.planetLabel}>YÜKSELEN</Text>
              <Text style={styles.planetValue}>{userProfile.chart?.risingSign}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* AI ROAST KARTI */}
        {aiAnalysis ? (
          <LinearGradient colors={['#4c1d95', '#2e1065']} style={styles.roastCard}>
            <Text style={styles.roastTitle}>{aiAnalysis.title.toUpperCase()}</Text>
            <Text style={styles.roastBody}>"{aiAnalysis.roast}"</Text>
            <View style={styles.adviceBox}>
              <Text style={styles.adviceLabel}>💡 TAVSİYE:</Text>
              <Text style={styles.adviceText}>{aiAnalysis.advice}</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.loadingCard}>
            <Text style={{color:'#fff'}}>Analiz yükleniyor veya yapılamadı...</Text>
          </View>
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
          <Text style={styles.resetText}>⚙️ Ayarları Sıfırla</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// STYLES (App.tsx'ten kopyalandı)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', letterSpacing: 2, marginTop: 10 },
  headerSubtitle: { color: '#A855F7', fontSize: 14, textAlign: 'center', marginBottom: 20, fontStyle: 'italic' },
  card: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  cardTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: '#888' },
  infoValue: { color: '#fff', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 15 },
  planetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  planetItem: { alignItems: 'center', flex: 1 },
  planetIcon: { fontSize: 24, marginBottom: 5 },
  planetLabel: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  planetValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  roastCard: { borderRadius: 20, padding: 25, marginBottom: 30, borderWidth: 1, borderColor: '#A855F7' },
  roastTitle: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  roastBody: { color: '#e9d5ff', fontSize: 16, textAlign: 'center', fontStyle: 'italic', marginBottom: 15 },
  adviceBox: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 10 },
  adviceLabel: { color: '#A855F7', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  adviceText: { color: '#fff', fontWeight: 'bold' },
  loadingCard: { padding: 20, alignItems: 'center' },
  resetBtn: { padding: 15, backgroundColor: '#111', borderRadius: 10, alignItems: 'center', marginBottom: 50 },
  resetText: { color: '#666', fontWeight: 'bold' }
});