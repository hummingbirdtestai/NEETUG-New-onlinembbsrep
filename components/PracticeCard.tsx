//practicecard.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useWindowDimensions } from "react-native";
import HighYieldFactSheetScreen from "@/components/types/HighYieldFactSheetScreen";
import MCQChatScreen from "@/components/types/MCQScreen";
import { TouchableOpacity } from "react-native";
import { Bookmark } from "lucide-react-native";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import CBMERenderer from "@/components/types/CBMERenderer";

export function PracticeCard({ phase }) {
   const { width } = useWindowDimensions();
  const isWeb = width >= 1024;
  const isConcept = phase.phase_type === "concept";
  const isMCQ = phase.phase_type === "mcq";
  const { user } = useAuth();
  const router = useRouter();
const [isBookmarked, setIsBookmarked] = React.useState(phase.is_bookmarked);
  const subjectName = phase.subject ?? phase.textbook_chapter;

  React.useEffect(() => {
    if (phase.phase_type === "concept") {
      console.log("📗 [PracticeCard] Concept Loaded", {
        concept_id: phase.id,
      });
    }

    if (phase.phase_type === "mcq") {
      console.log("📘 [PracticeCard] MCQ Loaded", {
        mcq_id: phase.id,
        concept_before: phase.concept_id_before_this_mcq,
        correct_answer: phase.phase_json?.correct_answer,
      });
    }
  }, [phase]);

  const ViewNotesButton = ({ label }: { label: string }) => (
    <TouchableOpacity
      style={{
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#0d2017",
        borderWidth: 1,
        borderColor: "#10b981",
        alignItems: "center",
      }}
      onPress={() =>
        router.push({
          pathname: "/notes-popup",
          params: {
            phase_id: phase.id,
          },
        })
      }
    >
      <Text style={{ color: "#10b981", fontWeight: "700", textAlign: "center" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.card, isConcept && styles.cardConcept]}>
<Text style={[styles.subject, isConcept && styles.subjectConcept]}>
  {subjectName}
</Text>
<View style={[styles.bookmarkRow, isConcept && styles.bookmarkRowConcept]}>
  <TouchableOpacity
    onPress={async () => {
      if (!user?.id) return;

console.log("🔖 Toggle practice bookmark", {
  practicecard_id: phase.id,
  subject: subjectName,
});

     const { data, error } = await supabase.rpc(
  "toggle_practice_bookmark_v1",
  {
    p_student_id: user.id,
    p_practicecard_id: phase.id,
    p_subject: subjectName,
  }
);

      if (error) {
        console.log("❌ Bookmark toggle error:", error);
        return;
      }

      const newState = data?.is_bookmark ?? !isBookmarked;
      setIsBookmarked(newState);
    }}
  >
    <Bookmark
      size={22}
      color="#10b981"
      strokeWidth={2}
      fill={isBookmarked ? "#10b981" : "transparent"}
    />
  </TouchableOpacity>
</View>

      <View style={[styles.progressRow, isConcept && styles.progressRowConcept]}>
        <Text style={styles.progressText}>
          {isMCQ ? "🧩 MCQ" : "🧠 Concept"} {phase.react_order_final} / {phase.total_count}
        </Text>
      </View>

{isConcept && (
  <>
    <CBMERenderer
      cbmeMeta={{
        chapter: phase.chapter,
        topic: phase.topic,
        chapter_order: phase.chapter_order,
        topic_order: phase.topic_order,
      }}
    />

    <HighYieldFactSheetScreen
      data={phase.phase_json?.concept ?? ""}
    />

    <ViewNotesButton label="📒 View AI Mentor Notes" />
  </>
)}

{isMCQ && (
  <View style={isWeb ? styles.webConstrained : undefined}>
<MCQChatScreen
  item={phase.phase_json}
  studentId={user?.id}
  mcqId={phase.id}
  correctAnswer={phase.phase_json?.correct_answer}
  reactOrderFinal={phase.react_order_final}
  phaseUniqueId={phase.id}
  subject={subjectName}
  isBookmarked={isBookmarked}
  reviewMode={false}
  mode="practice"
/>

<ViewNotesButton label="📒 View AI Mentor Notes" />

  </View>
)}

  
      {phase.image_url && (
        <Image source={{ uri: phase.image_url }} style={styles.image} />
      )}
   
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111b21",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardConcept: {
    paddingHorizontal: 0,
  },
  subject: {
    color: "#25D366",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  subjectConcept: {
    paddingHorizontal: 16,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginTop: 12,
  },
  bookmarkRow: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 999,
  },
  bookmarkRowConcept: {
    right: 16,
  },
  progressRow: {
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#0d2017",
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#25D3665",
  },
  progressRowConcept: {
    marginHorizontal: 16,
  },
  progressText: {
    color: "#25D366",
    fontSize: 13,
    fontWeight: "700",
  },
  webConstrained: {
  maxWidth: 860,
  alignSelf: "center",
  width: "100%",
},

});
