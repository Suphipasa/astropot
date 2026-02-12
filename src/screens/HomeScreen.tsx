import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native'; // Alert eklendiimport { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Haptics from 'expo-haptics'; // ✅ HAPTICS EKLENDİ

import { UserProfile } from '../types';
import { AIAnalysisResult } from '../services/ai';
import { shareContent } from '../services/sharing';
import { CrystalLoader } from '../components/CrystalLoader'; // ✅ KRİSTAL KÜRE EKLENDİ

interface HomeScreenProps {
  userProfile: UserProfile;
  aiAnalysis: AIAnalysisResult | null;
  onReset: () => void;
}

export default function HomeScreen({ userProfile, aiAnalysis, onReset }: HomeScreenProps) {
  const viewShotRef = useRef(null);

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Tok Titreşim
    shareContent(viewShotRef);
  };

  const handleResetPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert(
      "Emin misin?",
      "Tüm verilerin silinecek ve en başa döneceksin. Bu işlemin geri dönüşü yok!",
      [
        {
          text: "Vazgeç",
          style: "cancel",
          onPress: () => console.log("Reset iptal edildi") // Hiçbir şey yapma, geri dönmüş olur
        },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: onReset // App.tsx'teki sıfırlama fonksiyonunu çalıştır
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.headerTitle}>ASTROPOT</Text>
        <Text style={styles.headerSubtitle}>Dobra Bestie Modu</Text>

        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1 }}
          style={{ width: '100%' }}
        >
          <View collapsable={false} style={{ padding: 5, backgroundColor: '#000' }}>

            {/* 1. KOZMİK KİMLİK KARTI (HEMEN GÖRÜNÜR) */}
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

            {/* 2. AI ROAST KARTI veya KRİSTAL KÜRE */}
            {aiAnalysis ? (
              <LinearGradient colors={['#4c1d95', '#2e1065']} style={styles.roastCard}>
                <Text style={styles.roastTitle}>{aiAnalysis.title.toUpperCase()}</Text>

                {/* DÜZ METİN (Typewriter Kaldırıldı) */}
                <Text style={styles.roastBody}>
                  "{aiAnalysis.roast}"
                </Text>

                <View style={styles.adviceBox}>
                  <Text style={styles.adviceLabel}>💡 TAVSİYE:</Text>
                  <Text style={styles.adviceText}>{aiAnalysis.advice}</Text>
                </View>

                <Text style={{ color: '#aaa', textAlign: 'right', marginTop: 10, fontSize: 10 }}>Astropot 🔮</Text>
              </LinearGradient>
            ) : (
              // ✅ VERİ GELENE KADAR KRİSTAL KÜRE DÖNSÜN
              <View style={styles.loaderContainer}>
                <CrystalLoader text="Kozmik kimliğin analiz ediliyor..." />
              </View>
            )}
          </View>
        </ViewShot>

        {aiAnalysis && (
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <LinearGradient
              colors={['#833AB4', '#FD1D1D', '#FCB045']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.shareGradient}
            >
              <Text style={styles.shareBtnText}>📸 Kartımı Paylaş</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={handleResetPress}>
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

  roastCard: { borderRadius: 20, padding: 25, marginBottom: 10, borderWidth: 1, borderColor: '#A855F7', shadowColor: '#A855F7', shadowOpacity: 0.3, shadowRadius: 10 },
  roastTitle: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 15, lineHeight: 28 },
  // Metin stili güncellendi (Typewriter kalktığı için)
  roastBody: { color: '#e9d5ff', fontSize: 16, lineHeight: 24, textAlign: 'center', fontStyle: 'italic', marginBottom: 15 },

  adviceBox: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 10 },
  adviceLabel: { color: '#A855F7', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  adviceText: { color: '#fff', fontWeight: 'bold' },

  // Loader için sabit yükseklik veriyoruz ki küre güzel görünsün
  loaderContainer: { height: 300, marginBottom: 20, borderRadius: 20, overflow: 'hidden' },

  shareBtn: { marginTop: 10, marginBottom: 30, alignItems: 'center' },
  shareGradient: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resetBtn: { padding: 15, backgroundColor: '#111', borderRadius: 10, alignItems: 'center', marginBottom: 100 },
  resetText: { color: '#666', fontWeight: 'bold' }
});