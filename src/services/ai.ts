import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateFullChart } from "./astronomy";

// API Key güvenliği
const API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(API_KEY);

// --- TİP TANIMLARI ---

export interface AIAnalysisResult {
  title: string;
  roast: string;
  advice: string;
}

export interface DailyHoroscopeResult {
  date: string;
  vibe: string;
  roast: string;
  lucky_metric: string;
}

export interface MatchResult {
  coupleName: string;
  score: number;
  roast: string;
  redFlag: string;
}

// --- SABİT VERİLER ---

const MOCK_ANALYSIS: AIAnalysisResult = {
  title: "Mock Mode: Kozmik Şaka",
  roast: "Şu an geliştirici modundasın tatlım. API kotan gitmesin diye bu sahte cevabı görüyorsun. Ama burçlarına baktım, durum vahim.",
  advice: "O bilgisayarı kapat ve derin bir nefes al."
};

const ROAST_INSTRUCTIONS_TR = `
ROAST MANTIĞI (Kullanıcının profiline göre bu enerjiyi yansıt):
[MESLEK & STATÜ ROASTLARI - "Hayat Mücadelesi" Modu]
- Öğrenci: "Ders çalışıyormuş gibi yapıp TikTok kaydırma" enerjisi.
- Özel Sektör: "Zoom toplantısında sahte gülüş atarken içi kan ağlayan" enerji.
- Kamu / Memur: "Dünya yansa çayını yudumlayan sarsılmaz sabır" enerjisi.
- Freelancer: "Pijamayla gezmek ile çalışmak arasındaki ince çizgi" enerjisi.
- İşsiz: "CV güncellerken hayatı sorgulama" enerjisi.
- Akademisyen: "Okumaktan yazmaya başlayamama" döngüsü.
- Patron: "Hustle şovu yaparken sinir krizi geçirme" enerjisi.

[İLİŞKİ ROASTLARI - "Aşko" Modu]
- Bekar: "Bağımsızım deyip gizlice stalklama" enerjisi.
- Karmaşık: "Red flag'leri görmezden gelme" enerjisi.
- Flört: "3 kelimelik mesajı 4 saat analiz etme" enerjisi.
- İlişkisi Var: "Instagram pozları vs evdeki gerçekler" enerjisi.
- Platonik: "Kendi kafasında film çekme" enerjisi.
`;

const FOCUS_TOPICS = [
  "Aşk ve Flört (Ex'ler, yeni manitalar)",
  "Para ve Kariyer (Batıyor musun çıkıyor musun?)",
  "Sosyal Çevre ve Dedikodu",
  "Sağlık ve Enerji (Yatakta mısın, partide mi?)",
  "Aile ve Ev (Kaos mu var?)"
];

// --- FONKSİYONLAR ---

/**
 * 1. KULLANICI PROFİL ANALİZİ (Onboarding Sonrası)
 */
export const analyzeProfile = async (profile: UserProfile): Promise<AIAnalysisResult | null> => {
  const forceMock = true; 

  if (forceMock) {
     await new Promise(r => setTimeout(r, 2000));
     return MOCK_ANALYSIS;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const profileText = `
    - İsim: ${profile.name}
    - Cinsiyet: ${profile.gender}
    - Güneş Burcu: ${profile.chart?.sunSign || "Bilinmiyor"}
    - Ay Burcu: ${profile.chart?.moonSign || "Bilinmiyor"}
    - Yükselen: ${profile.chart?.risingSign || "Bilinmiyor"}
    - Meslek: ${profile.job}
    - İlişki: ${profile.relationship}
    - Doğum Yeri: ${profile.birthCity.name}
    `;

    const prompt = `
      Sen Astropot. Dobra, sarkastik ve eğlenceli astroloji yapay zekasısın.
      
      KULLANICI PROFİLİ:
      ${profileText}

      ${ROAST_INSTRUCTIONS_TR}

      GÖREVİN:
      1. Burç kombinasyonunu, mesleği ve ilişkiyi harmanla.
      2. "Bestie" tonunda konuş, sıkıcı terimler kullanma.
      3. Tespitlerin tokat gibi olsun ama güldürsün.
      
      SADECE JSON FORMATINDA CEVAP VER:
      {
        "title": "3-4 kelimelik komik başlık",
        "roast": "2-3 cümlelik iğneleyici analiz.",
        "advice": "Tek cümlelik emir kipinde tavsiye."
      }
    `;

    // SDK KULLANIMI (Fetch yerine)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Markdown Temizliği
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return MOCK_ANALYSIS;
  }
};

/**
 * 2. GÜNLÜK BURÇ YORUMU
 */
export const getDailyHoroscope = async (profile: UserProfile): Promise<DailyHoroscopeResult> => {
  
  // --- MOCK KONTROLÜ (KOTA KORUMA) ---
  const forceMock = true; // Test ederken true yapabilirsin

  if (forceMock) {
    await new Promise(r => setTimeout(r, 1500)); // Gerçekçilik için bekleme
    return {
      date: new Date().toLocaleDateString('tr-TR'),
      vibe: "Dev Mode 🛠️",
      roast: "Şu an geliştirici modundasın tatlım, API harcamayalım diye bu sahte veriyi görüyorsun. Kodların tıkır tıkır çalışıyor, panik yapma.",
      lucky_metric: "Şanslı Sayın: 000" // Mock değer
    };
  }
  
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const today = new Date();
    const dateStr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const chart = calculateFullChart(profile);
    const randomTopic = FOCUS_TOPICS[Math.floor(Math.random() * FOCUS_TOPICS.length)];

    const prompt = `
      SEN: Astropot. Gen Z dilini konuşan, aşırı dobra, hafif toksik ama gerçekleri söyleyen bir astroloji yapay zekasısın.
      
      GÖREV: Aşağıdaki kullanıcı profili için "${dateStr}" tarihine özel günlük burç yorumu yap.
      
      KULLANICI PROFİLİ:
      - Güneş Burcu: ${chart.sunSign} (Öz Kimlik)
      - Ay Burcu: ${chart.moonSign} (Duygular)
      - Yükselen Burcu: ${chart.risingSign} (Dış Görünüş/Maske)
      - Meslek: ${profile.job} (BUNU SADECE FİNANS KONUŞURSAN KULLAN)
      - İlişki: ${profile.relationship} (BUNU SADECE AŞK KONUŞURSAN KULLAN)

      KURALLAR (ÇOK ÖNEMLİ):
      1. ASLA TEKRAR ETME: Kullanıcının mesleğini veya ilişki durumunu sürekli yüzüne vurma. Sadece konuyla ilgiliyse bahset.
      2. GÖKYÜZÜNÜ KULLAN: Bugün (${dateStr}) gökyüzünde ne var? Merkür Retrosu, Dolunay, Mars transiti vs. var mı? Bu transitler ${chart.sunSign} ve ${chart.risingSign} burcunu nasıl etkiliyor? Bunu simüle et.
      3. ODAK NOKTASI: Bugünün yorumunu şu tema üzerine kur: "${randomTopic}".
      4. USLUP: Kısa, vurucu, "bestie" modunda ama acımasız ol. Emojileri bol kullan.
      
      İSTENEN JSON FORMATI (Sadece bu JSON'ı döndür):
      {
        "vibe": "Tek kelimeyle günün modu (Örn: Kaotik, Zengin, Sürünüyorsun)",
        "roast": "Maksimum 2-3 cümlelik, gökyüzü hareketlerine dayalı dobra yorum.",
        "lucky_metric": "Günün şanslı saati, sayısı veya rengi (Eğlenceli olsun)"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText) as DailyHoroscopeResult;

  } catch (error) {
    console.error("Daily Horoscope Error:", error);
    return {
      date: new Date().toLocaleDateString('tr-TR'),
      vibe: "Merkür Retrosu 🪐",
      roast: "Yıldızlar şu an sunucuyla bağlantı kuramıyor. Birazdan tekrar dene.",
      lucky_metric: "Şanslı Sayın: 404"
    };
  }
};

/**
 * 3. AŞK UYUMU (MATCH)
 */
export const analyzeMatch = async (userProfile: UserProfile, partnerName: string, partnerSign: string): Promise<MatchResult | null> => {
  const forceMock = true;

  if (forceMock) {
    await new Promise(r => setTimeout(r, 1000));
    return {
      coupleName: "Felaket Senaryosu 💔",
      score: 12,
      roast: "Daha API'ye bağlanmıyorken başkasına nasıl bağlanacaksın...",
      redFlag: "İletişim kopukluğu."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const userSign = userProfile.chart?.sunSign || "Bilinmiyor";
    
    const prompt = `
      Sen Astropot. Dobra ilişki koçusun.
      Benim Burcum: ${userSign} (Cinsiyet: ${userProfile.gender}, Durum: ${userProfile.relationship})
      Partnerin Adı: ${partnerName}
      Partnerin Burcu: ${partnerSign}

      GÖREV:
      Bu iki burcun uyumunu analiz et. Çok dürüst, iğneleyici ve komik ol.
      
      SADECE JSON FORMATI:
      {
        "coupleName": "Komik çift lakabı (Örn: Kaos A.Ş.)",
        "score": 0-100 arası sayı,
        "roast": "2-3 cümlelik analiz.",
        "redFlag": "En büyük tehlike"
      }
    `;

    // SDK KULLANIMI (Fetch yerine)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("Match AI Error:", error);
    return {
      coupleName: "Bağlantı Hatası",
      score: 0,
      roast: "Yıldızlar şu an bu ilişkiyi yorumlamayı reddediyor.",
      redFlag: "İnternet bağlantısı"
    };
  }
};

/**
 * 4. ASTROPOT'A SOR (ORACLE MODU)
 */
export const askAstropot = async (profile: UserProfile, question: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chart = calculateFullChart(profile);

    const prompt = `
      SEN: Astropot. Kullanıcının en yakın, en dobra ve hafif toksik astroloji arkadaşısın.
      
      KULLANICI BİLGİLERİ:
      - Güneş: ${chart.sunSign}
      - Ay: ${chart.moonSign}
      - Yükselen: ${chart.risingSign}
      - İlişki: ${profile.relationship}
      - Meslek: ${profile.job}

      KULLANICI SORUSU: "${question}"

      GÖREV:
      Bu soruya kullanıcının haritasına ve durumuna bakarak MKSİMUM 2 CÜMLELİK, net ve iğneleyici bir cevap ver.
      - Asla "bence" deme, kesin konuş.
      - Eğer aptalca bir soruysa dalga geç.
      - Aşk soruyorsa burç uyumuna veya Venüs'üne atıf yap (uydurabilirsin).
      - İş soruyorsa Satürn veya Merkür retrosunu bahane et.
      - Çok kısa, komik ve vurucu ol.

      CEVAP (Sadece cevabı yaz):
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error("Ask Astropot Error:", error);
    return "Merkür retrosu yüzünden sinyaller karıştı. Ama bence cevap: HAYIR.";
  }
};