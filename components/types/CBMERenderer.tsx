import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CBMERenderer({
  cbmeMeta,
}: {
  cbmeMeta?: {
    chapter?: string | null;
    topic?: string | null;
    chapter_order?: number | null;
    topic_order?: number | null;
  };
}) {
  if (!cbmeMeta?.chapter && !cbmeMeta?.topic) return null;

  return (
    <View style={styles.container}>
      {cbmeMeta.chapter && (
        <Text style={styles.line}>
          <Text style={styles.label}>CBME Topic:</Text>{" "}
          {cbmeMeta.chapter_order != null
            ? `${cbmeMeta.chapter_order}. `
            : ""}
          {cbmeMeta.chapter}
        </Text>
      )}

      {cbmeMeta.topic && (
        <Text style={styles.line}>
          <Text style={styles.label}>Competency:</Text>{" "}
          {cbmeMeta.topic_order != null
            ? `${cbmeMeta.topic_order + 1}. `
            : ""}
          {cbmeMeta.topic}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#0d2017",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  line: {
    color: "#e1e1e1",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  label: {
    color: "#10b981",
    fontWeight: "700",
  },
});
