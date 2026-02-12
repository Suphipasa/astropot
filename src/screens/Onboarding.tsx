import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, Modal, FlatList, Alert, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { UserService } from '../services/user';
import { UserProfile } from '../types';
import { CITIES } from '../data/cities';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  // 📅 TARİH: String olarak tutuyoruz (YYYY-MM-DD) - Değişiklik yok
  const [birthDate, setBirthDate] = useState<string>("2000-01-01");

  // ⏰ SAAT DEĞİŞİKLİĞİ BURADA YAPILDI:
  // Varsayılan saati 12:00 olarak ayarlıyoruz.
  const defaultTime = new Date();
  defaultTime.setHours(12, 0, 0, 0);
  const [birthTime, setBirthTime] = useState(defaultTime);

  const [birthCity, setBirthCity] = useState(CITIES[0]);
  const [gender, setGender] = useState<'Erkek' | 'Kadın' | 'Diğer'>('Kadın');
  const [job, setJob] = useState("");
  const [relationship, setRelationship] = useState("");

  // UI Kontrolleri
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);

    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');

      const formattedDate = `${year}-${month}-${day}`;
      setBirthDate(formattedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) setBirthTime(selectedTime);
  };

  const handleNext = async () => {

    Keyboard.dismiss();

    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!name || !job || !relationship) {
        Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldur tatlım.");
        return;
      }

      const timeStr = `${String(birthTime.getHours()).padStart(2, '0')}:${String(birthTime.getMinutes()).padStart(2, '0')}`;

      const profile: UserProfile = {
        id: Date.now().toString(),
        name,
        birthDate,
        birthTime: timeStr,
        birthCity,
        gender,
        job,
        relationship
      };

      await UserService.saveProfile(profile);
      onComplete(profile);
    }
  };

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#000000', '#1a1a2e']} style={styles.background} />

        <View style={styles.content}>
          <Text style={styles.stepIndicator}>ADIM {step} / 3</Text>

          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Kimsin Sen?</Text>
              <Text style={styles.subtitle}>Seni tanımadan dedikodu yapamam.</Text>

              <Text style={styles.label}>Adın (veya lakabın)</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Örn: Ece"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>Cinsiyet</Text>
              <View style={styles.genderRow}>
                {['Kadın', 'Erkek', 'Diğer'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => setGender(g as any)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Kozmik Bilgiler</Text>
              <Text style={styles.subtitle}>Doğum haritanı çıkaracağız, dürüst ol.</Text>

              {/* TARİH SEÇİMİ */}
              <Text style={styles.label}>Doğum Tarihi</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.pickerText}>{birthDate}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date(birthDate)}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  locale="tr-TR" // Türkçe gün/ay isimleri için
                />
              )}

              {/* SAAT SEÇİMİ */}
              <Text style={styles.label}>Doğum Saati</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.pickerText}>
                  {birthTime.getHours().toString().padStart(2, '0')}:{birthTime.getMinutes().toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={birthTime}
                  mode="time"
                  display="spinner" // Modern görünüm
                  onChange={onTimeChange}
                  // 👇 YENİ EKLENEN ÖZELLİKLER 👇
                  is24Hour={true}   // Android: 24 saat formatını zorlar
                  locale="tr-TR"    // iOS/Android: Bölgesel ayar (24 saati destekler)
                  minuteInterval={1} // Dakika hassasiyeti
                />
              )}

              {/* ŞEHİR SEÇİMİ */}
              <Text style={styles.label}>Doğum Şehri</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCityModal(true)}>
                <Text style={styles.pickerText}>{birthCity.name}</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Son Dokunuşlar</Text>
              <Text style={styles.subtitle}>Seni biraz daha gömelim...</Text>

              <Text style={styles.label}>Mesleğin ne?</Text>
              <TextInput
                style={styles.input}
                value={job}
                onChangeText={setJob}
                placeholder="Örn: Yazılımcı, Öğrenci, İşsiz..."
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>İlişki Durumu</Text>
              <TextInput
                style={styles.input}
                value={relationship}
                onChangeText={setRelationship}
                placeholder="Örn: Platonik, Karışık, Evli..."
                placeholderTextColor="#666"
              />
            </View>
          )}

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{step === 3 ? "ANALİZİ BAŞLAT 🔮" : "DEVAM ET"}</Text>
          </TouchableOpacity>

          {/* ŞEHİR SEÇİM MODALI */}
          <Modal visible={showCityModal} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Şehir Seç</Text>
                <TouchableOpacity onPress={() => setShowCityModal(false)}>
                  <Text style={styles.closeText}>Kapat</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Şehir ara..."
                placeholderTextColor="#666"
                value={citySearch}
                onChangeText={setCitySearch}
              />
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => {
                      setBirthCity(item);
                      setShowCityModal(false);
                    }}
                  >
                    <Text style={styles.cityText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </SafeAreaView>
          </Modal>

        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  stepIndicator: { color: '#A855F7', textAlign: 'center', fontWeight: 'bold', marginBottom: 20 },
  stepContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 30 },
  label: { color: '#A855F7', marginBottom: 10, fontWeight: 'bold', marginTop: 15 },
  input: { backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', fontSize: 16 },
  pickerBtn: { backgroundColor: '#111', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  pickerText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  nextBtn: { backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  nextBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  genderBtn: { flex: 1, backgroundColor: '#111', padding: 15, borderRadius: 10, marginHorizontal: 5, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  genderBtnActive: { backgroundColor: '#A855F7', borderColor: '#A855F7' },
  genderText: { color: '#666', fontWeight: 'bold' },
  genderTextActive: { color: '#fff' },
  modalContainer: { flex: 1, backgroundColor: '#000', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  closeText: { color: '#A855F7', fontSize: 16 },
  modalInput: { backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', fontSize: 16, marginBottom: 20 },
  cityItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  cityText: { color: '#fff', fontSize: 16 }
});