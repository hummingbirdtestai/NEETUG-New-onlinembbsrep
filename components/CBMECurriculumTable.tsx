import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CBME_TABLE_DATA = [
  { subject: "Anatomy", topics: 461, hours: 231, year: "Pre-Clinical" },
  { subject: "Biochemistry", topics: 98, hours: 49, year: "Pre-Clinical" },
  { subject: "Physiology", topics: 168, hours: 84, year: "Pre-Clinical" },

  { subject: "Pathology", topics: 249, hours: 125, year: "Second-Year" },
  { subject: "Pharmacology", topics: 64, hours: 32, year: "Second-Year" },
  { subject: "Microbiology", topics: 91, hours: 46, year: "Second-Year" },

  { subject: "Forensic Medicine", topics: 160, hours: 80, year: "Third-Year" },
  { subject: "PSM (Community Medicine)", topics: 139, hours: 70, year: "Third-Year" },

  { subject: "Anaesthesiology", topics: 54, hours: 14, year: "Final-Year" },
  { subject: "Dermatology", topics: 75, hours: 19, year: "Final-Year" },
  { subject: "ENT", topics: 81, hours: 20, year: "Final-Year" },
  { subject: "General Medicine", topics: 699, hours: 175, year: "Final-Year" },
  { subject: "General Surgery", topics: 189, hours: 47, year: "Final-Year" },
  { subject: "Gynecology", topics: 579, hours: 145, year: "Final-Year" },
  { subject: "Obstetrics", topics: 722, hours: 181, year: "Final-Year" },
  { subject: "Ophthalmology", topics: 60, hours: 15, year: "Final-Year" },
  { subject: "Orthopaedics", topics: 86, hours: 22, year: "Final-Year" },
  { subject: "Pediatrics", topics: 453, hours: 113, year: "Final-Year" },
  { subject: "Psychiatry", topics: 117, hours: 29, year: "Final-Year" },
  { subject: "Radiodiagnosis", topics: 15, hours: 4, year: "Final-Year" },
  { subject: "Radiotherapy", topics: 17, hours: 4, year: "Final-Year" },
];


export function CBMECurriculumTableMobile() {
 const firstYear = CBME_TABLE_DATA.filter(item => item.year === "Pre-Clinical");
const secondYear = CBME_TABLE_DATA.filter(item => item.year === "Second-Year");
const thirdYear = CBME_TABLE_DATA.filter(item => item.year === "Third-Year");
const finalYear = CBME_TABLE_DATA.filter(item => item.year === "Final-Year");


  const totalTopics = CBME_TABLE_DATA.reduce((sum, item) => sum + item.topics, 0);
  const totalHours = CBME_TABLE_DATA.reduce((sum, item) => sum + item.hours, 0);

  const renderYearSection = (title: string, data: typeof CBME_TABLE_DATA) => (
    <View style={styles.yearSection}>
      <Text style={styles.yearTitle}>{title}</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.subjectColumn}>
            <Text style={styles.subjectText}>{item.subject}</Text>
          </View>
          <View style={styles.dataColumn}>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>CBME Topics</Text>
              <Text style={styles.dataValue}>{item.topics}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Hours</Text>
              <Text style={styles.dataValue}>{item.hours}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Complete CBME Curriculum Coverage</Text>
        <Text style={styles.subheading}>
          All 19 MBBS subjects mapped to study hours and CBME competencies
        </Text>
      </View>

      <View style={styles.tableContainer}>
{renderYearSection("MBBS First Year", firstYear)}
{renderYearSection("MBBS Second Year", secondYear)}
{renderYearSection("MBBS Third Year", thirdYear)}
{renderYearSection("MBBS Final Year", finalYear)}

        <View style={styles.totalSection}>
          <View style={styles.row}>
            <View style={styles.subjectColumn}>
              <Text style={styles.totalLabel}>Total Coverage</Text>
            </View>
            <View style={styles.dataColumn}>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>CBME Topics</Text>
                <Text style={styles.totalValue}>{totalTopics}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Hours</Text>
                <Text style={styles.totalValue}>{totalHours}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export function CBMECurriculumTableWeb() {
const firstYear = CBME_TABLE_DATA.filter(item => item.year === "Pre-Clinical");
const secondYear = CBME_TABLE_DATA.filter(item => item.year === "Second-Year");
const thirdYear = CBME_TABLE_DATA.filter(item => item.year === "Third-Year");
const finalYear = CBME_TABLE_DATA.filter(item => item.year === "Final-Year");


  const totalTopics = CBME_TABLE_DATA.reduce((sum, item) => sum + item.topics, 0);
  const totalHours = CBME_TABLE_DATA.reduce((sum, item) => sum + item.hours, 0);

  const renderYearSection = (title: string, data: typeof CBME_TABLE_DATA) => (
    <View style={webStyles.yearSection}>
      <Text style={webStyles.yearTitle}>{title}</Text>
      <View style={webStyles.gridContainer}>
        {data.map((item, index) => (
          <View key={index} style={webStyles.gridCard}>
            <Text style={webStyles.subjectText}>{item.subject}</Text>
            <View style={webStyles.statsRow}>
              <View style={webStyles.stat}>
                <Text style={webStyles.statValue}>{item.topics}</Text>
                <Text style={webStyles.statLabel}>CBME Topics</Text>
              </View>
              <View style={webStyles.divider} />
              <View style={webStyles.stat}>
                <Text style={webStyles.statValue}>{item.hours}</Text>
                <Text style={webStyles.statLabel}>Hours</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={webStyles.container}>
      <View style={webStyles.header}>
        <Text style={webStyles.heading}>Complete CBME Curriculum Coverage</Text>
        <Text style={webStyles.subheading}>
          All 19 MBBS subjects mapped to study hours and CBME competencies
        </Text>
      </View>

      <View style={webStyles.tableContainer}>
{renderYearSection("MBBS First Year", firstYear)}
{renderYearSection("MBBS Second Year", secondYear)}
{renderYearSection("MBBS Third Year", thirdYear)}
{renderYearSection("MBBS Final Year", finalYear)}


        <View style={webStyles.totalSection}>
          <Text style={webStyles.totalHeading}>Total Coverage Across All Years</Text>
          <View style={webStyles.totalStatsRow}>
            <View style={webStyles.totalStat}>
              <Text style={webStyles.totalValue}>{totalTopics}</Text>
              <Text style={webStyles.totalLabel}>CBME Topics</Text>
            </View>
            <View style={webStyles.totalDivider} />
            <View style={webStyles.totalStat}>
              <Text style={webStyles.totalValue}>{totalHours}</Text>
              <Text style={webStyles.totalLabel}>Study Hours</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    marginHorizontal: 16,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#161b22',
    borderRadius: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f4e4c1',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  subheading: {
    fontSize: 14,
    color: '#8b949e',
    textAlign: 'center',
    lineHeight: 20,
  },
  tableContainer: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    overflow: 'hidden',
  },
  yearSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
 yearTitle: {
  fontSize: 15,
  fontWeight: '700',
  color: '#58a6ff',
  marginBottom: 12,
  letterSpacing: 0.5,
  textAlign: 'center',
},
  row: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#0d1117',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#30363d',
  },
  subjectColumn: {
    marginBottom: 8,
  },
  subjectText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#c9d1d9',
  lineHeight: 20,
  textAlign: 'center',
},
  dataColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 11,
    color: '#8b949e',
    marginBottom: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#58a6ff',
  },
  totalSection: {
    backgroundColor: '#1c2128',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f4e4c1',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3fb950',
  },
});

const webStyles = StyleSheet.create({
  container: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 64,
    paddingHorizontal: 48,
    borderRadius: 20,
    marginVertical: 24,
    backgroundColor: '#161b22',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f4e4c1',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 36,
  },
  subheading: {
    fontSize: 17,
    color: '#8b949e',
    textAlign: 'center',
    lineHeight: 24,
  },
  tableContainer: {
    backgroundColor: '#0d1117',
    borderRadius: 16,
    padding: 24,
  },
  yearSection: {
    marginBottom: 40,
  },
yearTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#58a6ff',
  marginBottom: 20,
  letterSpacing: 0.5,
  textAlign: 'center',
},
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridCard: {
    width: '31%',
    minWidth: 200,
    backgroundColor: '#161b22',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#30363d',
  },
 subjectText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#c9d1d9',
  marginBottom: 12,
  lineHeight: 20,
  textAlign: 'center',
},
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#58a6ff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8b949e',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#21262d',
    marginHorizontal: 8,
  },
  totalSection: {
    backgroundColor: '#1c2128',
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  totalHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f4e4c1',
    marginBottom: 20,
    textAlign: 'center',
  },
  totalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalStat: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#3fb950',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8b949e',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalDivider: {
    width: 2,
    height: 60,
    backgroundColor: '#30363d',
    marginHorizontal: 20,
  },
});