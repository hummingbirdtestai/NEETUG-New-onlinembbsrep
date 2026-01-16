// practice.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Eye, EyeOff, Bookmark, XCircle, ArrowUp, ArrowDown, Filter } from "lucide-react-native";
import { SubjectFilterBubble } from "@/components/SubjectFilterBubble";
import { ChapterFilterBubble } from "@/components/ChapterFilterBubble";
import { PracticeCard } from "@/components/PracticeCard";
import { usePracticeData } from "@/hooks/usePracticeData";
import MainLayout from "@/components/MainLayout";
import { supabase } from "@/lib/supabaseClient";
import { FlatList } from "react-native";
// 🔴 ADD THIS EXACT LINE
console.log("🚨 practice.tsx FILE LOADED 🚨");
export default function PracticeScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [containersVisible, setContainersVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Anatomy");
  const [selectedCategory, setSelectedCategory] =
    useState<"all" | "bookmarked" | "wrong">("all");

const chaptersBySubject: Record<string, string[]> = {
  "Anatomy": [
    "General Anatomy",
    "Neuroanatomy",
    "Upper Limb",
    "Lower Limb",
    "Thorax",
    "Head & Neck",
    "Abdomen",
    "Pelvis & Perineum",
    "Histology",
    "Embryology & Genetics"
  ],

  "Physiology": [
    "General Physiology",
    "Systemic Physiology",
    "Basic Sciences Applied to Physiology",
    "Applied Physiology",
    "Physiology – Core Concepts"
  ],

  "Biochemistry": [
    "General Biochemistry",
    "Enzymology",
    "Carbohydrate Metabolism",
    "Lipid Metabolism",
    "Protein & Amino Acid Metabolism",
    "Molecular Biology",
    "Nutrition",
    "Immunology & Cancer Biology",
    "Clinical Biochemistry",
    "Integrated / Clinical Correlation"
  ],

  "Microbiology": [
  "General Microbiology & Immunology",
  "Central Nervous System Infections",
  "Respiratory Tract Infections",
  "Gastrointestinal & Hepatobiliary Infections",
  "Genitourinary & Sexually Transmitted Infections",
  "Cardiovascular & Bloodstream Infections",
  "Skin, Soft Tissue & Musculoskeletal Infections",
  "Dermatology, Leprosy & Venereology",
  "Zoonotic & Emerging Infections",
  "Hospital-Acquired & Surgical Infections",
  "Dental & Oral Microbiology",
  "Applied & Integrated Microbiology"
],


  "Pharmacology": [
    "Clinical Pharmacology",
    "Experimental Pharmacology",
    "Basic Sciences Applied to Pharmacology",
    "Systemic Pharmacology",
    "Pharmacology – Core Concepts"
  ],

  "Pathology": [
    "General Pathology",
    "Pathology – Core Concepts",
    "Clinical Pathology",
    "Genetic & Pediatric Pathology",
    "Hematology",
    "Systemic Pathology",
    "Applied & Integrated Pathology"
  ],

  "PSM": [
    "Introduction to Community Medicine",
    "Environmental Health",
    "Health Promotion & Health Education",
    "Nutrition & Public Health",
    "Biostatistics & Demography",
    "Epidemiology",
    "Family Welfare & RMNCH",
    "Occupational Health",
    "Geriatrics & Ageing",
    "Mental Health",
    "Health Care Delivery System",
    "Recent Advances in Community Medicine",
    "Integrated / Applied Community Medicine"
  ],

  "Forensic": [
    "Introduction & General Principles of Forensic Medicine",
    "Forensic Pathology",
    "Clinical Forensic Medicine",
    "Medical Jurisprudence & Ethics",
    "Forensic Psychiatry",
    "Forensic Investigations & Laboratory Medicine",
    "General Toxicology",
    "Chemical Toxicology",
    "Pharmaceutical Toxicology",
    "Biological Toxicology",
    "Sociomedical Toxicology",
    "Environmental Toxicology",
    "Applied & Integrated Forensic Medicine"
  ],

  "ENT": [
    "Basic Sciences of ENT",
    "ENT Clinical Examination & Procedures",
    "Diseases of Ear, Nose & Throat",
    "Applied & Integrated ENT"
  ],

  "Ophthalmology": [
    "Clinical Examination of the Eye",
    "Lids, Adnexa & Orbit",
    "Conjunctiva",
    "Cornea & Sclera",
    "Anterior Segment (Iris & Anterior Chamber)",
    "Lens (Cataract & Related Disorders)",
    "Retina & Optic Nerve",
    "Systemic Diseases & Miscellaneous Ophthalmology"
  ],

  "General Medicine": [
    "Cardiology",
    "Respiratory Medicine",
    "Infectious Diseases",
    "Gastroenterology & Hepatology",
    "Rheumatology",
    "Hematology",
    "Nephrology",
    "Endocrinology & Metabolic Disorders",
    "Oncology",
    "Neurology",
    "Toxicology & Emergency Medicine",
    "Nutrition, Fluids & Electrolytes",
    "Geriatric Medicine",
    "Community & Preventive Medicine",
    "Basic Sciences Integration",
    "Systemic & Allied Specialties",
    "Allied Clinical Specialties"
  ],

  "General Surgery": [
    "Head & Neck and Oral Surgery",
    "Principles of Surgery",
    "Blood Transfusion & Hemostasis",
    "Surgical Infections & Trauma",
    "Anaesthesia & Perioperative Care",
    "Advanced & Specialized Surgery",
    "Skin & Soft Tissue Surgery",
    "Endocrine Surgery",
    "Abdominal & Gastrointestinal Surgery",
    "Breast Surgery",
    "Cardiothoracic Surgery",
    "Vascular Surgery",
    "Urology & Male Genital Surgery",
    "Basic Sciences for Surgery",
    "Allied Clinical Disciplines"
  ],

  "Obstetrics": [
    "Community Obstetrics & Public Health",
    "Basics of Reproduction & Preconception Care",
    "Medical Disorders Complicating Pregnancy",
    "Fetal Growth, Placenta & Physiology",
    "Diagnosis & Early Pregnancy Disorders",
    "Newborn Care & Lactation",
    "Antenatal Care & Maternal Adaptation",
    "Obstetric Hemorrhage",
    "Multiple & High-Risk Pregnancy",
    "Labour & Operative Obstetrics",
    "Pelvis, Fetal Lie & Presentation",
    "Third Stage & Puerperium",
    "Imaging & Fetal Monitoring",
    "Obstetric Skills & Procedures",
    "Clinical Observation & Case Based Learning"
  ],

  "Gynecology": [
    "Applied & Integrated Gynecology",
    "Anatomy & Development of Female Reproductive System",
    "Gynecological Oncology & Pathology",
    "Contraception & Family Planning",
    "Genital Tract Infections & Vaginal Discharge",
    "Puberty & Adolescent Gynecology",
    "Menstrual Disorders",
    "Genital Injuries & Fistulae",
    "Reproductive Endocrinology & Infertility",
    "Benign Disorders of Uterus & Pelvic Floor",
    "Menopause & Postmenopausal Disorders",
    "Gynecological Oncology – Adjuvant Therapy"
  ],

  "Pediatrics": [
    "Growth, Development & Adolescence",
    "Pediatrics – Core Concepts",
    "Pediatric Nutrition",
    "Pediatric Endocrinology & Metabolism",
    "Neonatology",
    "Pediatric Infections & Immunization",
    "System-wise Pediatrics",
    "Pediatric Emergencies",
    "Pediatric Hematology & Oncology",
    "Applied & Integrated Pediatrics"
  ],

  "Orthopaedics": [
    "Traumatology & Fractures",
    "Amputation & Rehabilitation",
    "Neurological Conditions with Orthopaedic Relevance",
    "Orthopaedic Infections",
    "Congenital & Paediatric Orthopaedics",
    "Overview of Musculoskeletal System",
    "Degenerative & Inflammatory Joint Disorders",
    "Neuro-Orthopaedics",
    "Metabolic & Neoplastic Bone Diseases",
    "Integrated & Systemic Orthopaedics",
    "Orthopaedic Procedures & Patient Care",
    "Basic Sciences in Orthopaedics"
  ],

  "Dermatology": [
    "Acne and Related Disorders",
    "Pigmentary Disorders",
    "Papulosquamous Disorders",
    "Parasitic Infestations",
    "Fungal Infections of Skin",
    "Viral Infections of Skin",
    "Leprosy",
    "Sexually Transmitted Infections",
    "Inflammatory Dermatoses",
    "Vesiculobullous Disorders",
    "Bacterial Infections of Skin",
    "Connective Tissue Disorders",
    "Nutritional and Metabolic Dermatoses",
    "Systemic Diseases and Skin",
    "Basic Sciences in Dermatology"
  ],

  "Psychiatry": [
    "Psychiatry – Core Concepts",
    "Introduction & Mental Health",
    "Major Psychiatric Disorders",
    "Personality & Sexual Disorders",
    "Psychiatry Across Age Groups",
    "Psychiatric Emergencies",
    "Psychiatric Treatment",
    "Applied Psychiatry"
  ],

  "Anaesthesiology": [
    "Introduction & Patient Safety",
    "Resuscitation & Emergency Anaesthesia",
    "Preoperative Assessment & Preparation",
    "General Anaesthesia",
    "Regional Anaesthesia",
    "Post-Anaesthesia Care",
    "Critical Care & Intensive Care Medicine",
    "Pain Medicine",
    "Fluid Therapy & Blood Management",
    "Applied & Integrated Anaesthesiology"
  ],

  "Radiodiagnosis": [
    "Radiation Physics & Safety",
    "System-wise Radiology"
  ],

  "Radiotherapy": [
    "Principles of Radiotherapy",
    "Radiation Safety",
    "Radiotherapy Techniques",
    "Cancer Epidemiology & Prevention",
    "Applied Radiotherapy"
  ]
};
  
const initialChapter =
  chaptersBySubject["Anatomy"]?.[0] ?? "";
const [selectedChapter, setSelectedChapter] = useState(initialChapter);

  const [userId, setUserId] = useState<string | null>(null);
  const [showScrollControls, setShowScrollControls] = useState(false);
   // ✅ FIX 1 — declare ref BEFORE scroll effect
  const listRef = React.useRef<FlatList>(null);

const subjects = [
  // 1st MBBS
  "Anatomy",
  "Physiology",
  "Biochemistry",

  // 2nd MBBS
  "Microbiology",
  "Pharmacology",
  "Pathology",
  "PSM",
  "Forensic",

  // 3rd MBBS – Part 1
  "ENT",
  "Ophthalmology",

  // 3rd MBBS – Part 2 / Final
  "General Medicine",
  "General Surgery",
  "Obstetrics",
  "Gynecology",
  "Pediatrics",
  "Orthopaedics",
  "Dermatology",
  "Psychiatry",
  "Anaesthesiology",
  "Radiodiagnosis",
  "Radiotherapy"
];


  const currentChapters = chaptersBySubject[selectedSubject] || [];

 
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    loadUser();
  }, []);

  
const handleSubjectChange = (subj: string) => {
  setSelectedSubject(subj);

  const chapters = chaptersBySubject[subj];
  const nextChapter = chapters?.[0] ?? "";

  setSelectedChapter(nextChapter);   // NEVER null
};



 const practiceData = usePracticeData(selectedChapter, userId, selectedCategory);
 const {
  phases,
  loading,
  refreshing,
  refresh,
  loadMore,
  isLoadingMore,
  hasMoreData
} = practiceData;
  const PAGE_LIMIT = 20;
 // Scroll to top ONLY when subject or category changes
useEffect(() => {
  if (listRef.current) {
    listRef.current.scrollToOffset({ offset: 0, animated: true });
  }
}, [selectedCategory, selectedChapter]);




  return (
    <MainLayout isHeaderHidden={isMobile && !containersVisible}>
      <View style={styles.container}>

  {(containersVisible || !isMobile) && (
    <View style={styles.headerBlock}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subjectsContainer}
        style={[
          styles.subjectsScroll,
          isMobile && { marginBottom: 8 }
        ]}
      >
        {subjects.map((subj) => (
          <SubjectFilterBubble
            key={subj}
            subject={subj}
            selected={selectedSubject === subj}
            onPress={() => handleSubjectChange(subj)}
          />
        ))}
      </ScrollView>

      {currentChapters.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chaptersContainer}
          style={[
            styles.chaptersScroll,
            isMobile && { marginBottom: 8 }
          ]}
        >
          {currentChapters.map((chapter) => (
            <ChapterFilterBubble
              key={chapter}
              chapter={chapter}
              selected={selectedChapter === chapter}
              onPress={() => setSelectedChapter(chapter)}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryIcon, selectedCategory === "all" && styles.categoryIconSelected]}
          onPress={() => setSelectedCategory("all")}
        >
          <Filter size={20} color={selectedCategory === "all" ? "#fff" : "#10b981"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryIcon, selectedCategory === "bookmarked" && styles.categoryIconSelected]}
          onPress={() => setSelectedCategory("bookmarked")}
        >
          <Bookmark
            size={20}
            color={selectedCategory === "bookmarked" ? "#fff" : "#10b981"}
            fill={selectedCategory === "bookmarked" ? "#fff" : "transparent"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryIcon, selectedCategory === "wrong" && styles.categoryIconSelected]}
          onPress={() => setSelectedCategory("wrong")}
        >
          <XCircle size={20} color={selectedCategory === "wrong" ? "#fff" : "#10b981"} />
        </TouchableOpacity>
      </View>
    </View>
  )}

  {/* CONTENT */}
        {!userId ? (
          <View style={{ padding: 40 }}>
            <Text style={{ color: "#bbb", fontSize: 16, textAlign: "center" }}>
              Please sign in to view concepts.
            </Text>
          </View>
        ) : (
   <FlatList
   key={`${selectedChapter}-${selectedCategory}`}
  ref={listRef}
  data={phases}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <PracticeCard phase={item} />}
  contentContainerStyle={styles.cardsWrapper}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#10b981" />
  }
  onScroll={(e) => {
    const offsetY = e.nativeEvent.contentOffset.y;

    if (isMobile && offsetY > 10) {
      if (!hasScrolled) {
        setHasScrolled(true);
      }
      if (containersVisible) {
        setContainersVisible(false);
      }
    }

    if (offsetY > 100) {
      setShowScrollControls(true);
    } else {
      setShowScrollControls(false);
    }
  }}
  scrollEventThrottle={16}

  initialNumToRender={8}
  maxToRenderPerBatch={6}
  windowSize={10}
  removeClippedSubviews={true}

  onEndReached={() => {
    if (
      hasMoreData &&
      !isLoadingMore &&
      !loading &&
      phases.length >= PAGE_LIMIT       // ⭐ REQUIRED FIX FOR WEB FLICKER
    ) {
      loadMore();
    }
  }}
  onEndReachedThreshold={hasMoreData ? 0.5 : 0.01}

  ListFooterComponent={
    isLoadingMore ? (
      <View style={{ padding: 20 }}>
        <Text style={{ textAlign: "center", color: "#999" }}>Loading more…</Text>
      </View>
    ) : null
  }
/>
        )}

        {isMobile && !containersVisible && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setContainersVisible(true)}
          >
            <Filter size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {showScrollControls && (
          <View style={styles.scrollControlsWrapper}>
            <TouchableOpacity
              style={styles.scrollBtn}
              onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
            >
              <ArrowUp size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scrollBtn}
              onPress={() => listRef.current?.scrollToEnd({ animated: true })}
            >
              <ArrowDown size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b141a" },

  headerBlock: {
    paddingTop: 8,
    backgroundColor: "#0b141a",
    zIndex: 10,
  },

  subjectsScroll: { marginBottom: 16 },

  subjectsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexWrap: "wrap",
  },

  chaptersScroll: { marginBottom: 16 },

  chaptersContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexWrap: "wrap",
  },

  cardsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  categoryContainer: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0d0d0d",
  },

  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },

  categoryIconSelected: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },

  scrollControlsWrapper: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "center",
    zIndex: 999,
  },

  scrollBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },

  fab: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
});
