import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export const shareContent = async (viewRef: React.RefObject<any>) => {
  try {
    // 1. Ekran görüntüsünü al (Yüksek kalite)
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1, // En yüksek kalite
      result: "tmpfile", // Geçici dosya
    });

    // 2. Paylaşım menüsünü aç
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Hata", "Paylaşım bu cihazda desteklenmiyor.");
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: "Astropot Analizini Paylaş",
      UTI: "image/png", // iOS için
    });

  } catch (error) {
    console.error("Share Error:", error);
    Alert.alert("Hata", "Görüntü oluşturulurken bir sorun çıktı.");
  }
};