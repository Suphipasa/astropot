import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Keyboard, TouchableWithoutFeedback, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons'; // Expo ikon seti

import { UserProfile } from '../types';
import { askAstropot } from '../services/ai';
import { shareContent } from '../services/sharing';
import { CrystalLoader } from '../components/CrystalLoader';

interface AskScreenProps {
  userProfile: UserProfile;
}

export default function AskScreen({ userProfile }: AskScreenProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const viewShotRef = useRef(null);
  const MAX_CHARS = 100;

  // Varsayılan "Dalga Geçen" Metin
  const DEFAULT_TEXT = `Bana öyle "Ne zaman evleneceğim?", "Zengin olacak mıyım?" gibi banel sorularla gelme.\n\nHaritana bakıp gerçeği yüzüne vuracağım. Cesaretin varsa sor bakalım...`;

  const handleAsk = async () => {
    Keyboard.dismiss();

    if (!question.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Boş Konuşma", "Bir şey sormadın ki cevap vereyim tatlım.");
      return;
    }

    if (question.length < 5) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Çok Kısa", "Bu ne? Biraz detay ver.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const result = await askAstropot(userProfile, question);
      setAnswer(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Hata", "Evren şu an meşgul.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    shareContent(viewShotRef);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswer(null);
    setQuestion("");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#000000', '#1a1a2e']} style={styles.background} />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KAHİN MODU 🔮</Text>
          <Text style={styles.headerSubtitle}>Kısa sor, net cevap al.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* CEVAP / EKRAN ALANI */}
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
            <View collapsable={false} style={styles.oracleContainer}>
              <LinearGradient colors={['#2e1065', '#1a1a2e']} style={styles.oracleCard}>
                
                {loading ? (
                  // Yüklenirken Kristal Küre
                  <View style={styles.loaderBox}>
                    <CrystalLoader text="Yıldızlara soruluyor..." />
                  </View>
                ) : (
                  <>
                    <Text style={styles.oracleTitle}>
                      {answer ? "ASTROPOT DİYOR Kİ:" : "NASIL ÇALIŞIR?"}
                    </Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={[styles.oracleText, answer && styles.answerText]}>
                      {answer || DEFAULT_TEXT}
                    </Text>

                    {answer && (
                      <Text style={styles.signature}>— Astropot 🎱</Text>
                    )}
                  </>
                )}
              </LinearGradient>
            </View>
          </ViewShot>

          {/* PAYLAŞ BUTONU (Sadece cevap varken çıkar) */}
          {answer && !loading && (
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-social" size={20} color="#fff" style={{marginRight:8}} />
              <Text style={styles.shareText}>Bu Bilgeliği Paylaş</Text>
            </TouchableOpacity>
          )}

          {/* SORU SORMA ALANI (Cevap varken gizleyebiliriz veya yeni soru için tutabiliriz. Tutalım.) */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Örn: Eski sevgilim döner mi?"
                placeholderTextColor="#666"
                value={question}
                onChangeText={setQuestion}
                maxLength={MAX_CHARS}
                multiline
                blurOnSubmit={true} // Enter'a basınca klavye kapansın
              />
              <Text style={styles.charCount}>{question.length}/{MAX_CHARS}</Text>
            </View>

            {answer ? (
               <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                 <Text style={styles.resetBtnText}>Yeni Soru Sor 🔄</Text>
               </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.sendBtn, loading && styles.disabledBtn]} 
                onPress={handleAsk}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#EC4899', '#8B5CF6']}
                  style={styles.sendGradient}
                >
                  <Text style={styles.sendText}>{loading ? "..." : "SOR GELSİN"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  headerSubtitle: { color: '#A855F7', fontSize: 12 },
  content: { padding: 20 },
  
  oracleContainer: { marginBottom: 20 },
  oracleCard: { 
    borderRadius: 20, 
    padding: 25, 
    minHeight: 250, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A855F7',
    shadowColor: '#A855F7',
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  loaderBox: { height: 200, width: '100%', justifyContent: 'center', alignItems: 'center' },
  oracleTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  divider: { width: 50, height: 2, backgroundColor: '#A855F7', marginVertical: 15 },
  oracleText: { color: '#ccc', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  answerText: { color: '#fff', fontSize: 20, fontWeight: 'bold', fontStyle: 'italic' },
  signature: { alignSelf: 'flex-end', color: '#A855F7', marginTop: 20, fontSize: 12, fontWeight: 'bold' },
  
  inputContainer: { marginTop: 10 },
  inputWrapper: { marginBottom: 20 },
  input: { 
    backgroundColor: '#111', 
    color: '#fff', 
    padding: 20, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#333', 
    fontSize: 16, 
    minHeight: 80,
    textAlignVertical: 'top'
  },
  charCount: { position: 'absolute', bottom: 10, right: 15, color: '#666', fontSize: 10 },
  
  sendBtn: { width: '100%', shadowColor: '#EC4899', shadowOpacity: 0.5, shadowRadius: 10 },
  disabledBtn: { opacity: 0.7 },
  sendGradient: { padding: 18, borderRadius: 15, alignItems: 'center' },
  sendText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  
  resetBtn: { backgroundColor: '#333', padding: 18, borderRadius: 15, alignItems: 'center' },
  resetBtnText: { color: '#fff', fontWeight: 'bold' },

  shareBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 25, backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 20 },
  shareText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});