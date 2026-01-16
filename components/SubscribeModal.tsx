//SubscribeModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { X, Check, Zap, BookOpen, Brain, Image as ImageIcon, Video, FileText, MessageSquare, Users } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface SubscribeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: '12' | '24' | '36' | '48', finalPrice: number, promoCode?: string) => void;
}

const API_BASE = 'https://mainonlinembbspy-production.up.railway.app';

export default function SubscribeModal({ visible, onClose, onSubscribe }: SubscribeModalProps) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;

  
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!user?.id) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>
            Please login to subscribe
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#10b981', textAlign: 'center', marginTop: 20 }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  function waitForCashfree(timeout = 3000): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      if ((window as any).Cashfree) {
        clearInterval(timer);
        resolve((window as any).Cashfree);
      }
      if (Date.now() - start > timeout) {
        clearInterval(timer);
        reject(new Error("Cashfree SDK not loaded"));
      }
    }, 100);
  });
}

  
async function handleSubscribe(
  plan: '12' | '24' | '36' | '48',
  _uiPrice: number,
  promoCode?: string
) {
  try {
    setPaymentError(null);

    const CashfreeSDK = await waitForCashfree();

    const res = await fetch(`${API_BASE}/api/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan,
        coupon_code: promoCode || null,
        student_id: user.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setPaymentError(data?.detail || "Unable to start payment");
      return;
    }

    if (!data.payment_session_id) {
      setPaymentError("Unable to start payment");
      return;
    }

    console.log("Cashfree SDK:", CashfreeSDK);
    console.log("Payment Session ID:", data.payment_session_id);

    const cashfree = CashfreeSDK({
      mode: "production", // or "sandbox"
    });

    cashfree.checkout({
      paymentSessionId: data.payment_session_id,
      redirectTarget: '_self',
    });

  } catch (err) {
    console.error(err);
    setPaymentError("Payment system is loading. Please try again.");
  }
}

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#9ca3af" />
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.scrollContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, isDesktop && styles.headerDesktop]}>
            <Text style={[styles.headline, isDesktop && styles.headlineDesktop]}>Master MBBS with a System — Not Random Content</Text>
            <Text style={[styles.subHeadline, isDesktop && styles.subHeadlineDesktop]}>
              Paragraph is an AI-driven CBME learning system{'\n'}
              built to guide you through MBBS — concept by concept, year by year.
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>What Paragraph Actually Is</Text>

            <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
              <FeatureBlock
                icon={<BookOpen size={26} color="#10b981" />}
                title="CBME Curriculum Mastery Engine"
                bullets={[
                  '4,577 NMC-mapped CBME concepts',
                  'Competency-wise & year-wise structure',
                  'Concept → Recall → Application flow',
                  'Zero syllabus gaps',
                ]}
                isDesktop={isDesktop}
              />

              <FeatureBlock
                icon={<Brain size={26} color="#10b981" />}
                title="Flashcard Memory System"
                bullets={[
                  '50,000 high-yield flashcards',
                  'Spaced repetition across MBBS years',
                  'Automatic revision planning',
                  'Exam-oriented recall',
                ]}
                isDesktop={isDesktop}
              />

              <FeatureBlock
                icon={<MessageSquare size={26} color="#10b981" />}
                title="24×7 AI Tutor"
                bullets={[
                  'Instant doubt clearing',
                  'Explains based on your mistakes',
                  'Adapts daily study plan',
                  'Feels like a personal mentor',
                ]}
                isDesktop={isDesktop}
              />
            </View>
          </View>

          <View style={styles.divider} />
      
          {paymentError && (
        <View style={styles.paymentErrorBox}>
          <Text style={styles.paymentErrorText}>{paymentError}</Text>
        </View>
      )}

          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Subscription Plans</Text>

            <View style={[styles.plansGrid, isDesktop && styles.plansGridDesktop]}>
              <PlanCard
                duration="1 Year"
                basePrice={12000}
                color="#10b981"
                features={[
                  'Access to full CBME curriculum',
                  'Flashcards + AI Tutor',
                  'Ideal for single MBBS year',
                ]}
                onSubscribe={(price, code) => handleSubscribe('12', price, code)}
                isDesktop={isDesktop}
              />

              <PlanCard
                duration="2 Years"
                basePrice={20000}
                color="#3b82f6"
                features={[
                  'Deeper AI personalisation',
                  'Long-term flashcard memory',
                  'Best value per year',
                ]}
                onSubscribe={(price, code) => handleSubscribe('24', price, code)}
                isDesktop={isDesktop}
              />

              <PlanCard
                duration="3 Years"
                basePrice={28000}
                color="#8b5cf6"
                features={[
                  'Pre-final to internship coverage',
                  'Stronger adaptive learning',
                  'Highly cost-effective',
                ]}
                onSubscribe={(price, code) => handleSubscribe('36', price, code)}
                isDesktop={isDesktop}
              />

              <PlanCard
                duration="4 Years"
                basePrice={36000}
                color="#f59e0b"
                recommended
                features={[
                  'Complete MBBS journey',
                  'Maximum AI adaptation',
                  'Lowest cost per year',
                ]}
                onSubscribe={(price, code) => handleSubscribe('48', price, code)}
                isDesktop={isDesktop}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.trustSection}>
            <TrustBadge text="No ads" />
            <TrustBadge text="No distractions" />
            <TrustBadge text="Secure payments" />
            <TrustBadge text="Instant access after payment" />
          </View>

          <View style={styles.finalCta}>
            <Text style={styles.ctaTitle}>Start Your MBBS Journey Now</Text>
            <Text style={styles.ctaSubtitle}>
              Learn systematically. Master your curriculum.{'\n'}
              Build a strong foundation for your medical career.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function FeatureBlock({
  icon,
  title,
  subtitle,
  time,
  bullets,
  description,
  isDesktop,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  time?: string;
  bullets?: string[];
  description?: string;
  isDesktop?: boolean;
}) {
  return (
    <View style={[styles.featureBlock, isDesktop && styles.featureBlockDesktop]}>
      <View style={styles.featureHeader}>
        <View style={styles.featureIcon}>{icon}</View>
        <View style={styles.featureTitleContainer}>
          <Text style={styles.featureTitle}>{title}</Text>
          {subtitle && <Text style={styles.featureSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {time && (
        <View style={styles.featureTime}>
          <Text style={styles.featureTimeText}>{time}</Text>
        </View>
      )}
      {bullets && (
        <View style={styles.featureBullets}>
          {bullets.map((bullet, index) => (
            <Text key={index} style={styles.bulletText}>
              {bullet}
            </Text>
          ))}
        </View>
      )}
      {description && <Text style={styles.featureDescription}>{description}</Text>}
    </View>
  );
}

function PlanCard({
  duration,
  basePrice,
  color,
  recommended,
  features,
  onSubscribe,
  isDesktop,
}: {
  duration: string;
  basePrice: number;
  color: string;
  recommended?: boolean;
  features: string[];
  onSubscribe: (finalPrice: number, promoCode?: string) => void;
  isDesktop?: boolean;
}) {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [previewPrice, setPreviewPrice] = useState(basePrice);
  const [discountInfo, setDiscountInfo] = useState<{
    percent: number;
    amount: number;
  } | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  const plan =
    duration.startsWith('1') ? '12' :
    duration.startsWith('2') ? '24' :
    duration.startsWith('3') ? '36' : '48';

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a coupon code');
      return;
    }

    setIsCheckingCoupon(true);
    setPromoError('');

    try {
      const res = await fetch(`${API_BASE}/api/payments/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          coupon_code: promoCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPromoError(data?.detail || 'Invalid coupon');
        setPreviewPrice(basePrice);
        setDiscountInfo(null);
        return;
      }

      setPreviewPrice(data.final_amount);
      setDiscountInfo({
        percent: data.discount_percent,
        amount: data.discount_amount,
      });

    } catch {
      setPromoError('Unable to validate coupon');
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  return (
    <View style={[styles.planCard, recommended && styles.planCardRecommended, isDesktop && styles.planCardDesktop]}>
      {recommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Most students choose this</Text>
        </View>
      )}

<View style={styles.planHeader}>
  <Text style={styles.planDuration}>{duration}</Text>

  {discountInfo ? (
    <View>
      <Text style={styles.planPriceOriginal}>
        ₹{basePrice.toLocaleString('en-IN')}
      </Text>
      <Text style={[styles.planPrice, { color }]}>
        ₹{previewPrice.toLocaleString('en-IN')}
      </Text>
      <View style={styles.savingsBadge}>
        <Text style={styles.savingsText}>
          Save ₹{discountInfo.amount.toLocaleString('en-IN')} ({discountInfo.percent}%)
        </Text>
      </View>
    </View>
  ) : (
    <Text style={[styles.planPrice, { color }]}>
      ₹{basePrice.toLocaleString('en-IN')}
    </Text>
  )}
</View>

      
      <View style={styles.planPromoSection}>
        <View style={styles.planPromoInputContainer}>
          <TextInput
            style={styles.planPromoInput}
            placeholder="Promo code (optional)"
            placeholderTextColor="#6b7280"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.planPromoApplyButton}
            onPress={applyPromoCode}
            disabled={isCheckingCoupon}
          >
            <Text style={styles.planPromoApplyText}>
              {isCheckingCoupon ? 'Checking...' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>

        {promoError ? (
          <Text style={styles.planPromoError}>{promoError}</Text>
        ) : null}
      </View>

      <View style={styles.planFeatures}>
        {features.map((feature, index) => (
          <View key={index} style={styles.planFeature}>
            <Check size={16} color={color} />
            <Text style={styles.planFeatureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.planButton, { backgroundColor: color }]}
        onPress={() => onSubscribe(previewPrice, promoCode || undefined)}
      >
        <Text style={styles.planButtonText}>Subscribe Now</Text>
      </TouchableOpacity>
    </View>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <View style={styles.trustBadge}>
      <Check size={16} color="#10b981" />
      <Text style={styles.trustBadgeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F5E6D3',
    marginBottom: 16,
    lineHeight: 38,
  },
  subHeadline: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 16,
    lineHeight: 24,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 32,
  },
  featuresSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  featureBlock: {
    marginBottom: 28,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  featureTitleContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  featureTime: {
    backgroundColor: '#1f2937',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featureTimeText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
  },
  featureBullets: {
    marginLeft: 36,
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 4,
    lineHeight: 20,
  },
  featureDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 36,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  plansSection: {
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  planCardRecommended: {
    borderColor: '#f59e0b',
    backgroundColor: '#1a1108',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    backgroundColor: '#f59e0b',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  planHeader: {
    marginBottom: 16,
  },
  planDuration: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
  },
  planFeatures: {
    marginBottom: 20,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#d1d5db',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  planButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  trustBadgeText: {
    fontSize: 13,
    color: '#d1d5db',
    marginLeft: 6,
  },
  finalCta: {
    alignItems: 'center',
    marginTop: 16,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
  pricingContainer: {
    alignItems: 'flex-start',
  },
  planPriceOriginal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  savingsBadge: {
    backgroundColor: '#10b981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  scrollContentDesktop: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 60,
  },
  featuresGrid: {
    width: '100%',
  },
  featuresGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -12,
  },
  featureBlockDesktop: {
    width: '50%',
    paddingHorizontal: 12,
  },
  plansGrid: {
    width: '100%',
  },
  plansGridDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
    gap: 16,
  },
  planCardDesktop: {
    width: '24%',
    marginBottom: 16,
  },
  headerDesktop: {
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  headlineDesktop: {
    fontSize: 48,
    lineHeight: 56,
    textAlign: 'center',
  },
  subHeadlineDesktop: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    maxWidth: 800,
  },
  taglineDesktop: {
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
    maxWidth: 900,
  },
  planPromoSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  planPromoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planPromoInput: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#374151',
  },
  planPromoApplyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  planPromoApplyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  planPromoRemoveButton: {
    backgroundColor: '#1f2937',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  planPromoError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
  },
  planPromoSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#064e3b',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  planPromoSuccessText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '500',
  },
  paymentErrorBox: {
    backgroundColor: '#3f1d1d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  
  paymentErrorText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
