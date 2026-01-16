//ask-paragraph-mbbs.tsx
import MainLayout from '@/components/MainLayout';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { SUBJECTS_BY_YEAR } from '@/constants/subjects';
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import HighYieldFactSheetScreen from "@/components/types/HighYieldFactSheetScreen";
import MCQChatScreen from "@/components/types/MCQScreen";
import CBMERenderer from "@/components/types/CBMERenderer";
import { useRouter, useLocalSearchParams } from "expo-router";
import { theme } from '@/constants/theme';
import { StudentBubble } from '@/components/chat/StudentBubble';
import MentorBubbleReply from '@/components/types/MentorBubbleReply';
import { MessageInput } from '@/components/chat/MessageInput';
import LLMMCQCard from '@/components/chat/llm/LLMMCQCard';
import { ActivityIndicator } from 'react-native';
import SubjectProgressDashboard from '@/components/progress/SubjectProgressDashboard';
import ConfettiCannon from 'react-native-confetti-cannon';
import ParagraphMentorIntro from '@/components/ParagraphMentorIntro';

function stripControlBlocks(text: string) {
  return text
    .replace(/\[SYSTEM_RETRY\]/g, "")
    .replace(
      /\[(CORE_CONCEPT|GAP|EXPLANATION|COMMON_CONFUSION|MEMORY_HOOK|SUB_CONCEPT)\]:\s*/gi,
      ""
    )
    .replace(/\[STUDENT_REPLY_REQUIRED\]/g, "")
    .replace(/\[FEEDBACK_CORRECT\]/g, "")
    .replace(/\[FEEDBACK_WRONG\]/g, "")
     .replace(/\[SESSION_COMPLETED\]/g, "")
    .replace(/^Correct:\s*[A-D]\s*$/gim, "")
    .trim();
}

type Year = 'first' | 'second' | 'third' | 'final';

type Message = {
  id: string;
  text: string;
  sender: 'student' | 'mentor';
  timestamp: Date;
};

export default function AskParagraphChat() {
  console.log("🧨 AskParagraphChat MOUNTED");

  const [selectedYear, setSelectedYear] = useState<Year>('first');
  const [selectedSubject, setSelectedSubject] = useState<string>('Anatomy');
  const [chatStarted, setChatStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<any | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { phase_id } = useLocalSearchParams<{ phase_id?: string }>();
  
  console.log("🔎 route params:", { phase_id });

  const conversationRef = useRef<any[]>([]);
  const [showSubjectProgress, setShowSubjectProgress] = useState(true);
  const yearOptions: { key: Year; label: string }[] = [
    { key: 'first', label: 'First Year' },
    { key: 'second', label: 'Second Year' },
    { key: 'third', label: 'Third Year' },
    { key: 'final', label: 'Final Year' },
  ];
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeMcqId, setActiveMcqId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [tutorMode, setTutorMode] = useState<"idle" | "active">("idle");
  const [isStartingDiscussion, setIsStartingDiscussion] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasRetriedRef = useRef(false);
  const skipStudentAppendRef = useRef(false);
  const sendingLockRef = useRef(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    if (!chatStarted) return;

    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [conversation, isTyping, chatStarted]);

  // 🔹 NEW: Load phase from redirect (notes-popup)
  useEffect(() => {
    console.log("⚡ visit useEffect fired", {
      phase_id,
      user_id: user?.id,
      chatStarted,
    });

    if (!phase_id || !user?.id || chatStarted) return;

    const loadVisitedPhase = async () => {
      setLoadingPhase(true);

      const { data, error } = await supabase.rpc(
  "visit_phase_pointer",
  {
    p_student_id: user.id,
    p_phase_row_id: phase_id,
  }
);


      if (error || !data) {
        console.error("❌ visit_phase_pointer failed", error);
        setLoadingPhase(false);
        return;
      }

      console.log("✅ visit_phase_pointer SUCCESS", {
        phase_type: data.phase_type,
        react_order_final: data.react_order_final,
      });

      setCurrentPhase(data);

      // 🔑 THESE TWO LINES MAKE IT IDENTICAL TO START BUTTON
      setShowSubjectProgress(false);
      setChatStarted(true);

      setLoadingPhase(false);
    };

    loadVisitedPhase();
  }, [phase_id, user?.id]);

  const [nextSuggestions, setNextSuggestions] = useState<any[]>([]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isTyping || sendingLockRef.current) return;
    if (!user?.id || !activeMcqId) return;

    sendingLockRef.current = true;
    hasRetriedRef.current = false;

    if (!skipStudentAppendRef.current) {
      setConversation(prev => [
        ...prev,
        { role: "student", content: message }
      ]);
    }

    setIsTyping(true);

    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

      const res = await fetch(`${API_BASE_URL}/ask-paragraph-mbbs/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user.id,
          mcq_id: activeMcqId,
          message,
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const text = await res.text();

      setConversation(prev => [
        ...prev,
        { role: "mentor", content: text }
      ]);

      if (text.includes("[SESSION_COMPLETED]")) {
        setSessionCompleted(true);
        setTutorMode("idle");
        setShowConfetti(true);
      }

      setIsTyping(false);
      sendingLockRef.current = false;

    } catch (e) {
      console.error("Chat error", e);
      setIsTyping(false);
      sendingLockRef.current = false;
    }
  };

  const handleStartChat = async () => {
    setSessionCompleted(false);
    setShowSubjectProgress(false);
    if (!user?.id || !selectedSubject) return;

    setLoadingPhase(true);

    try {
      const { data, error } = await supabase.rpc(
        "start_pointer",
        {
          p_student_id: user.id,
          p_subject: selectedSubject,
        }
      );

      console.log("🟢 start_pointer RAW response:", {
        data,
        error,
      });

      if (data) {
        console.log("🧭 start_pointer PARSED:", {
          status: data.status,
          phase_type: data.phase_type,
          react_order_final: data.react_order_final,
          phase_row_id: data.phase_row_id,
          subject: data.subject,
          chapter: data.chapter,
          topic: data.topic,
          has_phase_json: !!data.phase_json,
          phase_json_keys: data.phase_json ? Object.keys(data.phase_json) : null,
        });
      }

      if (error) {
        console.error("❌ start_pointer error", error);
        return;
      }

      if (data?.status === "subject_completed") {
        alert("🎉 Subject completed!");
        return;
      }

      setCurrentPhase(data);
      setChatStarted(true);

    } finally {
      setLoadingPhase(false);
    }
  };

  const handleNextConcept = async () => {
    if (!user?.id || !currentPhase) return;

    setLoadingPhase(true);

    try {
      const { data, error } = await supabase.rpc(
        "next_pointer",
        {
          p_student_id: user.id,
          p_subject: currentPhase.subject,
          p_react_order_final: currentPhase.react_order_final,
        }
      );

      console.log("🟣 next_pointer RAW response:", { data, error });

      if (error) {
        console.error("❌ next_pointer error", error);
        return;
      }

      if (data?.status === "subject_completed") {
        alert("🎉 Subject completed!");
        return;
      }

      setCurrentPhase(data);
      setChatStarted(true);

    } finally {
      setLoadingPhase(false);
    }
  };

  const handleDiscussWithParagraph = async () => {
    setSessionCompleted(false);
    if (!currentPhase || !user?.id) return;
    setIsStartingDiscussion(true);
    setTutorMode("idle");
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

    const payload =
      currentPhase.phase_type === "concept"
        ? {
            type: "concept",
            chapter: currentPhase.chapter,
            topic: currentPhase.topic,
          }
        : currentPhase.phase_json;

    console.log("🚀 Ask-Paragraph START payload", {
      student_id: user.id,
      mcq_id: currentPhase.phase_row_id,
      mcq_payload: payload,
    });

    const res = await fetch(`${API_BASE_URL}/ask-paragraph-mbbs/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: user.id,
        mcq_id: currentPhase.phase_row_id,
        mcq_payload: payload,
      }),
    });

    if (!res.ok) {
      console.error("❌ Start failed", res.status);
      setIsStartingDiscussion(false);
      return;
    }

    const data = await res.json();

    setSessionId(data.session_id);
    setActiveMcqId(currentPhase.phase_row_id);
    setConversation(data.final_dialogs || []);
    setTutorMode("active");
    setIsStartingDiscussion(false);
  };

  const handleBackToSelection = () => {
    setChatStarted(false);
    setCurrentPhase(null);
    setSessionId(null);
    setActiveMcqId(null);
    setConversation([]);
    setTutorMode("idle");
    setIsStartingDiscussion(false);
    setSessionCompleted(false);
    setShowConfetti(false);
    setShowSubjectProgress(true);

    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    });
  };

  const renderSelectionScreen = () => (
    <View style={styles.selectionContainer}>
      <Text style={styles.instructionText}>
        Choose a Year and Subject to start learning and mastering CBME competencies
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillContainer}
        contentContainerStyle={styles.pillContentContainer}
      >
        {yearOptions.map((year) => (
          <TouchableOpacity
            key={year.key}
            style={[
              styles.pill,
              styles.pillYear,
              selectedYear === year.key && styles.pillSelected,
            ]}
            onPress={() => {
              setSelectedYear(year.key);
              setSelectedSubject(null);
              setShowSubjectProgress(false);
            }}
          >
            <Text
              style={[
                styles.pillText,
                selectedYear === year.key && styles.pillTextSelected,
              ]}
            >
              {year.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedYear && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillContainer}
          contentContainerStyle={styles.pillContentContainer}
        >
          {SUBJECTS_BY_YEAR[selectedYear].map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[
                styles.pill,
                styles.pillSubject,
                selectedSubject === subject && styles.pillSelected,
              ]}
              onPress={() => {
                setSelectedSubject(subject);
                setChatStarted(false);
                setShowSubjectProgress(true);
              }}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedSubject === subject && styles.pillTextSelected,
                ]}
              >
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedYear && selectedSubject && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillContainer}
          contentContainerStyle={styles.pillContentContainer}
        >
          <TouchableOpacity style={styles.startButton} onPress={handleStartChat}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );

  const renderPhase = () => {
    if (!currentPhase) return null;

    return (
      <View>
        <CBMERenderer
          cbmeMeta={{
            chapter: currentPhase.chapter,
            topic: currentPhase.topic,
            chapter_order: currentPhase.chapter_order,
            topic_order: currentPhase.topic_order,
          }}
        />

        {currentPhase.phase_type === "concept" && (
          <HighYieldFactSheetScreen
            data={currentPhase.phase_json?.concept ?? ""}
          />
        )}

        {currentPhase.phase_type === "mcq" && (
          <MCQChatScreen
            item={currentPhase.phase_json}
            studentId={currentPhase.student_id}
            mcqId={currentPhase.phase_row_id}
            correctAnswer={currentPhase.phase_json?.correct_answer}
            reactOrderFinal={currentPhase.react_order_final}
            phaseUniqueId={currentPhase.phase_row_id}
            subject={currentPhase.subject}
            isBookmarked={false}
            mode="practice"
          />
        )}
      </View>
    );
  };

  console.log("🧠 render state", {
    chatStarted,
    showSubjectProgress,
    hasCurrentPhase: !!currentPhase,
  });

  return (
    <MainLayout>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.webCenterWrapper}>
              <View style={styles.webContent}>
                {!chatStarted && renderSelectionScreen()}

                {!chatStarted && showSubjectProgress && selectedSubject && user?.id && (
                  <View style={{ marginTop: 12 }}>
                    <SubjectProgressDashboard
                      student_id={user.id}
                      subject={selectedSubject}
                    />
                  </View>
                )}

                {!chatStarted && (
                  <View style={{ marginTop: 16 }}>
                    <ParagraphMentorIntro />
                  </View>
                )}

                {chatStarted && (
                  <View style={styles.backButtonContainer}>
                    <TouchableOpacity onPress={handleBackToSelection}>
                      <Text style={styles.backButtonText}>← Back to Subjects</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {chatStarted && loadingPhase && (
                  <Text style={{ color: "#999", textAlign: "center", marginTop: 20 }}>
                    Loading…
                  </Text>
                )}

                {chatStarted && !loadingPhase && renderPhase()}

                {currentPhase && !sessionId && !isStartingDiscussion && (
                  <View style={styles.discussContainer}>
                    <TouchableOpacity
                      style={styles.discussButton}
                      onPress={handleDiscussWithParagraph}
                    >
                      <Text style={styles.discussButtonText}>
                        💬 Discuss with Paragraph AI Tutor
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {isStartingDiscussion && (
                  <MentorBubbleReply markdownText="⏳ *Paragraph AI Mentor is starting discussion…*" />
                )}

                {conversation
                  .filter(msg => msg.role !== "system")
                  .map((msg, index) =>
                    msg.role === "student" ? (
                      <StudentBubble key={index} text={msg.content} />
                    ) : (
                      <MentorBubbleReply
                        key={index}
                        markdownText={
                          typeof msg.content === "string"
                            ? stripControlBlocks(msg.content)
                            : ""
                        }
                      />
                    )
                  )
                }

                {sessionCompleted && (
                  <View style={styles.nextConceptContainer}>
                    <TouchableOpacity
                      style={styles.nextConceptButton}
                      onPress={() => {
                        setConversation([]);
                        setSessionCompleted(false);
                        setShowConfetti(false);
                        setTutorMode("idle");
                        setSessionId(null);
                        setActiveMcqId(null);
                        setIsStartingDiscussion(false);
                        setCurrentPhase(null);
                        hasRetriedRef.current = false;
                        handleNextConcept();
                      }}
                    >
                      <Text style={styles.nextConceptText}>
                        ▶ Next CBME Concept
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {isTyping && (
                  <MentorBubbleReply markdownText="💬 *Paragraph Mentor is typing…*" />
                )}
              </View>
            </View>
          </ScrollView>

          {tutorMode === "active" && sessionId && !sessionCompleted && (
            <View style={styles.inputContainer}>
              <MessageInput
                onSend={handleSendMessage}
                disabled={isTyping}
                placeholder="Answer or ask anything…"
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </View>

      {showConfetti && (
        <ConfettiCannon
          count={180}
          origin={{ x: -10, y: 0 }}
          fadeOut
        />
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b141a',
  },
  webCenterWrapper: {
    alignItems: 'center',
  },
  webContent: {
    width: '100%',
    maxWidth: 820,
  },
  selectionContainer: {
    flex: 1,
    paddingTop: 8,
    gap: 12,
  },
  instructionText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 8,
  },
  pillContainer: {
    flexGrow: 0,
  },
  pillContentContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#0b141a',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  pillSelected: {
    backgroundColor: '#0d2017',
    borderColor: '#10b981',
    borderWidth: 2,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 6,
  },
  pillYear: {
    borderRadius: 999,
    borderWidth: 1.8,
    backgroundColor: 'transparent',
    borderColor: '#10b981',
  },
  pillYearSelected: {
    backgroundColor: '#065f46',
    borderColor: '#10b981',
  },
  pillSubject: {
    borderRadius: 999,
    borderWidth: 1.8,
    backgroundColor: 'transparent',
    borderColor: '#10b981',
  },
  pillSubjectSelected: {
    backgroundColor: '#0d9668',
    borderColor: '#10b981',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  pillTextSelected: {
    color: '#ffffff',
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  messageRowStudent: {
    justifyContent: 'flex-end',
  },
  messageRowMentor: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  messageBubbleStudent: {
    backgroundColor: '#10b981',
    borderBottomRightRadius: 4,
  },
  messageBubbleMentor: {
    backgroundColor: '#1c2730',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextStudent: {
    color: '#fff',
  },
  messageTextMentor: {
    color: '#e0e0e0',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b949e',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#0b141a',
    borderTopWidth: 1,
    borderTopColor: '#1c2730',
  },
  input: {
    flex: 1,
    backgroundColor: '#1c2730',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 15,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#1c2730',
  },
  discussContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#1c2730",
    backgroundColor: "#0b141a",
  },
  discussButton: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#10b981",
    backgroundColor: "#0d2017",
    alignItems: "center",
  },
  discussButtonText: {
    color: "#10b981",
    fontSize: 15,
    fontWeight: "700",
  },
  nextConceptContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  nextConceptButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: "#10b981",
  },
  nextConceptText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
