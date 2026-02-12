export interface City {
  name: string;
  lat: number;
  lng: number;
}

export interface NatalChart {
  sunSign: string;
  moonSign: string;
  risingSign: string;
}

export interface UserProfile {
  id: string; // 👈 EKLENEN SATIR: Artık ID kabul edilecek
  name: string;
  birthDate: string; // String olarak güncelledik (YYYY-MM-DD)
  birthTime: string;
  birthCity: City;
  gender: 'Erkek' | 'Kadın' | 'Diğer';
  job: string;
  relationship: string;
  chart?: NatalChart; // Harita sonradan hesaplanıp eklenebilir
}