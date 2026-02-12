import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Haptics from 'expo-haptics'; // ✅ HAPTICS KALDI

import { getDailyHoroscope, DailyHoroscopeResult } from '../services/ai';
import { UserProfile } from '../types';
import { shareContent } from '../services/sharing';
import { CrystalLoader } from '../components/CrystalLoader'; // ✅ LOADING EKRANI KALDI

interface DailyScreenProps {
  userProfile: UserProfile;
}

export default function DailyScreen({ userProfile }: DailyScreenProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyData, setDailyData] = useState<DailyHoroscopeResult | null>(null);
  const viewShotRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Yükleme başlarken orta şiddette titreşim
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const data = await getDailyHoroscope(userProfile);
      setDailyData(data);
      
      // Yükleme bitince başarı titreşimi
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadData();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Paylaş butonu tok hissettirsin
    shareContent(viewShotRef);
  };

  // YÜKLEME EKRANI (KRİSTAL KÜRE)
  if (loading) {
    return <CrystalLoader text="Kozmik frekanslar taranıyor..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
      >
        <Text style={styles.headerTitle}>GÜNLÜK MOD</Text>
        <Text style={styles.dateText}>{dailyData?.date || "Bugün"}</Text>

        {dailyData ? (
          <>
            <ViewShot 
              ref={viewShotRef} 
              options={{ format: "png", quality: 1 }}
              style={{ width: '100%' }}
            >
              <View collapsable={false} style={{ padding: 10, backgroundColor: '#000' }}> 
                
                {/* VIBE KARTI */}
                <LinearGradient 
                  colors={['#BE185D', '#831843']} 
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.vibeCard}
                >
                  <Text style={styles.vibeLabel}>GÜNÜN MODU</Text>
                  <Text style={styles.vibeText}>{dailyData.vibe}</Text>
                </LinearGradient>

                {/* ANA ROAST KARTI - TYPEWRITER KALDIRILDI, NORMAL TEXT GELDİ */}
                <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.mainCard}>
                  <Text style={styles.cardTitle}>KOZMİK GÜNDEM 📜</Text>
                  
                  {/* 👇 Düz Metin Olarak Gösteriyoruz 👇 */}
                  <Text style={styles.roastText}>
                    "{dailyData.roast}"
                  </Text>
                  
                  <Text style={styles.brandSignature}>— Astropot 🔮</Text>
                </LinearGradient>

                <View style={styles.statCard}>
                  <Text style={styles.statEmoji}>🎲</Text>
                  <View style={{ flex: 1 }}> 
                    <Text style={styles.statLabel}>GÜNÜN İSTATİSTİĞİ</Text>
                    <Text style={styles.statValue}>{dailyData.lucky_metric}</Text>
                  </View>
                </View>
              </View>
            </ViewShot>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <LinearGradient
                colors={['#833AB4', '#FD1D1D', '#FCB045']} 
                style={styles.shareGradient}
              >
                <Text style={styles.shareBtnText}>📸 Story At</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
           <View style={{alignItems: 'center', marginTop: 50}}>
            <Text style={{color: '#666'}}>Veri alınamadı.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  dateText: { color: '#888', textAlign: 'center', marginBottom: 30, fontSize: 14, fontWeight: '600' },
  vibeCard: { borderRadius: 20, padding: 25, marginBottom: 20, alignItems: 'center', shadowColor: '#BE185D', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  vibeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  vibeText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  mainCard: { backgroundColor: '#111', borderRadius: 20, padding: 25, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  cardTitle: { color: '#A855F7', fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  
  // Roast Text Stili (Okunabilirlik için line-height önemli)
  roastText: { color: '#e9d5ff', fontSize: 18, lineHeight: 28, fontStyle: 'italic' },
  
  statCard: { backgroundColor: '#111', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statEmoji: { fontSize: 32, marginRight: 15 },
  statLabel: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  brandSignature: { color: '#666', fontSize: 10, fontWeight: 'bold', textAlign: 'right', marginTop: 10, fontStyle: 'italic' },
  shareBtn: { marginTop: 20, marginBottom: 50, alignItems: 'center' },
  shareGradient: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});