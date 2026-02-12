import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native'; // TabIcon için gerekli
import AskScreen from './src/screens/AskScreen';

// Ekranlar
import Onboarding from './src/screens/Onboarding';
import HomeScreen from './src/screens/HomeScreen';
import DailyScreen from './src/screens/DailyScreen';
import MatchScreen from './src/screens/MatchScreen';

// Servisler ve Tipler
import { UserProfile } from './src/types';
import { UserService } from './src/services/user';
import { analyzeProfile, AIAnalysisResult } from './src/services/ai';
import { calculateFullChart } from './src/services/astronomy';

const Tab = createBottomTabNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // AI Sonucunu burada tutuyoruz
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // 1. PROFİLİ ÇEK
      const profile = await UserService.getProfile();
      
      if (profile) {
        // Harita kontrolü (Eski versiyonlardan geçenler için)
        if (!profile.chart) {
           const chart = calculateFullChart(profile);
           profile.chart = chart;
           await UserService.saveProfile(profile);
        }
        setUserProfile(profile);
        
        // 2. KAYITLI AI ANALİZİNİ ÇEK (CRITICAL FIX) 🛠️
        // Kullanıcı geri döndüğünde beklemesin diye önce hafızaya bakıyoruz.
        const savedAnalysis = await AsyncStorage.getItem('ai_analysis_result');
        
        if (savedAnalysis) {
          // Varsa hemen göster
          setAiAnalysis(JSON.parse(savedAnalysis));
        } else {
          // Yoksa (ilk kez veya silinmişse) API'yi tetikle
          loadAIAnalysis(profile);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAIAnalysis = async (profile: UserProfile) => {
    try {
      // Analizi yap
      const result = await analyzeProfile(profile);
      
      if (result) {
        setAiAnalysis(result);
        // SONUCU KAYDET (CRITICAL FIX) 🛠️
        await AsyncStorage.setItem('ai_analysis_result', JSON.stringify(result));
      }
    } catch (error) {
      console.error("AI Analysis Load Error:", error);
    }
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    // Haritayı hesapla
    const chart = calculateFullChart(profile);
    const fullProfile = { ...profile, chart };
    
    setUserProfile(fullProfile);
    await UserService.saveProfile(fullProfile); // Profili kaydet
    
    // Analizi başlat ve kaydet
    await loadAIAnalysis(fullProfile); 
  };

  const handleReset = async () => {
    setLoading(true);
    await UserService.clearProfile();
    await AsyncStorage.removeItem('ai_analysis_result'); // Analizi de sil
    setUserProfile(null);
    setAiAnalysis(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      
      {!userProfile ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: { 
              backgroundColor: '#0f0f1a',
              borderTopWidth: 1,
              borderTopColor: '#333',
              height: 90,
              paddingTop: 10,
              paddingBottom: 30,
              position: 'absolute',
              elevation: 0,
            },
            tabBarActiveTintColor: '#A855F7',
            tabBarInactiveTintColor: '#666',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: 'bold',
              marginTop: 5,
            },
            tabBarIcon: ({ focused }) => {
              let iconName = "";
              if (route.name === 'Home') iconName = "🔮";
              else if (route.name === 'Daily') iconName = "✨";
              else if (route.name === 'Match') iconName = "💘";
              else if (route.name === 'Ask') iconName = "🎱";

              return (
                <Text style={{ 
                  fontSize: 24, 
                  opacity: focused ? 1 : 0.6,
                  textShadowColor: focused ? '#A855F7' : 'transparent',
                  textShadowRadius: focused ? 10 : 0
                }}>
                  {iconName}
                </Text>
              );
            },
          })}
        >
          {/* 1. HOME SCREEN */}
          <Tab.Screen 
            name="Home" 
            options={{ title: 'Ben', tabBarLabel: 'Kozmik Ben' }}
          >
            {() => <HomeScreen userProfile={userProfile!} aiAnalysis={aiAnalysis} onReset={handleReset} />}
          </Tab.Screen>

          {/* 2. DAILY SCREEN */}
          <Tab.Screen 
              name="Daily" 
              options={{ title: 'Günlük', tabBarLabel: 'Günlük Mod' }} 
            >
              {() => <DailyScreen userProfile={userProfile!} />}
            </Tab.Screen>
            
            {/* 3. MATCH SCREEN */}
            <Tab.Screen 
              name="Match" 
              options={{ title: 'Uyum', tabBarLabel: 'Aşk Metre' }} 
            >
               {() => <MatchScreen userProfile={userProfile!} />}
            </Tab.Screen>

            {/* 4. ASK SCREEN (YENİ ÖZELLİK) */}
            <Tab.Screen 
              name="Ask" 
              options={{ title: 'Sor', tabBarLabel: 'Kahin' }} 
            >
               {() => <AskScreen userProfile={userProfile!} />}
            </Tab.Screen>

          </Tab.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
});