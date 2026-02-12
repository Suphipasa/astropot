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
  if (!Astronomy.SiderealTime) return 0;
  const gmst = Astronomy.SiderealTime(time);
  const lmst = (gmst + lng / 15.0) % 24.0;
  const ramc = lmst * 15.0;
  
  let trueObliquity = 23.4392911;
  try {
     if (Astronomy.e_tilt) {
       const o = Astronomy.e_tilt(time);
       trueObliquity = (typeof o === 'number') ? o : (o?.obl || o?.total || trueObliquity);
     }
  } catch(e) {}
  
  const rad = (d: number) => (d * Math.PI) / 180.0;
  const deg = (r: number) => (r * 180.0) / Math.PI;
  const numerator = Math.cos(rad(ramc));
  const denominator = -Math.sin(rad(ramc)) * Math.cos(rad(trueObliquity)) - Math.tan(rad(lat)) * Math.sin(rad(trueObliquity));
  let asc = deg(Math.atan2(numerator, denominator));
  if (asc < 0) asc += 360;
  return asc;
};

// 🛠️ YENİ EKLENEN: TÜRKİYE TARİHSEL YAZ SAATİ HESAPLAYICI
// Verilen tarihin ve saatin UTC+2 (Kış) mi yoksa UTC+3 (Yaz) mü olduğunu kesin olarak bulur.
const getTurkeyHistoricalOffset = (year: number, month: number, day: number, hours: number): number => {
  // 2016 sonbaharından itibaren Türkiye'de kalıcı yaz saati (UTC+3) uygulandı.
  if (year > 2016 || (year === 2016 && (month > 10 || (month === 10 && day >= 30)))) {
    return 3;
  }
  
  // Belirtilen ayın son pazar gününü bulan yardımcı fonksiyon
  const getLastSunday = (y: number, m: number) => {
    const lastDay = new Date(y, m, 0); // O ayın son günü (m: 1-12 formatı kullanıldığında o ayın 0. günü önceki ayın sonudur. JS'de ay 0'dan başladığı için mantık doğru çalışır)
    return lastDay.getDate() - lastDay.getDay();
  };

  const marchLastSunday = getLastSunday(year, 3);
  const octLastSunday = getLastSunday(year, 10);

  let isDST = false;

  // Türkiye'de yaz saati Mart'ın son Pazar'ı saat 03:00'te başlar, Ekim'in son Pazar'ı 04:00'te biterdi.
  if (month > 3 && month < 10) {
    isDST = true;
  } else if (month === 3) {
    if (day > marchLastSunday || (day === marchLastSunday && hours >= 3)) isDST = true;
  } else if (month === 10) {
    if (day < octLastSunday || (day === octLastSunday && hours < 4)) isDST = true;
  }

  return isDST ? 3 : 2; // Yaz saati ise UTC+3, Kış ise UTC+2
};

export const calculateFullChart = (profile: UserProfile): NatalChart => {
  console.log("📍 HESAPLAMA BAŞLIYOR: ", profile.birthDate, profile.birthTime);

  const AstroTime = Astronomy.AstroTime;
  
  // 1. TARİHİ PARÇALA
  const dateParts = String(profile.birthDate).split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);

  // 2. SAATİ PARÇALA
  const [hours, minutes] = profile.birthTime.split(':').map(Number);

  // 3. TARİHSEL SAAT DİLİMİ OFFSETİNİ BUL (CRITICAL FIX)
  const offsetHours = getTurkeyHistoricalOffset(year, month, day, hours);

  console.log(`🛠️ İşlenen Tarih: ${day}.${month}.${year} - Saat: ${hours}:${minutes} (Kullanılan Dilim: UTC+${offsetHours})`);

  // 4. NET UTC ZAMANI OLUŞTUR (Cihazın nerede olduğunu tamamen görmezden geliyoruz)
  // Doğum saatinden offset'i çıkarırsak gerçek UTC (Londra) zamanını buluruz.
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours - offsetHours, minutes));
  const astroTime = new AstroTime(utcDate);

  // --- HESAPLAMALAR ---
  const sunData = Astronomy.SunPosition(astroTime);
  const sunLon = sunData.elon || sunData.lon;

  // --- AY (Çalışıyor) ---
  const moonData = Astronomy.EclipticGeoMoon(astroTime);
  const moonLon = moonData.lon || moonData.elon;

  // --- YÜKSELEN (Artık Güvenli) ---
  const ascDegree = calculateAscendant(astroTime, profile.birthCity.lat, profile.birthCity.lng);
  
  console.log(`✅ SONUÇLAR -> Güneş: ${sunLon.toFixed(2)}, Ay: ${moonLon.toFixed(2)}, Yükselen: ${ascDegree.toFixed(2)}`);

  return {
    sunSign: getSignFromLongitude(sunLon) || "Bilinmiyor",
    moonSign: getSignFromLongitude(moonLon) || "Bilinmiyor",
    risingSign: getSignFromLongitude(ascDegree) || "Bilinmiyor"
  };
};