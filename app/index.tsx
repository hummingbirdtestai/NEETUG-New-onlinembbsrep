import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '@/components/HomeScreen';
import MainLayout from '@/components/MainLayout';

export default function Index() {
  const images = {
  // HERO
  img1: "https://paragraph.b-cdn.net/Hero%20webp.webp",

  // 🔁 REPLACED AS REQUESTED
  img2: "https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM1.webp", // Section2 – CBME mastery that works
  img3: "https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM5.webp", // Section3 – Daily AI support
  img4: "https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM2.webp", // Section4 – Mistakes → Mastery
  img6: "https://paragraph.b-cdn.net/final%20image.webp", // Section6 – 24×7 AI Mentor

  // ⛔ UNCHANGED (as per your instruction)
  img5: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img5.webp",
  img7: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img7.webp",
  img8: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img8.webp",
  img9: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img9.webp",
  img10: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img10.webp",
  img11: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img11.webp",
};


  return (
    <MainLayout>
  <HomeScreen images={images} />
</MainLayout>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
