import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabaseClient';


interface SubjectProgressDashboardProps {
  student_id: string;
  subject: string;
}

interface ProgressData {
  subject: string;
  total_topics: number;
  total_hours: number;
  completed_topics: number;
  completed_mcqs: number;
  time_spent_hours: number;
  remaining_hours: number;
  completion_percent: number;
}

type TabType = 'Overview' | 'Topics' | 'MCQs' | 'Time';

export default function SubjectProgressDashboard({ student_id, subject }: SubjectProgressDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  useEffect(() => {
    fetchProgress();
  }, [student_id, subject]);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: rpcError } = await supabase.rpc('get_subject_progress_v3', {
        p_student_id: student_id,
        p_subject: subject
      });

      if (rpcError) throw rpcError;
      
      if (!result || result.length === 0) {
        setData(null);
        setError('No progress data available');
      } else {
        setData(result[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch progress data');
    } finally {
      setLoading(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color="#10b981" />
          <Text style={styles.mutedText}>Loading progress...</Text>
        </View>
      </View>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <View style={styles.card}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // EMPTY STATE
  if (!data) {
    return (
      <View style={styles.card}>
        <View style={styles.centerContent}>
          <Text style={styles.mutedText}>No progress data available</Text>
        </View>
      </View>
    );
  }

  const remainingTopics = data.total_topics - data.completed_topics;

  // TAB CONTENT RENDERER
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <View style={styles.tabContent}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Topics</Text>
              <Text style={styles.metricValue}>{data.total_topics}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Hours</Text>
              <Text style={styles.metricValue}>{data.total_hours}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Completion</Text>
              <Text style={styles.metricValue}>{data.completion_percent.toFixed(1)}%</Text>
            </View>
          </View>
        );

      case 'Topics':
        return (
          <View style={styles.tabContent}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Completed Topics</Text>
              <Text style={styles.metricValue}>{data.completed_topics}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Remaining Topics</Text>
              <Text style={styles.metricValue}>{remainingTopics}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Topics</Text>
              <Text style={styles.metricValue}>{data.total_topics}</Text>
            </View>
          </View>
        );

      case 'MCQs':
        return (
          <View style={styles.tabContent}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Completed MCQs</Text>
              <Text style={styles.metricValue}>{data.completed_mcqs}</Text>
            </View>
          </View>
        );

      case 'Time':
        return (
          <View style={styles.tabContent}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Time Spent (hours)</Text>
              <Text style={styles.metricValue}>{data.time_spent_hours.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Remaining Time (hours)</Text>
              <Text style={styles.metricValue}>{data.remaining_hours.toFixed(2)}</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.card}>
      {/* SECTION 1: SUBJECT HEADER */}
      <View style={styles.header}>
        <Text style={styles.subjectTitle}>{data.subject}</Text>
      </View>
      <View style={styles.divider} />

      {/* SECTION 2: PROGRESS SUMMARY */}
      <View style={styles.progressSection}>
        <Text style={styles.percentageText}>{data.completion_percent.toFixed(1)}%</Text>
        <Text style={styles.progressLabel}>Progress Completed</Text>
        
        {/* Horizontal Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${Math.min(data.completion_percent, 100)}%` }
            ]} 
          />
        </View>
      </View>

      {/* SECTION 3: TIME METRICS (TWO MINI CARDS) */}
      <View style={styles.timeMetrics}>
        <View style={styles.miniCard}>
          <Text style={styles.miniCardLabel}>Time Spent</Text>
          <Text style={styles.miniCardValue}>{data.time_spent_hours.toFixed(1)}h</Text>
        </View>
        <View style={styles.miniCard}>
          <Text style={styles.miniCardLabel}>Remaining Time</Text>
          <Text style={styles.miniCardValue}>{data.remaining_hours.toFixed(1)}h</Text>
        </View>
      </View>

      {/* SECTION 4: TAB STRIP */}
      <View style={styles.tabStrip}>
        {(['Overview', 'Topics', 'MCQs', 'Time'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.tab}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive
            ]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* SECTION 5: TAB CONTENT */}
      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  // CARD WRAPPER (NOT FULLSCREEN)
  card: {
    backgroundColor: '#0d1821',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1c2730',
    padding: 16,
    marginVertical: 8,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },

  // HEADER SECTION
  header: {
    marginBottom: 8,
  },

  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
  },

  divider: {
    height: 1,
    backgroundColor: '#1c2730',
    marginBottom: 16,
  },

  // PROGRESS SECTION
  progressSection: {
    marginBottom: 16,
  },

  percentageText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },

  progressLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: '#1c2730',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },

  // TIME METRICS (MINI CARDS)
  timeMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  miniCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1c2730',
    padding: 12,
  },

  miniCardLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },

  miniCardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e5e7eb',
  },

  // TAB STRIP
  tabStrip: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1c2730',
    marginBottom: 16,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },

  tabText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#e5e7eb',
  },

  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10b981',
  },

  // TAB CONTENT
  tabContent: {
    gap: 12,
  },

  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  metricLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },

  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
  },

  // STATES
  mutedText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
});