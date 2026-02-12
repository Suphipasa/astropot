import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Haptics from 'expo-haptics'; // ✅ HAPTICS EKLENDİ

import { UserProfile } from '../types';
import { analyzeMatch, MatchResult } from '../services/ai';
import { shareContent } from '../services/sharing';
import { CrystalLoader } from '../components/CrystalLoader'; // ✅ KRİSTAL KÜRE EKLENDİ

// Basit Burç Listesi
const ZODIAC_SIGNS = [
  "Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak",
  "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"
];

// App.tsx'ten userProfile prop'u alması gerekiyor
interface MatchScreenProps {
  userProfile: UserProfile;
}

export default function MatchScreen({ userProfile }: MatchScreenProps) {
  const [partnerName, setPartnerName] = useState("");
  const [partnerSign, setPartnerSign] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  const viewShotRef = useRef(null);

  const handleMatch = async () => {
    // Validasyon Hatası Titreşimi
    if (!partnerName || !partnerSign) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Eksik Bilgi", "Partnerinin adını ve burcunu girmeden nasıl gömeyim?");
      return;
    }

    Keyboard.dismiss();

    // İşlem Başlangıcı - Orta Titreşim
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const data = await analyzeMatch(userProfile, partnerName, partnerSign);
      setResult(data);

      // Başarı Titreşimi
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Hata Titreşimi
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Yıldızlar şu an cevap vermiyor.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Hafif Titreşim
    setResult(null);
    setPartnerName("");
    setPartnerSign("");
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Tok Titreşim
    shareContent(viewShotRef);
  };

  // --- LOADING EKRANI (KRİSTAL KÜRE) ---
  if (loading) {
    return <CrystalLoader text="Aşk haritası çıkarılıyor..." />;
  }

  // --- SONUÇ EKRANI ---
  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.centerContent}>
          <Text style={styles.headerTitle}>UYUM RAPORU 💘</Text>

          <ViewShot
            ref={viewShotRef}
            options={{ format: "png", quality: 1 }}
            style={{ width: '100%' }}
          >
            <View collapsable={false} style={{ padding: 10, backgroundColor: '#000', alignItems: 'center' }}>
              <LinearGradient
                colors={result.score > 50 ? ['#059669', '#047857'] : ['#DC2626', '#991B1B']}
                style={styles.scoreCard}
              >
                <Text style={styles.scoreLabel}>UYUM PUANI</Text>
                <Text style={styles.scoreValue}>%{result.score}</Text>
              </LinearGradient>

              <LinearGradient colors={['#4c1d95', '#2e1065']} style={styles.resultCard}>
                <Text style={styles.coupleName}>{result.coupleName}</Text>
                <View style={styles.divider} />

                {/* TYPEWRITER YOK, DÜZ METİN VAR */}
                <Text style={styles.roastText}>
                  "{result.roast}"
                </Text>

                <View style={styles.flagBox}>
                  <Text style={styles.flagTitle}>🚩 RED FLAG:</Text>
                  <Text style={styles.flagText}>{result.redFlag}</Text>
                </View>
                <Text style={{ color: '#888', textAlign: 'right', marginTop: 10, fontSize: 10 }}>Astropot 💘</Text>
              </LinearGradient>
            </View>
          </ViewShot>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <LinearGradient
              colors={['#833AB4', '#FD1D1D', '#FCB045']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.shareGradient}
            >
              <Text style={styles.shareBtnText}>📸 Rezilliği Paylaş</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>💔 Yeni Kurban Seç</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- GİRİŞ EKRANI ---
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>AŞK METRE 💘</Text>
          <Text style={styles.headerSubtitle}>Bakalım "O" senin ruh eşin mi yoksa baş belan mı?</Text>

          <View style={styles.inputCard}>
            <Text style={styles.label}>Partnerinin Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Berkecan"
              placeholderTextColor="#666"
              value={partnerName}
              onChangeText={setPartnerName}
            />

            <Text style={styles.label}>Partnerinin Burcu</Text>
            <View style={styles.zodiacContainer}>
              {ZODIAC_SIGNS.map((sign) => (
                <TouchableOpacity
                  key={sign}
                  style={[styles.zodiacBtn, partnerSign === sign && styles.zodiacBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync(); // Seçim Titreşimi
                    setPartnerSign(sign);
                  }}
                >
                  <Text style={[styles.zodiacText, partnerSign === sign && styles.zodiacTextActive]}>{sign}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.analyzeBtn} onPress={handleMatch}>
              <LinearGradient
                colors={['#EC4899', '#8B5CF6']}
                style={styles.analyzeGradient}
              >
                <Text style={styles.analyzeBtnText}>UYUMU HESAPLA 🔮</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  centerContent: { padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 5 },
  headerSubtitle: { color: '#888', textAlign: 'center', marginBottom: 30 },

  inputCard: { backgroundColor: '#111', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  label: { color: '#A855F7', fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  input: { backgroundColor: '#000', color: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', fontSize: 16 },

  zodiacContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  zodiacBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#333', backgroundColor: '#000' },
  zodiacBtnActive: { backgroundColor: '#A855F7', borderColor: '#A855F7' },
  zodiacText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  zodiacTextActive: { color: '#fff' },

  analyzeBtn: { marginTop: 30 },
  analyzeGradient: { padding: 15, borderRadius: 15, alignItems: 'center' },
  analyzeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  // Result Styles
  scoreCard: { width: '100%', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  scoreLabel: { color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: 12 },
  scoreValue: { color: '#fff', fontSize: 48, fontWeight: '900' },

  resultCard: { width: '100%', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#A855F7' },
  coupleName: { color: '#F472B6', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 15 },

  // Roast Text Stili
  roastText: { color: '#e9d5ff', fontSize: 16, lineHeight: 24, fontStyle: 'italic', textAlign: 'center', marginBottom: 20 },

  flagBox: { backgroundColor: 'rgba(220, 38, 38, 0.2)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#DC2626' },
  flagTitle: { color: '#DC2626', fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
  flagText: { color: '#FECACA', fontWeight: 'bold' },

  shareBtn: { marginTop: 20, width: '100%' },
  shareGradient: { padding: 15, borderRadius: 30, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: 'bold' },

  resetBtn: { marginTop: 15, padding: 15 },
  resetText: { color: '#666', fontWeight: 'bold' }
});