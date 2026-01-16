//components/ParagraphMentorIntro.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';

const HERO_IMAGES = [
  'https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM1.webp',
  'https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM2.webp',
  'https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM3.webp',
  'https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM5.webp',
  'https://paragraph.b-cdn.net/final%20image.webp',
];

export default function ParagraphMentorIntro() {
  const [heroImage, setHeroImage] = useState<string>('');
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * HERO_IMAGES.length);
    setHeroImage(HERO_IMAGES[randomIndex]);
  }, []);

  return (
    <View style={styles.container}>
      {heroImage && (
        <Image
          source={{ uri: heroImage }}
          style={[
            styles.heroImage,
            isWeb && styles.heroImageWeb
          ]}
          resizeMode={isWeb ? 'contain' : 'cover'}
        />
      )}

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.mainHeading}>🎓 Paragraph AI Tutor</Text>
          <Text style={styles.subheading}>Your Personal Guide for MBBS CBME Mastery</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>🧭 How Paragraph Helps You Learn</Text>
          <Text style={styles.bodyText}>One concept at a time</Text>
          <Text style={styles.bodyText}>No rush</Text>
          <Text style={styles.bodyText}>No gaps</Text>
          <Text style={styles.bodyText}>{'\n'}You don't read randomly.</Text>
          <Text style={styles.bodyText}>You don't memorise blindly.</Text>
          <Text style={styles.bodyText}>You progress only when you truly understand.</Text>
          <Text style={styles.bodyTextBold}>{'\n'}Paragraph AI Tutor walks with you through the entire CBME journey — just like a senior mentor.</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>📚 What You Will Master</Text>
          <Text style={styles.bodyText}>4,577 CBME competency concepts</Text>
          <Text style={styles.bodyText}>22,885 high-yield practice MCQs</Text>
          <Text style={styles.bodyText}>1-on-1 AI mentoring for every topic</Text>
          <Text style={styles.bodyText}>Continuous revision and gap correction</Text>
          <Text style={styles.bodyTextBold}>{'\n'}This is self-learning done right.</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>🧠 How Each CBME Concept Is Taught</Text>
          <Text style={styles.bodyText}>Every topic follows the same powerful flow:</Text>

          <View style={styles.flowItem}>
            <Text style={styles.flowNumber}>1️⃣ Central Concept</Text>
            <Text style={styles.flowDetail}>Big idea first</Text>
            <Text style={styles.flowDetail}>Clear analogy</Text>
            <Text style={styles.flowDetail}>Why this topic matters</Text>
          </View>

          <View style={styles.flowItem}>
            <Text style={styles.flowNumber}>2️⃣ Core Anatomy / Physiology / Pathology</Text>
            <Text style={styles.flowDetail}>Layer-by-layer explanation</Text>
            <Text style={styles.flowDetail}>Cells → tissues → organs</Text>
            <Text style={styles.flowDetail}>Diagrams and tables</Text>
          </View>

          <View style={styles.flowItem}>
            <Text style={styles.flowNumber}>3️⃣ High-Yield Facts</Text>
            <Text style={styles.flowDetail}>NEET-PG and University exam points</Text>
            <Text style={styles.flowDetail}>What examiners love to ask</Text>
          </View>

          <View style={styles.flowItem}>
            <Text style={styles.flowNumber}>4️⃣ Clinical Scenarios</Text>
            <Text style={styles.flowDetail}>Real surgical and clinical reasoning</Text>
            <Text style={styles.flowDetail}>"What happens if this structure is damaged?"</Text>
          </View>

          <View style={styles.flowItem}>
            <Text style={styles.flowNumber}>5️⃣ Viva Voce Questions</Text>
            <Text style={styles.flowDetail}>Asked exactly like exams</Text>
            <Text style={styles.flowDetail}>Crisp answers you can reproduce</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>🧪 What Happens After the Concept</Text>
          <Text style={styles.bodyText}>Around 5 carefully chosen MCQs follow every concept</Text>
          <Text style={styles.bodyText}>{'\n'}These MCQs test:</Text>
          <Text style={styles.bodyText}>Understanding</Text>
          <Text style={styles.bodyText}>Application</Text>
          <Text style={styles.bodyText}>Common confusions</Text>
          <Text style={styles.bodyTextBold}>{'\n'}You don't move forward by guessing.</Text>
          <Text style={styles.bodyTextBold}>You move forward by mastery.</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>🔁 The Adaptive AI Pedagogy</Text>
          <Text style={styles.bodyText}>AI analyses every answer</Text>
          <Text style={styles.bodyText}>Finds learning gaps</Text>
          <Text style={styles.bodyText}>Re-explains the concept differently</Text>
          <Text style={styles.bodyText}>Tests again — recursively</Text>
          <Text style={styles.bodyText}>{'\n'}Until the concept becomes clear and permanent.</Text>
          <Text style={styles.bodyTextBold}>{'\n'}No gaps.</Text>
          <Text style={styles.bodyTextBold}>No false confidence.</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>🏆 End Result</Text>
          <Text style={styles.bodyText}>Strong concepts</Text>
          <Text style={styles.bodyText}>Confident MCQ solving</Text>
          <Text style={styles.bodyText}>Clinical thinking</Text>
          <Text style={styles.bodyTextBold}>{'\n'}Gold-medal-level understanding for University MBBS exams.</Text>
          <Text style={styles.bodyTextBold}>Solid foundation for NEET-PG / INI / USMLE.</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>👉 How to Begin</Text>
          <Text style={styles.bodyText}>Select your Year and Subject above.</Text>
          <Text style={styles.bodyText}>Then tap Start.</Text>
          <Text style={styles.bodyTextBold}>{'\n'}Your guided CBME journey begins.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0b141a',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#1c2730',
  },
  heroImageWeb: {
    height: 360,
    maxHeight: 420,
    objectFit: 'contain',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 16,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '500',
    color: '#d1d5db',
    lineHeight: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 12,
    lineHeight: 26,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 15,
    color: '#e5e7eb',
    lineHeight: 24,
    marginBottom: 4,
    textAlign: 'center',
  },
  bodyTextBold: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  flowItem: {
    marginTop: 12,
    paddingLeft: 8,
    alignItems: 'flex-start',
    width: '100%',
  },
  flowNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34d399',
    marginBottom: 6,
    lineHeight: 24,
    textAlign: 'left',
  },
  flowDetail: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 22,
    marginBottom: 3,
    paddingLeft: 8,
    textAlign: 'left',
  },
  divider: {
    height: 1,
    backgroundColor: '#1c2730',
    marginVertical: 16,
  },
});
