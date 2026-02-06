// src/types.ts

export interface City {
    id: string;
    name: string;
    lat: number;
    lng: number;
  }
  
  export interface NatalChart {
    sunSign: string;    // Güneş Burcu (Öz Benlik)
    moonSign: string;   // Ay Burcu (Duygular)
    risingSign: string; // Yükselen (Dış Görünüş)
    // İleride buraya Mars, Venüs vb. eklenebilir
  }
  
  export interface UserProfile {
    name: string;
    gender: string;
    birthDate: string; // ISO String (Örn: "2000-01-01T00:00:00.000Z")
    birthTime: string; // "07:00" formatında
    birthCity: City;   // Seçilen şehir ve koordinatları
    
    job: string;          // Öğrenci, Memur vb.
    relationship: string; // Bekar, Platonik vb.
    
    chart?: NatalChart;   // Hesaplandıktan sonra eklenecek
  }