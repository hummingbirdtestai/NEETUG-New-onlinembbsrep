//usePracticeData.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
// 🔴 ADD THIS EXACT LINE
console.log("🚨 usePracticeData.ts FILE LOADED 🚨");
export function usePracticeData(
  textbookChapter: string,
  userId: string | null,
   category: "all" | "bookmarked" | "wrong" = "all"
) {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // ⭐ NEW — STOP LOAD MORE WHEN DATA FINISHES
  const [hasMoreData, setHasMoreData] = useState(true);

  const LIMIT = 20;

  const fetchPhases = async (currentOffset = 0) => {
    if (!userId) {
      setPhases([]);
      setLoading(false);
      return;
    }

    let rpcName: string;
    let rpcArgs: any;

// ✅ ALWAYS USE v14 — ONLY FILTER CHANGES
rpcName = "get_concept_practice_feed_v14";

rpcArgs = {
  p_student_id: userId,
  p_textbook_chapter: textbookChapter,

  // ⭐ THIS IS THE ONLY SWITCH
  p_filter:
    category === "all"
      ? "all"
      : category === "bookmarked"
      ? "bookmarked"
      : "wrong",

  p_limit: LIMIT,
  p_offset: currentOffset,
};

console.log("🚀 RPC CALL", {
  category,
  rpcName,
  textbookChapter,
  offset: currentOffset,
});


    const { data, error } = await supabase.rpc(rpcName, rpcArgs);

    if (error) {
      console.log("RPC Error", error);
      setIsLoadingMore(false);
      setLoading(false);
      return;
    }

    // ⭐ If NO new records → no more pagination
    if (!data || data.length === 0) {
      setHasMoreData(false);
      setIsLoadingMore(false);
      return;
    }

    if (currentOffset === 0) {
      setPhases(data);
    } else {
      setPhases((prev) => [...prev, ...data]);
    }

    setIsLoadingMore(false);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
      console.log("📡 usePracticeData TRIGGERED", {
    textbookChapter,
    userId,
    category,
  });
    setPhases([]); 
    setOffset(0);
    setHasMoreData(true);
    setIsLoadingMore(false);   // 👈 ADD THIS
    setLoading(true);
    fetchPhases(0);
  }, [textbookChapter, userId, category]);


  const refresh = async () => {
    setRefreshing(true);
    setOffset(0);
    setHasMoreData(true);  
    await fetchPhases(0);
  };

  const loadMore = async () => {
    if (!hasMoreData) return;         // ⭐ STOP LOADING
    if (isLoadingMore || loading) return;

    setIsLoadingMore(true);

    const newOffset = offset + LIMIT;
    setOffset(newOffset);

    await fetchPhases(newOffset);
  };

  return {
    phases,
    loading,
    refreshing,
    refresh,
    loadMore,
    isLoadingMore,
    hasMoreData,       // Optional, if UI needs to show “No more items”
  };
}
