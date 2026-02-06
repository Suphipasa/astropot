import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Ekranlar
import Onboarding from './src/screens/Onboarding';
import HomeScreen from './src/screens/HomeScreen';
import DailyScreen from './src/screens/DailyScreen';
import MatchScreen from './src/screens/MatchScreen'; // Bunu oluşturmadıysan DailyScreen kullan şimdilik

// Servisler
import { UserService } from './src/services/user';
import { calculateFullChart } from './src/services/astronomy';
import { analyzeProfile, AIAnalysisResult } from './src/services/ai';
import { UserProfile } from './src/types';

const Tab = createBottomTabNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Yükleniyor...");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const profile = await UserService.getProfile();
    if (profile) {
      // Profil varsa direkt analizi de çalıştırmayı deneyebiliriz veya saklanan analizi çekebiliriz
      // Şimdilik sadece profili yüklüyoruz.
      setUserProfile(profile);
      // Not: Analiz sonucunu da kaydetmek iyi bir fikir olabilir (AsyncStorage'a)
      // Şimdilik her açılışta tekrar analiz yapmasın diye burada AI çağırmıyoruz,
      // Onboarding bitişinde çağırıyoruz. İleride bunu optimize edeceğiz.
    }
    setLoading(false);
  };

  const handleOnboardingComplete = async (baseProfile: UserProfile) => {
    setLoading(true);
    setLoadingText("Yıldızlar hizalanıyor...");
    
    try {
      // 1. Hesapla
      const chart = calculateFullChart(baseProfile);
      const fullProfile = { ...baseProfile, chart };
      
      // 2. AI Analiz
      setLoadingText("Bestie dedikodu topluyor...");
      const analysis = await analyzeProfile(fullProfile);
      
      // 3. Kaydet
      setUserProfile(fullProfile);
      setAiAnalysis(analysis); // State'e at
      await UserService.saveProfile(fullProfile);
      
    } catch (error) {
      console.error(error);
      alert("Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    await UserService.clearProfile();
    setUserProfile(null);
    setAiAnalysis(null);
  };

  if (loading) {
    return (
      <View style={{flex:1, backgroundColor:'#000', justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#A855F7" />
        <Text style={{color:'#A855F7', marginTop: 10}}>{loadingText}</Text>
      </View>
    );
  }

  // Profil yoksa Onboarding göster (NavigationContainer DIŞINDA)
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      
      {!userProfile ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: { 
                backgroundColor: '#111', 
                borderTopColor: '#333',
                height: 80,
                paddingBottom: 20
              },
              tabBarActiveTintColor: '#A855F7',
              tabBarInactiveTintColor: '#666',
            }}
          >
            <Tab.Screen 
              name="Home" 
              options={{ title: 'Ben', tabBarLabel: 'Profil' }}
            >
              {() => <HomeScreen userProfile={userProfile} aiAnalysis={aiAnalysis} onReset={handleReset} />}
            </Tab.Screen>

            <Tab.Screen 
              name="Daily" 
              component={DailyScreen} 
              options={{ title: 'Günlük', tabBarLabel: 'Günlük' }} 
            />
            
            <Tab.Screen 
              name="Match" 
              component={MatchScreen || DailyScreen} 
              options={{ title: 'Uyum', tabBarLabel: 'Aşk' }} 
            />
          </Tab.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}