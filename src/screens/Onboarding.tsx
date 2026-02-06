import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CITIES } from '../data/cities';
import { UserService } from '../services/user';
import { UserProfile } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- SABİT SEÇENEKLER ---
const GENDER_OPTIONS = ["Kadın", "Erkek", "Diğer", "Belirtmek İstemiyorum"];

const JOBS = [
  "Öğrenci 🎓", "Özel Sektör (Beyaz Yaka) 💼", "Kamu / Memur 🏛️", 
  "Freelancer 💻", "İşsiz / İş Arıyor 🔍", "Ev Hanımı/Beyi 🏠", 
  "Akademisyen 📚", "Emekli 👴", "Patron / Girişimci 🚀"
];

const RELATIONSHIPS = [
  "Sap (Single) 🐺", "Karmaşık / Toksik ☠️", "Flört Halinde 😏", 
  "İlişkisi Var 💖", "Nişanlı 💍", "Evli 💒", 
  "Boşanmış 💔", "Platonik 🥀", "Yeni Ayrılmış 🩹"
];

export default function Onboarding({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [step, setStep] = useState(1);
  
  // FORM VERİLERİ
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");

  // --- KRİTİK AYRIM ---
  // birthDate: Sadece YIL-AY-GÜN tutar (Varsayılan: 2000)
  const [birthDate, setBirthDate] = useState(new Date(2000, 0, 1));
  
  // birthTime: Sadece SAAT-DAKİKA tutar (Varsayılan: BUGÜN 12:00)
  // Bunu "Bugün" olarak başlatıyoruz ki Picker DST (Yaz saati) farkına takılmasın.
  const [birthTime, setBirthTime] = useState(new Date()); 

  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [job, setJob] = useState("");
  const [relationship, setRelationship] = useState("");

  // MODAL KONTROLLERİ
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  // Şehir Arama Filtresi
  const filteredCities = useMemo(() => {
    return CITIES.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()));
  }, [citySearch]);

  const handleNext = async () => {
    if (step === 1) {
      if (!name || !gender || !selectedCity) {
        Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldur tatlım.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!job) {
        Alert.alert("Seçim Yap", "Mesleğini seç ki ona göre roastlayalım.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!relationship) return;
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    // --- BİRLEŞTİRME ANI (FÜZYON) ---
    // Tarih seçiciden YIL-AY-GÜN alıyoruz.
    // Saat seçiciden SAAT-DAKİKA alıyoruz.
    // JavaScript engine, bu birleşim sırasında o yılın (2000) saat dilimini otomatik uygular.
    
    // 1. Temiz bir tarih objesi oluştur
    const finalDate = new Date(
      birthDate.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate(),
      birthTime.getHours(),
      birthTime.getMinutes()
    );

    // 2. String formatı (Saat gösterimi için)
    const hours = birthTime.getHours().toString().padStart(2, '0');
    const minutes = birthTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    const profile: UserProfile = {
      name,
      gender,
      birthDate: finalDate.toISOString(), // Bu artık doğru tarih+saat ve doğru timezone offsetidir.
      birthTime: timeString,
      birthCity: selectedCity,
      job,
      relationship,
    };

    const success = await UserService.saveProfile(profile);
    if (success) {
      onComplete(profile); 
    }
  };

  // --- HANDLERLER ---

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Sadece saati state'e atıyoruz. Bu state'in yılı BUGÜN olduğu için
      // 2000 yılındaki +1 saat farkından etkilenmiyor.
      setBirthTime(selectedTime);
    }
  };

  // --- RENDER ---
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.stepIndicator}>ADIM {step} / 3</Text>
      <Text style={styles.title}>
        {step === 1 && "Kimsin Sen?"}
        {step === 2 && "Hayat Nasıl Gidiyor?"}
        {step === 3 && "Kalp Durumu Ne?"}
      </Text>
      <Text style={styles.subtitle}>
        {step === 1 && "Yıldız haritanı çıkarmamız için gerçek bilgilerine ihtiyacımız var."}
        {step === 2 && "Seni yargılamayacağız (belki biraz)."}
        {step === 3 && "Dobra Bestie her şeyi bilmek ister."}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Adın Soyadın</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Örn: Ece Yılmaz" 
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cinsiyet</Text>
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map((opt) => (
            <TouchableOpacity 
              key={opt} 
              style={[styles.genderBtn, gender === opt && styles.genderBtnActive]}
              onPress={() => setGender(opt)}
            >
              <Text style={[styles.genderText, gender === opt && styles.genderTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Doğum Tarihi</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pickerText}>
              {birthDate.toLocaleDateString('tr-TR')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Doğum Saati</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.pickerText}>
              {/* Ekrana basarken direkt birthTime state'inden (BUGÜNÜN saati) okuyoruz. Şaşmaz. */}
              {birthTime.getHours().toString().padStart(2, '0')}:{birthTime.getMinutes().toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Doğum Yeri (Şehir)</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCityModal(true)}>
          <Text style={styles.pickerText}>
            {selectedCity ? selectedCity.name : "Şehir Seçiniz..."}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODALLAR */}
      {showDatePicker && (
        <DateTimePicker
          value={birthDate} // 2000 yılı burada
          mode="date"
          display="spinner"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={birthTime} // 2026 (Bugün) yılı burada -> UI Kayması İmkansız
          mode="time"
          display="spinner"
          is24Hour={true}
          onChange={onTimeChange}
        />
      )}
    </ScrollView>
  );

  const renderSelectionStep = (options: string[], selected: string, onSelect: (val: string) => void) => (
    <ScrollView style={styles.formContainer}>
      {options.map((item) => (
        <TouchableOpacity 
          key={item} 
          style={[styles.selectionCard, selected === item && styles.selectionCardActive]}
          onPress={() => onSelect(item)}
        >
          <Text style={[styles.selectionText, selected === item && styles.selectionTextActive]}>
            {item}
          </Text>
          {selected === item && <Text style={{color: '#A855F7'}}>●</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderSelectionStep(JOBS, job, setJob)}
        {step === 3 && renderSelectionStep(RELATIONSHIPS, relationship, setRelationship)}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.mainBtn} onPress={handleNext}>
          <Text style={styles.mainBtnText}>
            {step === 3 ? "BİTİR VE BAŞLA ✨" : "DEVAM ET ->"}
          </Text>
        </TouchableOpacity>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showCityModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Şehir Ara</Text>
            <TextInput 
              style={styles.modalSearch} 
              placeholder="Örn: Ankara" 
              placeholderTextColor="#999"
              autoFocus
              onChangeText={setCitySearch}
            />
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cityItem}
                  onPress={() => {
                    setSelectedCity(item);
                    setShowCityModal(false);
                  }}
                >
                  <Text style={styles.cityText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setShowCityModal(false)}
            >
              <Text style={styles.closeBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, paddingTop: 40 },
  stepIndicator: { color: '#A855F7', fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { color: '#888', fontSize: 14 },
  
  content: { flex: 1 },
  formContainer: { paddingHorizontal: 20 },
  
  inputGroup: { marginBottom: 20 },
  label: { color: '#ccc', marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: { 
    backgroundColor: '#111', borderWidth: 1, borderColor: '#333', 
    borderRadius: 12, padding: 15, color: '#fff', fontSize: 16 
  },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  pickerBtn: { 
    backgroundColor: '#111', borderWidth: 1, borderColor: '#333', 
    borderRadius: 12, padding: 15, justifyContent: 'center'
  },
  pickerText: { color: '#fff', fontSize: 16 },

  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genderBtn: { 
    borderWidth: 1, borderColor: '#333', borderRadius: 20, 
    paddingVertical: 10, paddingHorizontal: 15, marginBottom: 5
  },
  genderBtnActive: { backgroundColor: '#A855F7', borderColor: '#A855F7' },
  genderText: { color: '#888' },
  genderTextActive: { color: '#fff', fontWeight: 'bold' },

  selectionCard: {
    backgroundColor: '#111', padding: 20, borderRadius: 15,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#222'
  },
  selectionCardActive: { borderColor: '#A855F7', backgroundColor: '#1a0b2e' },
  selectionText: { color: '#ccc', fontSize: 16 },
  selectionTextActive: { color: '#fff', fontWeight: 'bold' },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#222' },
  mainBtn: { 
    backgroundColor: '#fff', borderRadius: 15, padding: 18, 
    alignItems: 'center', marginBottom: 10 
  },
  mainBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  backBtn: { alignItems: 'center', padding: 10 },
  backBtnText: { color: '#666' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { height: '80%', backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalSearch: { backgroundColor: '#222', padding: 15, borderRadius: 10, color: '#fff', marginBottom: 15 },
  cityItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  cityText: { color: '#fff', fontSize: 16 },
  closeBtn: { marginTop: 15, padding: 15, alignItems: 'center', backgroundColor: '#333', borderRadius: 10 },
  closeBtnText: { color: '#fff', fontWeight: 'bold' }
});