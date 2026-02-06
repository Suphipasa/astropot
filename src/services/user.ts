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
  clearProfile: async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }
};