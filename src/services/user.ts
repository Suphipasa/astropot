// src/services/user.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

const PROFILE_KEY = 'user_profile_v2'; // Yeni versiyon anahtarı

export const UserService = {
  // Profil Kaydet
  saveProfile: async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch (e) {
      console.error("Profil kaydedilemedi:", e);
      return false;
    }
  },

  // Profil Getir
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const json = await AsyncStorage.getItem(PROFILE_KEY);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.error("Profil okunamadı:", e);
      return null;
    }
  },

  // Profili Temizle (Çıkış)
  clearProfile: async (): Promise<void> => {
    try {
      // Tüm anahtarları siliyoruz (Günlük yorum önbelleği dahil)
      const keys = [PROFILE_KEY, 'DAILY_HOROSCOPE_DATE', 'DAILY_HOROSCOPE_DATA'];
      await AsyncStorage.multiRemove(keys);
      console.log("🧹 Tüm veriler temizlendi.");
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  }
};