// app/cbme-learning-path.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Award, Star, Trophy, Sparkles, ChevronRight, ArrowLeft, CheckCircle2, Circle, Zap } from 'lucide-react-native';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const YEARS = [
  {
    year: "First Year",
    yearFull: "MBBS First Year",
    subjects: ["Anatomy", "Physiology", "Biochemistry"],
    color: "#4A90E2",
    bgColor: "rgba(74, 144, 226, 0.08)",
    borderColor: "rgba(74, 144, 226, 0.35)",
    icon: "book",
  },
  {
    year: "Second Year",
    yearFull: "MBBS Second Year",
    subjects: ["Pathology", "Pharmacology", "Microbiology"],
    color: "#B8D4A8",
    bgColor: "rgba(184, 212, 168, 0.08)",
    borderColor: "rgba(184, 212, 168, 0.35)",
    icon: "lab",
  },
  {
    year: "Third Year",
    yearFull: "MBBS Third Year",
    subjects: ["Forensic Medicine", "Community Medicine"],
    color: "#E91E63",
    bgColor: "rgba(233, 30, 99, 0.08)",
    borderColor: "rgba(233, 30, 99, 0.35)",
    icon: "research",
  },
  {
    year: "Final Year",
    yearFull: "MBBS Final Year",
    subjects: [
      "General Medicine",
      "Pediatrics",
      "Psychiatry",
      "Radiodiagnosis",
      "Radiotherapy",
      "Dermatology",
      "Gynecology",
      "Obstetrics",
      "General Surgery",
      "Anaesthesiology",
      "Orthopaedics",
      "ENT",
      "Ophthalmology",
    ],
    color: "#25D366",
    bgColor: "rgba(37, 211, 102, 0.08)",
    borderColor: "rgba(37, 211, 102, 0.35)",
    icon: "trophy",
  },
];

const SUBJECT_COLORS: Record<string, any> = {
  "Anatomy": { color: "#4A90E2", bgColor: "rgba(74, 144, 226, 0.08)", borderColor: "rgba(74, 144, 226, 0.35)" },
  "Physiology": { color: "#25D366", bgColor: "rgba(37, 211, 102, 0.08)", borderColor: "rgba(37, 211, 102, 0.35)" },
  "Biochemistry": { color: "#B8D4A8", bgColor: "rgba(184, 212, 168, 0.08)", borderColor: "rgba(184, 212, 168, 0.35)" },
  "Pathology": { color: "#E91E63", bgColor: "rgba(233, 30, 99, 0.08)", borderColor: "rgba(233, 30, 99, 0.35)" },
  "Pharmacology": { color: "#FF9800", bgColor: "rgba(255, 152, 0, 0.08)", borderColor: "rgba(255, 152, 0, 0.35)" },
  "Microbiology": { color: "#25D366", bgColor: "rgba(37, 211, 102, 0.08)", borderColor: "rgba(37, 211, 102, 0.35)" },
  "Forensic Medicine": { color: "#4A90E2", bgColor: "rgba(74, 144, 226, 0.08)", borderColor: "rgba(74, 144, 226, 0.35)" },
  "Community Medicine": { color: "#B8D4A8", bgColor: "rgba(184, 212, 168, 0.08)", borderColor: "rgba(184, 212, 168, 0.35)" },
  "General Medicine": { color: "#E91E63", bgColor: "rgba(233, 30, 99, 0.08)", borderColor: "rgba(233, 30, 99, 0.35)" },
  "Pediatrics": { color: "#FFD700", bgColor: "rgba(255, 215, 0, 0.08)", borderColor: "rgba(255, 215, 0, 0.35)" },
  "Psychiatry": { color: "#4A90E2", bgColor: "rgba(74, 144, 226, 0.08)", borderColor: "rgba(74, 144, 226, 0.35)" },
  "Radiodiagnosis": { color: "#FF9800", bgColor: "rgba(255, 152, 0, 0.08)", borderColor: "rgba(255, 152, 0, 0.35)" },
  "Radiotherapy": { color: "#E91E63", bgColor: "rgba(233, 30, 99, 0.08)", borderColor: "rgba(233, 30, 99, 0.35)" },
  "Dermatology": { color: "#25D366", bgColor: "rgba(37, 211, 102, 0.08)", borderColor: "rgba(37, 211, 102, 0.35)" },
  "Gynecology": { color: "#FFD700", bgColor: "rgba(255, 215, 0, 0.08)", borderColor: "rgba(255, 215, 0, 0.35)" },
  "Obstetrics": { color: "#B8D4A8", bgColor: "rgba(184, 212, 168, 0.08)", borderColor: "rgba(184, 212, 168, 0.35)" },
  "General Surgery": { color: "#E91E63", bgColor: "rgba(233, 30, 99, 0.08)", borderColor: "rgba(233, 30, 99, 0.35)" },
  "Anaesthesiology": { color: "#4A90E2", bgColor: "rgba(74, 144, 226, 0.08)", borderColor: "rgba(74, 144, 226, 0.35)" },
  "Orthopaedics": { color: "#FF9800", bgColor: "rgba(255, 152, 0, 0.08)", borderColor: "rgba(255, 152, 0, 0.35)" },
  "ENT": { color: "#25D366", bgColor: "rgba(37, 211, 102, 0.08)", borderColor: "rgba(37, 211, 102, 0.35)" },
  "Ophthalmology": { color: "#FFD700", bgColor: "rgba(255, 215, 0, 0.08)", borderColor: "rgba(255, 215, 0, 0.35)" },
};

const CHAPTER_COLORS = [
  { color: "#4A90E2", bgColor: "rgba(74, 144, 226, 0.08)" },
  { color: "#B8D4A8", bgColor: "rgba(184, 212, 168, 0.08)" },
  { color: "#E91E63", bgColor: "rgba(233, 30, 99, 0.08)" },
  { color: "#FF9800", bgColor: "rgba(255, 152, 0, 0.08)" },
  { color: "#25D366", bgColor: "rgba(37, 211, 102, 0.08)" },
  { color: "#FFD700", bgColor: "rgba(255, 215, 0, 0.08)" },
  { color: "#9C27B0", bgColor: "rgba(156, 39, 176, 0.08)" },
  { color: "#00BCD4", bgColor: "rgba(0, 188, 212, 0.08)" },
  { color: "#FF5722", bgColor: "rgba(255, 87, 34, 0.08)" },
  { color: "#607D8B", bgColor: "rgba(96, 125, 139, 0.08)" },
];

const TOPIC_COLORS = [
  { color: "#4A90E2", bgColor: "rgba(74, 144, 226, 0.08)" },
  { color: "#B8D4A8", bgColor: "rgba(184, 212, 168, 0.08)" },
  { color: "#FFD700", bgColor: "rgba(255, 215, 0, 0.08)" },
  { color: "#FF9800", bgColor: "rgba(255, 152, 0, 0.08)" },
  { color: "#25D366", bgColor: "rgba(37, 211, 102, 0.08)" },
  { color: "#E91E63", bgColor: "rgba(233, 30, 99, 0.08)" },
  { color: "#9C27B0", bgColor: "rgba(156, 39, 176, 0.08)" },
  { color: "#00BCD4", bgColor: "rgba(0, 188, 212, 0.08)" },
  { color: "#FF5722", bgColor: "rgba(255, 87, 34, 0.08)" },
  { color: "#607D8B", bgColor: "rgba(96, 125, 139, 0.08)" },
];

interface LearningPathProps {
  onSubjectSelect?: (subject: string) => void;
}

interface TopicItem {
  topic: string;
  topic_id: string;
  is_complete: boolean;
  visited_at: string | null;
}

interface ChapterItem {
  chapter: string;
  topics: TopicItem[];
}

interface GroupedProgress {
  textbook_chapter: string;
  chapters: ChapterItem[];
}

export default function CBMELearningPath({ onSubjectSelect }: LearningPathProps) {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<GroupedProgress[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubjectPress = async (subject: string) => {
    if (!user?.id) {
      setError("Please log in to view your progress");
      return;
    }

    setSelectedSubject(subject);
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_student_subject_curriculum_tree_orchestra', {
        p_student_id: user.id,
        p_subject: subject
      });

      if (rpcError) throw rpcError;

      const normalized = Array.isArray(data) ? data : [];
      setSubjectProgress(normalized);

      if (onSubjectSelect) {
        onSubjectSelect(subject);
      }
    } catch (err) {
      console.error('Error fetching subject progress:', err);
      setError('Failed to load learning path');
      setSubjectProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSubjectProgress(null);
    setError(null);
  };

  const getSubjectColor = (subject: string) => {
    return SUBJECT_COLORS[subject] || SUBJECT_COLORS["Anatomy"];
  };

  const getChapterColor = (index: number) => {
    return CHAPTER_COLORS[index % CHAPTER_COLORS.length];
  };

  const getTopicColor = (index: number) => {
    return TOPIC_COLORS[index % TOPIC_COLORS.length];
  };

  const renderSubjectProgress = () => {
    if (!selectedSubject) return null;

    const subjectColor = getSubjectColor(selectedSubject);

    let chapterGlobalIndex = 0;

    return (
      <MainLayout>
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Back Button */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleBackToSubjects}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ArrowLeft size={18} color={subjectColor.color} />
                <Text style={[styles.backButtonText, { color: subjectColor.color }]}>
                  Back to Subjects
                </Text>
              </TouchableOpacity>

              <View style={[styles.journeyBadge, { backgroundColor: subjectColor.bgColor, borderColor: subjectColor.borderColor }]}>
                <Sparkles size={14} color={subjectColor.color} />
                <Text style={[styles.journeyBadgeText, { color: subjectColor.color }]}>YOUR JOURNEY</Text>
              </View>
              <Text style={styles.headerTitle}>{selectedSubject}</Text>
              <Text style={styles.headerSubtitle}>
                Follow your personalized learning path through the curriculum
              </Text>
            </View>

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={subjectColor.color} />
                <Text style={styles.loadingText}>Loading your learning path...</Text>
              </View>
            )}

            {/* Error State */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Subject Progress Flowchart */}
            {!loading && !error && subjectProgress && (
              <View style={styles.flowchartContainer}>
                {/* Start Node */}
                <View style={styles.startNode}>
                  <View style={[styles.startNodeCircle, { backgroundColor: subjectColor.color }]}>
                    <Sparkles size={16} color="#ffffff" />
                  </View>
                  <View style={styles.startNodeContent}>
                    <Text style={[styles.startNodeText, { color: subjectColor.color }]}>
                      Start Learning {selectedSubject}
                    </Text>
                  </View>
                  <View style={[styles.connectionLine, { backgroundColor: subjectColor.borderColor }]} />
                </View>

                {/* Textbook Chapters and Topics Flow */}
                {subjectProgress.map((tbChapter, tbIndex) => (
                  <View key={tbIndex} style={styles.yearSection}>
                    {/* Textbook Chapter Block */}
                    <View style={styles.yearBlockWrapper}>
                      <View
                        style={[
                          styles.yearBlock,
                          { 
                            backgroundColor: subjectColor.bgColor, 
                            borderLeftColor: subjectColor.color,
                          },
                        ]}
                      >
                        <View style={styles.yearBlockContent}>
                          <View style={styles.yearBlockHeader}>
                            <View
                              style={[
                                styles.yearIconCircle, 
                                { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                              ]}
                            >
                              <BookOpen size={18} color={subjectColor.color} strokeWidth={2} />
                            </View>
                            <View style={styles.yearBlockTextContainer}>
                              <Text style={styles.textbookChapterTitle}>
                                {tbChapter.textbook_chapter}
                              </Text>
                              <Text style={styles.yearBlockSubjects}>
                                {tbChapter.chapters.length} Chapters
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.yearConnectionPoint, 
                            { backgroundColor: subjectColor.color }
                          ]}
                        />
                      </View>
                      <View style={[styles.horizontalConnector, { backgroundColor: subjectColor.borderColor }]} />
                    </View>

                    {/* Chapters and Topics */}
                    <View style={styles.subjectsContainer}>
                      {tbChapter.chapters.map((chapter, chapterIndex) => {
                        const chapterColor = getChapterColor(chapterGlobalIndex);
                        const isLastChapter = chapterIndex === tbChapter.chapters.length - 1;
                        const allTopicsComplete = chapter.topics.every(t => !!t.visited_at);
                        const firstIncomplete = chapter.topics.findIndex(t => !t.visited_at);
                        const isCurrent = firstIncomplete >= 0;
                        
                        const currentChapterIndex = chapterGlobalIndex;
                        chapterGlobalIndex++;

                        return (
                          <View key={chapterIndex} style={styles.chapterSection}>
                            {/* Per-Chapter Vertical Timeline Segment */}
                            <View
                              style={[
                                styles.chapterTimelineSegment,
                                { backgroundColor: chapterColor.color },
                              ]}
                            />

                            {/* Chapter Block */}
                            <View style={styles.subjectWrapper}>
                              <View
                                style={[
                                  styles.chapterBlock,
                                  {
                                    backgroundColor: allTopicsComplete || isCurrent
                                      ? chapterColor.bgColor
                                      : 'rgba(30, 30, 30, 0.4)',
                                    borderLeftColor: allTopicsComplete || isCurrent
                                      ? chapterColor.color
                                      : 'rgba(100, 100, 100, 0.4)',
                                  },
                                ]}
                              >
                                <View style={styles.chapterBlockContent}>
                                  <View
                                    style={[
                                      styles.chapterIconDot,
                                      {
                                        backgroundColor: allTopicsComplete || isCurrent
                                          ? chapterColor.color
                                          : 'rgba(100, 100, 100, 0.5)',
                                      },
                                    ]}
                                  />
                                  <Text style={styles.chapterTextFixed}>
                                    {chapter.chapter}
                                  </Text>
                                  {allTopicsComplete && (
                                    <CheckCircle2 size={16} color={chapterColor.color} strokeWidth={2} />
                                  )}
                                </View>
                                <View
                                  style={[
                                    styles.chapterConnectionPoint,
                                    {
                                      backgroundColor: allTopicsComplete || isCurrent
                                        ? chapterColor.color
                                        : 'rgba(100, 100, 100, 0.6)',
                                    },
                                  ]}
                                />
                              </View>
                              <View
                                style={[
                                  styles.horizontalConnectorChapter,
                                  { 
                                    backgroundColor: chapterColor.color,
                                    opacity: allTopicsComplete || isCurrent ? 0.5 : 0.2,
                                  },
                                ]}
                              />
                            </View>

                            {/* Topics (nested) - TAB STYLE */}
                            <View style={styles.topicsContainer}>
                              {chapter.topics.map((topic, topicIndex) => {
                                const topicColor = getTopicColor(topicIndex);
                                const isComplete = !!topic.visited_at;
                                const isCurrentTopic = !isComplete && firstIncomplete === topicIndex;
                                const isLastTopic = topicIndex === chapter.topics.length - 1;
                                const isFuture = !isComplete && !isCurrentTopic;

                                return (
                                  <View key={topicIndex} style={styles.topicWrapper}>
                                    <TouchableOpacity
                                      activeOpacity={0.8}
                                      style={[
                                        styles.topicTab,
                                        {
                                          backgroundColor: isComplete
                                            ? 'rgba(37, 211, 102, 0.08)'
                                            : 'rgba(30, 30, 30, 0.3)',
                                          borderLeftColor: isComplete
                                            ? '#25D366'
                                            : isCurrentTopic
                                            ? topicColor.color
                                            : '#9FB3C8',

                                        },
                                      ]}
                                    >
                                      <View style={styles.topicTabContent}>
                                        {isComplete && topic.visited_at && (
                                          <Text style={styles.completedDateText}>
                                            {formatDate(topic.visited_at)}
                                          </Text>
                                        )}

                                        <View style={styles.topicMainRow}>
                                          <View style={styles.topicIconContainer}>
                                            {isComplete ? (
                                              <CheckCircle2 size={14} color="#25D366" strokeWidth={2} />
                                            ) : isCurrentTopic ? (
                                              <Circle size={12} color={topicColor.color} strokeWidth={2} fill={topicColor.color} />
                                            ) : (
                                              <Circle size={12} color="#9FB3C8" strokeWidth={1.5} />
                                            )}
                                          </View>

                                          <Text
                                            style={[
                                              styles.topicTabText,
                                              {
                                                color: isComplete
                                                  ? '#25D366'
                                                  : isCurrentTopic
                                                  ? topicColor.color
                                                  : '#9FB3C8',
                                              },
                                            ]}
                                          >
                                            {topic.topic}
                                          </Text>
                                        </View>
                                      </View>
                                      <View
                                        style={[
                                          styles.topicConnectionPoint,
                                          {
                                            backgroundColor: isComplete
                                              ? '#25D366'
                                              : isCurrentTopic
                                              ? topicColor.color
                                              : '#9FB3C8',
                                          },
                                        ]}
                                      />
                                    </TouchableOpacity>
                                    {!isLastTopic && (
                                      <View
                                        style={[
                                          styles.topicConnector,
                                          {
                                            backgroundColor: isComplete
                                              ? '#25D366'
                                              : chapterColor.color,
                                            opacity: 0.3,
                                          },
                                        ]}
                                      />
                                    )}
                                    <View
                                      style={[
                                        styles.horizontalConnectorTopic,
                                        {
                                          backgroundColor: isComplete
                                            ? '#25D366'
                                            : isCurrentTopic
                                            ? topicColor.color
                                            : chapterColor.color,
                                          opacity: isComplete || isCurrentTopic ? 0.4 : 0.2,
                                        },
                                      ]}
                                    />
                                  </View>
                                );
                              })}
                            </View>

                            {!isLastChapter && (
                              <View
                                style={[
                                  styles.chapterConnector,
                                  { 
                                    backgroundColor: chapterColor.color, 
                                    opacity: 0.3,
                                  },
                                ]}
                              />
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Textbook Chapter to Chapter Connector */}
                    {tbIndex < subjectProgress.length - 1 && (
                      <View
                        style={[
                          styles.yearToYearConnector,
                          { backgroundColor: subjectColor.borderColor, opacity: 0.4 },
                        ]}
                      />
                    )}
                  </View>
                ))}

                {/* End Node */}
                <View style={styles.endNode}>
                  <View style={[styles.endNodeCircle, { backgroundColor: '#25D366' }]}>
                    <Trophy size={20} color="#ffffff" strokeWidth={2} />
                  </View>
                  <View style={styles.endNodeContent}>
                    <Text style={[styles.endNodeTitle, { color: '#25D366' }]}>Journey Complete!</Text>
                    <Text style={styles.endNodeSubtitle}>{selectedSubject} Mastered</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Empty State */}
            {!loading && !error && subjectProgress && subjectProgress.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No learning path data available yet</Text>
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </MainLayout>
    );
  };

  // Main render - show either subject overview or subject progress
  if (selectedSubject) {
    return renderSubjectProgress();
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.journeyBadge}>
              <Sparkles size={14} color="#FFD700" />
              <Text style={[styles.journeyBadgeText, { color: '#FFD700' }]}>YOUR JOURNEY</Text>
            </View>
            <Text style={styles.headerTitle}>MBBS NMC CBME Learning Path</Text>
            <Text style={styles.headerSubtitle}>
              Paragraph AI-Tutored Hyper-Personalised Adaptive Learning Path to Master CBME Curriculum
            </Text>
          </View>

          {/* Flowchart Container */}
          <View style={styles.flowchartContainer}>
            {/* Vertical Timeline Line (Right Side) */}
<View style={styles.timelineLineContainer}>
  {YEARS.map((yearData, yearIndex) => (
    <View
      key={`year-line-${yearIndex}`}
      style={[
        styles.timelineSegment,
        {
          backgroundColor: yearData.color,
          flex: 1, // one solid segment per year
        },
      ]}
    />
  ))}
</View>


            {/* Start Node */}
            <View style={styles.startNode}>
              <View style={[styles.startNodeCircle, { backgroundColor: '#25D366' }]}>
                <Sparkles size={16} color="#ffffff" />
              </View>
              <View style={styles.startNodeContent}>
                <Text style={[styles.startNodeText, { color: '#25D366' }]}>Start Your Journey</Text>
              </View>
              <View style={[styles.connectionLine, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} />
            </View>

            {/* Years and Subjects Flow */}
            {YEARS.map((yearData, yearIndex) => (
              <View key={yearIndex} style={styles.yearSection}>
                {/* Year Block */}
                <View style={styles.yearBlockWrapper}>
                  <View
                    style={[
                      styles.yearBlock,
                      { backgroundColor: yearData.bgColor, borderLeftColor: yearData.color },
                    ]}
                  >
                    <View style={styles.yearBlockContent}>
                      <View style={styles.yearBlockHeader}>
                        <View
                          style={[styles.yearIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}
                        >
                          {yearIndex === 0 && <BookOpen size={16} color={yearData.color} />}
                          {yearIndex === 1 && <Star size={16} color={yearData.color} />}
                          {yearIndex === 2 && <Award size={16} color={yearData.color} />}
                          {yearIndex === 3 && <Trophy size={16} color={yearData.color} />}
                        </View>
                        <View style={styles.yearBlockTextContainer}>
                          <Text style={[styles.yearBlockTitle, { color: yearData.color }]}>
                            {yearData.year}
                          </Text>
                          <Text style={styles.yearBlockSubjects}>
                            {yearData.subjects.length} Subjects
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={[styles.yearConnectionPoint, { backgroundColor: yearData.color }]}
                    />
                  </View>
                  <View style={[styles.horizontalConnector, { backgroundColor: yearData.borderColor }]} />
                </View>

                {/* Subject Blocks */}
                <View style={styles.subjectsContainer}>
                  {yearData.subjects.map((subject, subjectIndex) => {
                    const isLast = subjectIndex === yearData.subjects.length - 1;

                    return (
                      <View key={subjectIndex} style={styles.subjectWrapper}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleSubjectPress(subject)}
                          style={[
                            styles.subjectBlock,
                            {
                              backgroundColor: 'rgba(30, 30, 30, 0.3)',
                              borderLeftColor: 'rgba(100, 100, 100, 0.3)',
                            },
                          ]}
                        >
                          <View style={styles.subjectBlockContent}>
                            <View
                              style={[
                                styles.subjectDot,
                                { backgroundColor: 'rgba(100, 100, 100, 0.5)' },
                              ]}
                            />
                            <Text style={[styles.subjectText, { color: '#999999' }]}>
                              {subject}
                            </Text>
                            <View style={styles.selectedBadge}>
                              <ChevronRight size={14} color="#808080" />
                            </View>
                          </View>
                          <View
                            style={[
                              styles.subjectConnectionPoint,
                              { backgroundColor: 'rgba(100, 100, 100, 0.6)' },
                            ]}
                          />
                        </TouchableOpacity>
                        {!isLast && (
                          <View
                            style={[
                              styles.subjectConnector,
                              { backgroundColor: yearData.color, opacity: 0.2 },
                            ]}
                          />
                        )}
                        <View
                          style={[
                            styles.horizontalConnectorSmall,
                            { backgroundColor: yearData.color, opacity: 0.3 },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>

                {/* Year to Year Connector */}
                {yearIndex < YEARS.length - 1 && (
                  <View
                    style={[
                      styles.yearToYearConnector,
                      { backgroundColor: YEARS[yearIndex + 1].color, opacity: 0.3 },
                    ]}
                  />
                )}
              </View>
            ))}

            {/* End Node */}
            <View style={styles.endNode}>
              <View style={[styles.endNodeCircle, { backgroundColor: '#FFD700' }]}>
                <Trophy size={20} color="#ffffff" />
              </View>
              <View style={styles.endNodeContent}>
                <Text style={[styles.endNodeTitle, { color: '#FFD700' }]}>Journey Complete!</Text>
                <Text style={styles.endNodeSubtitle}>MBBS Mastery Achieved</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  // HEADER
  header: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },

  journeyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },

  journeyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 1.2,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F5E6C8', // ← Image 2 heading color
    marginBottom: 6,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: 15,
    color: '#999999',
    lineHeight: 22,
  },

  // BACK BUTTON
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  // LOADING & ERROR
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    fontSize: 15,
    color: '#999999',
    marginTop: 16,
  },

  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },

  errorText: {
    fontSize: 15,
    color: '#E91E63',
    textAlign: 'center',
  },

  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 15,
    color: '#808080',
    textAlign: 'center',
  },

  // FLOWCHART
  flowchartContainer: {
    paddingLeft: 20,
    paddingRight: 80,
    position: 'relative',
  },

  // TIMELINE LINE (RIGHT SIDE)
  timelineLineContainer: {
    position: 'absolute',
    right: 32,
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 0,
  },

  timelineLine: {
    flex: 1,
    borderRadius: 1,
  },

  // START NODE
  startNode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    position: 'relative',
  },

  startNodeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  startNodeContent: {
    marginLeft: 14,
    flex: 1,
  },

  startNodeText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  connectionLine: {
    position: 'absolute',
    right: -48,
    width: 32,
    height: 1,
  },

  // YEAR SECTION
  yearSection: {
    marginBottom: 20,
  },

  yearBlockWrapper: {
    position: 'relative',
    marginBottom: 14,
  },

  yearBlock: {
    borderRadius: 12,
    borderLeftWidth: 3,
    overflow: 'hidden',
    position: 'relative',
  },

  yearBlockContent: {
    padding: 14,
  },

  yearBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  yearIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  yearBlockTextContainer: {
    marginLeft: 12,
    flex: 1,
  },

  yearBlockTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.3,
  },

  textbookChapterTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.3,
    color: '#e1e1e1',
  },

  yearBlockSubjects: {
    fontSize: 13,
    color: '#808080',
    fontWeight: '600',
  },

  yearConnectionPoint: {
    position: 'absolute',
    right: -8,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0d0d0d',
    zIndex: 2,
  },

  horizontalConnector: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -0.5,
    width: 40,
    height: 1,
    zIndex: 1,
  },

  // SUBJECTS
  subjectsContainer: {
    paddingLeft: 28,
  },

  subjectWrapper: {
    position: 'relative',
  },

  subjectBlock: {
    borderRadius: 10,
    borderLeftWidth: 2,
    marginBottom: 2,
    position: 'relative',
    overflow: 'hidden',
  },

  subjectBlockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  subjectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },

  subjectText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  selectedBadge: {
    marginLeft: 6,
  },

  subjectConnectionPoint: {
    position: 'absolute',
    right: -6,
    top: '50%',
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    zIndex: 2,
  },

  subjectConnector: {
    position: 'absolute',
    right: -6,
    top: '50%',
    width: 1,
    height: '100%',
    zIndex: 0,
  },

  horizontalConnectorSmall: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -0.5,
    width: 42,
    height: 1,
    zIndex: 1,
  },

  yearToYearConnector: {
    width: 1,
    height: 20,
    marginLeft: 19,
    marginVertical: 6,
  },

  // CHAPTER SECTION
  chapterSection: {
    marginBottom: 10,
    position: 'relative',
  },

  chapterTimelineSegment: {
    position: 'absolute',
    right: -48,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
    opacity: 0.9,
  },

  chapterBlock: {
    borderRadius: 10,
    borderLeftWidth: 2,
    marginBottom: 3,
    position: 'relative',
    overflow: 'hidden',
  },

  chapterBlockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  chapterIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },

  chapterText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  chapterTextFixed: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#e1e1e1',
  },

  chapterConnectionPoint: {
    position: 'absolute',
    right: -7,
    top: '50%',
    marginTop: -3.5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    zIndex: 2,
  },

  horizontalConnectorChapter: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -0.5,
    width: 41,
    height: 1,
    zIndex: 1,
  },

  chapterConnector: {
    width: 1,
    height: 16,
    marginLeft: 4,
    marginVertical: 4,
  },

  // TOPICS (TAB STYLE)
  topicsContainer: {
    paddingLeft: 20,
    marginTop: 6,
    marginBottom: 6,
  },

  topicWrapper: {
    position: 'relative',
    marginBottom: 4,
  },

  topicTab: {
    borderRadius: 8,
    borderLeftWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },

  topicTabContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  topicIconContainer: {
    marginRight: 10,
  },

  topicTabText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 20,
  },

  topicMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  completedDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#25D366',
    marginBottom: 4,
    letterSpacing: 0.4,
  },

  currentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 6,
  },

  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.8,
  },

  topicConnectionPoint: {
    position: 'absolute',
    right: -5,
    top: '50%',
    marginTop: -2.5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    zIndex: 2,
  },

  topicConnector: {
    position: 'absolute',
    right: -5,
    top: '50%',
    width: 1,
    height: '100%',
    zIndex: 0,
  },

  horizontalConnectorTopic: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -0.5,
    width: 43,
    height: 1,
    zIndex: 1,
  },

  // END NODE
  endNode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    paddingRight: 48,
  },

  endNodeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  endNodeContent: {
    marginLeft: 14,
    flex: 1,
  },

  endNodeTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.3,
  },

  endNodeSubtitle: {
    fontSize: 13,
    color: '#808080',
    fontWeight: '600',
  },

  bottomSpacer: {
    height: 40,
  },

  timelineSegment: {
  flex: 1,          // keeps one solid segment per YEAR
  width: 4,         // ⬅️ thicker, clearly visible
  borderRadius: 2,
  opacity: 0.9,
},
});
