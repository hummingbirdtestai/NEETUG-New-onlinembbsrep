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
  "Botany Class 11": [
    "Plant kingdom",
    "Morphology of flowering plants",
    "Anatomy of flowering plants",
    "Photosynthesis in higher Plants",
    "Respiration in plants",
    "Plant growth and development"
  ],

  "Botany Class 12": [
    "Sexual reproduction and flowering plants"
  ],

  "Zoology Class 11": [
    "The Living World",
    "Biological Classification",
    "Animal kingdom",
    "Structural organisation in animals",
    "Cell : The unit of life",
    "Biomolecules",
    "Cell cycle and cell division",
    "Breathing and exchange of gases",
    "Body fluids and circulation",
    "Excretory products and their elimination",
    "Locomotion and movement",
    "Neural control and coordination",
    "Chemical coordination and integration"
  ],

  "Zoology Class 12": [
    "Human reproduction",
    "Reproductive health",
    "Principles of inheritance and variation",
    "Molecular basis of inheritance",
    "Evolution",
    "Human health and disease",
    "Microbes in human welfare",
    "Biotechnology principles and processes",
    "Biotechnology and its applications",
    "Organism and population",
    "Ecosystem",
    "Biodiversity and its conservation"
  ],

  "Chemistry Class 11": [
    "Some basic concepts of chemistry",
    "Structure of atom",
    "Classification of elements and periodicity in properties",
    "Chemical bonding and molecular structure",
    "Thermodynamics",
    "Chemical Equilibrium",
    "Ionic equilibrium",
    "Redox reactions",
    "p block elements 1",
    "Purification and characterization of organic compounds",
    "Some basic concepts of organic chemistry",
    "Hydrocarbons"
  ],

  "Chemistry Class 12": [
    "Solutions",
    "Electrochemistry",
    "Chemical kinetics",
    "p block elements 2",
    "d-and f-block elements",
    "coordination compounds",
    "haloalkanes and haloarenes",
    "Alcohol phenol and ether",
    "aldehydes ketone and carboxylic acids",
    "Organic compounds containing nitrogen",
    "Biomolecules",
    "Principles related to practical chemistry"
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
  // Class 11
  "Botany Class 11",
  "Zoology Class 11",
  "Chemistry Class 11",

  // Class 12
  "Botany Class 12",
  "Zoology Class 12",
  "Chemistry Class 12"
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
