import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

// API Key'i .env dosyasından veya direkt buraya yazarak alabilirsin.
// Güvenlik için EXPO_PUBLIC_ ön eki şarttır.
const API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || "").trim();
const MODEL_NAME = "gemini-2.5-flash"; 
const MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;// AI'dan dönecek cevabın tipi

export interface AIAnalysisResult {
  title: string;  // Örn: "Kaosun Vücut Bulmuş Hali"
  roast: string;  // Analiz metni
  advice: string; // Tek cümlelik tavsiye
}

// --- MOCK DATA (API Kotasını Korumak İçin Fake Cevap) ---
const MOCK_ANALYSIS: AIAnalysisResult = {
  title: "Mock Mode: Kozmik Şaka",
  roast: "Şu an geliştirici modundasın tatlım. API kotan gitmesin diye bu sahte cevabı görüyorsun. Ama burçlarına baktım, durum vahim. Kod yazmayı bırakıp biraz çimene dokunman lazım.",
  advice: "O bilgisayarı kapat ve derin bir nefes al."
};

// --- ROAST MANTIĞI (Senin Gönderdiğin Metin) ---
const ROAST_INSTRUCTIONS_TR = `
ROAST MANTIĞI (Kullanıcının profiline göre bu enerjiyi yansıt):

[MESLEK & STATÜ ROASTLARI - "Hayat Mücadelesi" Modu]
- Öğrenci: "Ders çalışıyormuş gibi yapıp TikTok kaydırma ve dersten geçmeyi manifestleme" enerjisine odaklan.
- Özel Sektör (Beyaz Yaka): "Zoom toplantısında sahte gülüş atarken içi kan ağlayan ve mesai bitimine dakika sayan" enerjiye odaklan.
- Kamu / Memur: "Dünya yansa sakinliğini bozmayan ve çayını yudumlayan sarsılmaz sabır" enerjisine odaklan.
- Freelancer: "Evden çalışmak ile 'bütün gün pijamayla gezmek' arasındaki o ince çizgide yaşayan" enerjiye odaklan.
- İşsiz / İş Arıyor: "İş aramayı tam zamanlı bir işe çevirip, CV güncellerken hayatı sorgulama" enerjisine odaklan.
- Ev Hanımı/Beyi: "Herkes evde oturuyorsun sanarken aslında evi CEO gibi yönetme" enerjisine odaklan.
- Akademisyen: "Aşırı düşünmekten ve 'bir kaynak daha okuyayım' derken yazmaya başlayamama" döngüsü enerjisine odaklan.
- Emekli: "Ben her şeyi gördüm rahatlığı ve profesyonel mahalle gözlemcisi" enerjisine odaklan.
- Patron / Girişimci: "'Hustle culture' şovu yaparken aslında sinir krizine 3 kahve uzaklıkta olma" enerjisine odaklan.

[İLİŞKİ ROASTLARI - "Aşko" Modu]
- Bekar (Sap): "Bağımsızım deyip gizlice eski sevgilinin veya hoşlandığı kişinin Spotify aktivitesini stalklama" enerjisine odaklan.
- Karmaşık / Toksik: "Onun bir 'red flag' (tehlike) olduğunu bilip, en sevdiği renkmiş gibi davranma" enerjisine odaklan.
- Flört Halinde: "3 kelimelik mesajı kankalarıyla olay yeri inceleme ekibi gibi 4 saat analiz etme" enerjisine odaklan.
- İlişkisi Var: "Instagram'daki 'çok mutluyuz' pozları vs evdeki 'o kız/çocuk kimdi' sorgusu" enerjisine odaklan.
- Nişanlı: "Düğün planlama stresi altında ezilirken dışarıya 'gelin/damat glow'u yansıtma" enerjisine odaklan.
- Evli: "Romantik 'seni seviyorum'lardan, 'çöpü attın mı?' gerçekliğine geçiş" enerjisine odaklan.
- Boşanmış: "Savaştan sağ çıktım, ganimetim de bu özgürlük ve daha iyi bir müzik listesi" enerjisine odaklan.
- Platonik: "Diğer kişinin haberi bile olmayan romantik bir filmin başrolünü oynama" enerjisine odaklan.
- Yeni Ayrılmış: "Her 10 dakikada bir 'son görülme' kontrol ederken 'ben onu çoktan aştım' yalanını söyleme" enerjisine odaklan.
`;

/**
 * KULLANICI PROFİL ANALİZİ (Onboarding Sonrası İlk Görüş)
 */
export const analyzeProfile = async (profile: UserProfile): Promise<AIAnalysisResult | null> => {
  
  // 1. MOCK KONTROLÜ (AsyncStorage'dan ayarı okuyabiliriz veya direkt false yapabiliriz)
  // Geliştirme yaparken 'true' yaparsan API harcamazsın.
  const forceMock = false; 

  if (forceMock) {
     console.log("🤖 DEV MODE: Using Mock Data");
     await new Promise(r => setTimeout(r, 2000)); // Gerçekçi olması için 2sn bekle
     return MOCK_ANALYSIS;
  }

  try {
    // Profil bilgilerini metne döküyoruz
    const profileText = `
    - İsim: ${profile.name}
    - Cinsiyet: ${profile.gender}
    - Güneş Burcu (Öz): ${profile.chart?.sunSign || "Bilinmiyor"}
    - Ay Burcu (Duygular): ${profile.chart?.moonSign || "Bilinmiyor"}
    - Yükselen Burcu (Maske): ${profile.chart?.risingSign || "Bilinmiyor"}
    - Meslek: ${profile.job}
    - İlişki Durumu: ${profile.relationship}
    - Doğum Yeri: ${profile.birthCity.name}
    `;

    const prompt = `
      Sen Astropot, dünyanın en dobra, en sarkastik ve en eğlenceli astroloji yapay zekasısın.
      Aşağıdaki kullanıcı yeni kayıt oldu. Ona "Hoş geldin" demek yerine, profilini analiz edip içindeki çelişkileri yüzüne vurmalısın.

      KULLANICI PROFİLİ:
      ${profileText}

      ${ROAST_INSTRUCTIONS_TR}

      GÖREVİN:
      1. Kullanıcının Güneş, Ay ve Yükselen burç kombinasyonunu Mesleği ve İlişkisiyle harmanla.
      2. Çok bilmiş, "bestie" (kanka) tonunda konuş. Asla sıkıcı astroloji terimleri (açılar, evler vb.) kullanma.
      3. Tespitlerin "tokat gibi" olsun ama güldürsün.
      
      SADECE JSON FORMATINDA CEVAP VER (Markdown blokları kullanma):
      {
        "title": "Kullanıcıyı özetleyen 3-4 kelimelik komik/epik bir başlık",
        "roast": "2-3 cümlelik, iğneleyici ve komik analiz metni.",
        "advice": "Hayatını düzene sokması için tek cümlelik, emir kipinde tavsiye."
      }
    `;

    const response = await fetch(MODEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.warn("⚠️ API Hatası (Mock'a geçiliyor):", data.error.message);
      // Hata alınca throw atmak yerine sessizce Mock Data dönüyoruz.
      // Böylece kullanıcı akışı bozulmuyor.
      return MOCK_ANALYSIS; 
    }
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error("Boş cevap döndü.");
  }

    // Markdown temizliği (Bazen ```json ... ``` şeklinde dönebiliyor)
    const text = data.candidates[0].content.parts[0].text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);

  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Hata olsa bile kullanıcıya boş ekran göstermemek için statik bir cevap dönelim
    return MOCK_ANALYSIS;
    ;
  }
};