import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface ChapterFilterBubbleProps {
  chapter: string;
  selected: boolean;
  onPress: () => void;
}

export function ChapterFilterBubble({ chapter, selected, onPress }: ChapterFilterBubbleProps) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {chapter}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#1a2329',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.4)',
  },
  chipSelected: {
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    borderColor: '#25D366',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(37, 211, 102, 0.9)',
  },
  chipTextSelected: {
    color: '#25D366',
    fontWeight: '500',
  },
});
