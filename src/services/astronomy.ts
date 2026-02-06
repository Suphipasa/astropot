import { UserProfile, NatalChart } from '../types';

// @ts-ignore
const AstronomyLib = require('astronomy-engine');
const Astronomy = AstronomyLib.default || AstronomyLib;

const ZODIAC_SIGNS = [
  "Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak",
  "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"
];

// Güvenli Burç Çevirici
const getSignFromLongitude = (longitude: number): string | undefined => {
  if (longitude === undefined || isNaN(longitude)) return undefined;
  
  let lon = longitude % 360;
  if (lon < 0) lon += 360;
  const index = Math.floor(lon / 30);
  return ZODIAC_SIGNS[index % 12];
};

const calculateAscendant = (time: any, lat: number, lng: number): number => {
  // 1. Sidereal Time (Yıldız Zamanı) Kontrolü
  if (!Astronomy.SiderealTime) {
    console.error("⚠️ SiderealTime fonksiyonu bulunamadı!");
    return 0;
  }

  // 2. GMST Hesapla
  const gmst = Astronomy.SiderealTime(time);
  
  // 3. Yerel Yıldız Zamanı (LMST)
  const lmst = (gmst + lng / 15.0) % 24.0;
  const ramc = lmst * 15.0; // Dereceye çevir

  // 4. Ecliptic Obliquity (Dünya'nın Eğikliği)
  // BURASI KRİTİK NOKTA: Veri gelmezse standart değeri (23.43) kullan.
  let trueObliquity = 23.4392911; // Standart J2000 eğikliği (Fallback)
  
  try {
    if (Astronomy.e_tilt) {
      const obliquityData = Astronomy.e_tilt(time);
      // Veri sayı mı obje mi kontrol et
      if (typeof obliquityData === 'number') {
        trueObliquity = obliquityData;
      } else if (obliquityData && typeof obliquityData === 'object') {
         trueObliquity = obliquityData.obl || obliquityData.obliquity || obliquityData.total || trueObliquity;
      }
    }
  } catch (e) {
    console.log("⚠️ Obliquity hesaplanamadı, standart değer kullanılıyor:", trueObliquity);
  }

  // 5. Trigonometrik Hesaplama
  const rad = (deg: number) => (deg * Math.PI) / 180.0;
  const deg = (rad: number) => (rad * 180.0) / Math.PI;

  const ramcRad = rad(ramc);
  const epsRad = rad(trueObliquity);
  const latRad = rad(lat);

  // Formül: tan(Asc) = cos(RAMC) / ( -sin(RAMC) * cos(eps) - tan(lat) * sin(eps) )
  const numerator = Math.cos(ramcRad);
  const denominator = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
  
  let ascRad = Math.atan2(numerator, denominator);
  let ascDeg = deg(ascRad);

  if (ascDeg < 0) ascDeg += 360;

  return ascDeg;
};

export const calculateFullChart = (profile: UserProfile): NatalChart => {
  console.log("📍 Hesaplama Başladı...");

  const AstroTime = Astronomy.AstroTime;
  const dateObj = new Date(profile.birthDate);
  const [hours, minutes] = profile.birthTime.split(':').map(Number);
  dateObj.setHours(hours);
  dateObj.setMinutes(minutes);

  const astroTime = new AstroTime(dateObj);

  // --- GÜNEŞ (Çalışıyor) ---
  const sunData = Astronomy.SunPosition(astroTime);
  const sunLon = sunData.elon || sunData.lon; 

  // --- AY (Çalışıyor) ---
  const moonData = Astronomy.EclipticGeoMoon(astroTime);
  const moonLon = moonData.lon || moonData.elon;

  // --- YÜKSELEN (Artık Güvenli) ---
  const ascDegree = calculateAscendant(astroTime, profile.birthCity.lat, profile.birthCity.lng);
  
  console.log(`✅ SONUÇLAR -> Güneş: ${sunLon}, Ay: ${moonLon}, Yükselen Derece: ${ascDegree}`);

  return {
    sunSign: getSignFromLongitude(sunLon) || "Bilinmiyor",
    moonSign: getSignFromLongitude(moonLon) || "Bilinmiyor",
    risingSign: getSignFromLongitude(ascDegree) || "Bilinmiyor"
  };
};