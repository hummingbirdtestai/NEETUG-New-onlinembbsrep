//HighYieldFactSheetScreen.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';


export default function HighYieldFactSheetScreen({
  data,
  cbmeMeta,
}: {
  data: string;
  cbmeMeta?: {
    chapter?: string | null;
    topic?: string | null;
    chapter_order?: number | null;
    topic_order?: number | null;
  };
}) {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
     <MentorFactSheetBubble message={data} cbmeMeta={cbmeMeta} />
      </ScrollView>
    </View>
  );
}

function MentorFactSheetBubble({
  message,
  cbmeMeta,
}: {
  message: string;
  cbmeMeta?: {
    chapter?: string | null;
    topic?: string | null;
    chapter_order?: number | null;
    topic_order?: number | null;
  };
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const sections = parseContentIntoSections(message?.trim() ?? "");
  return (
  <Animated.View style={[styles.mentorBubble, { opacity: fadeAnim }]}>
    {sections.map((section, index) => (
      <SectionBlock
        key={index}
        section={section}
        isLast={index === sections.length - 1}
        screenWidth={screenWidth}
      />
    ))}
  </Animated.View>
);
}

    
type SectionType =
  | 'major_header'
  | 'clinical_case'
  | 'viva_question'
  | 'mnemonic'
  | 'high_yield_fact'
  | 'table'
  | 'bullet_list'
  | 'numbered_list'
  | 'paragraph';

interface Section {
  type: SectionType;
  content: string[];
  title?: string;
  rawLines?: string[];
}

function normalizeMarkdown(content: string): string {
  return content
    .split('\n')
    .map(line => {
      const trimmed = line.trim();

      // Convert markdown dividers to empty lines
      if (/^-{3,}$/.test(trimmed)) {
        return '';
      }

      // Convert markdown headers to existing format
      // ### 1) **_text_** → 1) ***text***
      if (trimmed.startsWith('###')) {
        let normalized = trimmed.replace(/^###\s*/, '');
        // If it starts with a number followed by ), keep as numbered header
        if (/^\d+\)\s+/.test(normalized)) {
          return normalized;
        }
        // Otherwise convert to major header format
        return `***${normalized}***`;
      }

      if (trimmed.startsWith('##')) {
        const normalized = trimmed.replace(/^##\s*/, '');
        return `***${normalized}***`;
      }

      if (trimmed.startsWith('#')) {
        const normalized = trimmed.replace(/^#\s*/, '');
        return `***${normalized}***`;
      }

      return line;
    })
    .join('\n')
    // Normalize mixed emphasis formats
    .replace(/\*\*_([^_*]+)_\*\*/g, '***$1***')  // **_text_** → ***text***
    .replace(/_\*\*([^_*]+)\*\*_/g, '***$1***'); // _**text**_ → ***text***
}

function normalizeBulletIndentation(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];

  let lastLineWasBulletHeading = false;

  for (const line of lines) {
    const trimmed = line.trim();

    const isBullet = /^[•\-–—]\s+/.test(trimmed);

    // Bullet heading (short, no colon, no sentence continuation)
    if (isBullet && trimmed.split(' ').length <= 3 && !trimmed.endsWith('.')) {
      result.push(line);
      lastLineWasBulletHeading = true;
      continue;
    }

    // Bullet immediately after a heading → indent it
    if (isBullet && lastLineWasBulletHeading && !line.startsWith('  ')) {
      result.push('  ' + line);
      lastLineWasBulletHeading = false;
      continue;
    }

    // Reset state
    lastLineWasBulletHeading = false;
    result.push(line);
  }

  return result.join('\n');
}

function parseContentIntoSections(content: string): Section[] {
  const normalizedContent = normalizeBulletIndentation(normalizeMarkdown(content));
  const lines = normalizedContent.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  const flushCurrentSection = () => {
    if (currentSection && (currentSection.content.length > 0 || (currentSection.rawLines?.length ?? 0) > 0)) {
      sections.push(currentSection);
      currentSection = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushCurrentSection();
      continue;
    }

    if (trimmed.startsWith('***') && trimmed.includes('***', 3)) {
      flushCurrentSection();
      const startIndex = trimmed.indexOf('***');
      const endIndex = trimmed.indexOf('***', startIndex + 3);
      const title = trimmed.slice(startIndex + 3, endIndex).trim();
      const lowerTitle = title.toLowerCase();

      let sectionType: SectionType = 'major_header';
      if (lowerTitle.includes('clinical case') || lowerTitle.includes('vignette')) {
        sectionType = 'clinical_case';
      } else if (lowerTitle.includes('viva')) {
        sectionType = 'viva_question';
      } else if (lowerTitle.includes('high-yield')) {
        sectionType = 'high_yield_fact';
      } else if (lowerTitle.includes('mnemonic') || lowerTitle.includes('summary table')) {
        sectionType = 'mnemonic';
      }

      currentSection = {
        type: sectionType,
        title,
        content: [],
        rawLines: [],
      };
      continue;
    }

    const numberedHeaderMatch = trimmed.match(/^\d+\)\s+(.+)/);
    if (numberedHeaderMatch) {
      const title = numberedHeaderMatch[1].trim();
      const lowerTitle = title.toLowerCase();

      if (lowerTitle.includes('clinical case') || lowerTitle.includes('vignette')) {
        flushCurrentSection();
        currentSection = {
          type: 'clinical_case',
          title: trimmed,
          content: [],
          rawLines: [],
        };
        continue;
      } else if (lowerTitle.includes('viva')) {
        flushCurrentSection();
        currentSection = {
          type: 'viva_question',
          title: trimmed,
          content: [],
          rawLines: [],
        };
        continue;
      } else if (lowerTitle.includes('high-yield')) {
        flushCurrentSection();
        currentSection = {
          type: 'high_yield_fact',
          title: trimmed,
          content: [],
          rawLines: [],
        };
        continue;
      } else if (lowerTitle.includes('mnemonic') || lowerTitle.includes('table')) {
        flushCurrentSection();
        currentSection = {
          type: 'mnemonic',
          title: trimmed,
          content: [],
          rawLines: [],
        };
        continue;
      } else {
        flushCurrentSection();
        currentSection = {
          type: 'major_header',
          title: trimmed,
          content: [],
          rawLines: [],
        };
        continue;
      }
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (currentSection?.type !== 'table') {
        flushCurrentSection();
        currentSection = {
          type: 'table',
          content: [],
          rawLines: [],
        };
      }
      currentSection.rawLines!.push(line);
      continue;
    }

    const isBullet = /^[•\-–—]\s/.test(trimmed);
    const isNumbered = /^\d+\.\s/.test(trimmed);
    const isSubIndented = line.startsWith('  ') && !trimmed.startsWith('|');

    // NEW RULE: Sub-indented bullets stay within parent section
    if (currentSection && isSubIndented && (isBullet || isNumbered)) {
      currentSection.content.push(line);
      continue;
    }

    // NEW RULE: Keep all content within bordered sections (major_header, clinical_case, etc.)
    const borderedSectionTypes = ['major_header', 'clinical_case', 'viva_question', 'mnemonic', 'high_yield_fact'];
    if (currentSection && borderedSectionTypes.includes(currentSection.type)) {
      currentSection.content.push(line);
      continue;
    }

    if (currentSection) {
      if (currentSection.type === 'table' && !trimmed.startsWith('|')) {
        flushCurrentSection();
      } else {
        currentSection.content.push(line);
        continue;
      }
    }

    if (isBullet || isNumbered) {
      flushCurrentSection();
      currentSection = {
        type: isBullet ? 'bullet_list' : 'numbered_list',
        content: [line],
      };
    } else {
      if (!currentSection || currentSection.type === 'major_header') {
        currentSection = {
          type: 'paragraph',
          content: [line],
        };
      } else {
        currentSection.content.push(line);
      }
    }
  }

  flushCurrentSection();
  return sections;
}

function SectionBlock({
  section,
  isLast,
  screenWidth,
}: {
  section: Section;
  isLast: boolean;
  screenWidth: number;
}) {
  const getBorderColor = (): string => {
    switch (section.type) {
      case 'major_header':
        return '#B8D4A8';
      case 'high_yield_fact':
        return '#FFD700';
      case 'clinical_case':
        return '#4A90E2';
      case 'mnemonic':
        return '#FF9800';
      case 'viva_question':
        return '#E91E63';
      default:
        return 'transparent';
    }
  };

  const shouldShowBorder = ['major_header', 'clinical_case', 'viva_question', 'mnemonic', 'high_yield_fact'].includes(section.type);

  if (section.type === 'table') {
    return (
      <View style={[styles.sectionBlock, !isLast && styles.sectionBlockMargin]}>
        {renderTable(section.rawLines || [], screenWidth)}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.sectionBlock,
        !isLast && styles.sectionBlockMargin,
        shouldShowBorder && {
          borderLeftWidth: 3,
          borderLeftColor: getBorderColor(),
          paddingLeft: 12,
        },
      ]}
    >
      {section.title && (
        <Text style={[styles.sectionTitle, { color: getBorderColor() }]}>
          {stripMarkdown(section.title)}
        </Text>
      )}
      {section.content.map((line, idx) => renderLine(line, idx, section.type))}
    </View>
  );
}

function renderLine(line: string, key: number, sectionType: SectionType) {
  const trimmed = line.trim();

  if (!trimmed) {
    return <View key={key} style={{ height: 8 }} />;
  }

  const isBullet = /^[•\-–—]\s/.test(trimmed);
  const isNumbered = /^\d+\.\s/.test(trimmed);
  const isIndented = line.startsWith('  ');
  const isQuestion = trimmed.startsWith('Q') && /^Q\d+:/.test(trimmed);
  const isAnswer = trimmed.startsWith('A') && /^A\d+:/.test(trimmed);

  let lineStyle = styles.contentText;

  if (isBullet && isIndented) {
    lineStyle = [styles.bulletText, styles.indentedText];
  } else if (isBullet || isNumbered) {
    lineStyle = styles.bulletText;
  } else if (isIndented) {
    lineStyle = styles.indentedText;
  } else if (isQuestion) {
    lineStyle = styles.questionText;
  } else if (isAnswer) {
    lineStyle = styles.answerText;
  }

  return (
    <Text key={key} style={lineStyle}>
      {parseInlineMarkup(trimmed)}
      {'\n'}
    </Text>
  );
}

function renderTable(tableLines: string[], screenWidth: number) {
  const TABLET_BREAKPOINT = 768;
  const isLargeScreen = screenWidth >= TABLET_BREAKPOINT;

  if (!isLargeScreen) {
    return (
      <View style={styles.tablePlaceholder}>
        <Text style={styles.tablePlaceholderText}>📘 Table available on larger screens</Text>
        <Text style={styles.tablePlaceholderSubtext}>
          Rotate to landscape or view on tablet/desktop for formatted tables
        </Text>
      </View>
    );
  }

  const cleanLines = tableLines.filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.match(/^\|(\s*-+:?\s*\|)+$/);
  });

  if (cleanLines.length === 0) return null;

  const parseRow = (line: string): string[] => {
    return line
      .split('|')
      .slice(1, -1)
      .map(cell => cell.trim());
  };

  const headerRow = parseRow(cleanLines[0]);
  const dataRows = cleanLines
    .slice(1)
    .filter(line => !/^\|(\s*-+:?\s*\|)+$/.test(line.trim()))
    .map(parseRow);

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableRow}>
        {headerRow.map((header, idx) => (
          <View key={idx} style={[styles.tableCell, styles.tableHeaderCell]}>
            <Text style={styles.tableHeaderText}>{parseInlineMarkup(header)}</Text>
          </View>
        ))}
      </View>
      {dataRows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.tableRow}>
          {row.map((cell, cellIdx) => (
            <View key={cellIdx} style={styles.tableCell}>
              <Text style={styles.tableCellText}>{parseInlineMarkup(cell)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*_([^_]+)_\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1');
}

function parseInlineMarkup(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*_[^_]+_\*|\*[^*]+\*|_[^_]+_)/g;
  const segments = text.split(regex);

  segments.forEach((segment) => {
    if (segment.startsWith('***') && segment.endsWith('***')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(3, -3)}
        </Text>
      );
    } else if (segment.startsWith('**') && segment.endsWith('**')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(2, -2)}
        </Text>
      );
    } else if (segment.startsWith('*_') && segment.endsWith('_*')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(2, -2)}
        </Text>
      );
    } else if (segment.startsWith('*') && segment.endsWith('*')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(1, -1)}
        </Text>
      );
    } else if (segment.startsWith('_') && segment.endsWith('_')) {
      parts.push(
        <Text key={key++}>
          {segment.slice(1, -1)}
        </Text>
      );
    } else {
      parts.push(<Text key={key++}>{segment}</Text>);
    }
  });

  return <>{parts}</>;
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
    padding: 16,
    paddingBottom: 32,
  },
  mentorBubble: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  sectionBlock: {
    marginBottom: 0,
  },
  sectionBlockMargin: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#e1e1e1',
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#e1e1e1',
    marginTop: 4,
  },
  indentedText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#d4d4d4',
    marginLeft: 16,
    marginTop: 2,
  },
  questionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#FF6B9D',
    fontWeight: '600',
    marginTop: 6,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4A9EFF',
    marginTop: 2,
  },
  bold: {
    fontWeight: '700',
    color: '#25D366',
  },
  italic: {
    fontStyle: 'italic',
    color: '#d4d4d4',
  },
  boldItalic: {
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#25D366',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  tableHeaderCell: {
    backgroundColor: '#2a2a2a',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#25D366',
    textAlign: 'center',
  },
  tableCellText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#e1e1e1',
    textAlign: 'center',
  },
  tablePlaceholder: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD93D',
    borderStyle: 'dashed',
  },
  tablePlaceholderText: {
    fontSize: 16,
    color: '#FFD93D',
    fontWeight: '600',
    marginBottom: 6,
  },
  tablePlaceholderSubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});
