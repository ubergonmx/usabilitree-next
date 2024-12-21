"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { TreeTestComponent } from "@/components/tree-test";
import { loadTestConfig } from "@/lib/treetest/actions";
import { TreeTestConfig } from "@/lib/types/tree-test";
import { LoadingSkeleton } from "@/components/tree-test-loading-skeleton";

export default function TreeTestPage({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState<TreeTestConfig>();
  const [initialTaskIndex, setInitialTaskIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  // Use a ref to prevent duplicate fetches in development strict mode
  const configFetchedRef = useRef(false);

  // Store task index in localStorage - defined with useCallback to memoize
  const storeTaskIndex = useCallback(
    (taskIndex: number) => {
      try {
        const key = `treeTest_${params.id}_currentTask`;
        localStorage.setItem(key, taskIndex.toString());
      } catch (error) {
        console.error("Error storing task index in localStorage:", error);
      }
    },
    [params.id]
  );

  useEffect(() => {
    // Skip if already fetched to prevent double fetching in development
    if (configFetchedRef.current) return;

    const fetchConfig = async () => {
      configFetchedRef.current = true; // Mark as fetched immediately
      const participantId = localStorage.getItem("participantId");
      let config;

      if (participantId) {
        config = await loadTestConfig(params.id, false, participantId);
        console.log("Participant ID:", participantId);
        console.log("Assigned ID:", config.participantId);
        if (config.participantId === participantId) {
          // Retrieve the stored task index from localStorage
          const key = `treeTest_${params.id}_currentTask`;
          const stored = localStorage.getItem(key);
          if (stored) {
            const storedIndex = parseInt(stored, 10);
            // Make sure the stored index is valid for the current test
            if (config.tasks && storedIndex < config.tasks.length) {
              setInitialTaskIndex(storedIndex);
            }
          }
        } else {
          // If the participantId doesn't match, set the new one
          localStorage.setItem("participantId", config.participantId!);
          storeTaskIndex(0); // Reset task index
        }
      } else {
        config = await loadTestConfig(params.id);
        localStorage.setItem("participantId", config.participantId!);
      }

      setConfig(config);
      setIsInitialized(true);
    };

    fetchConfig();
  }, [params.id, storeTaskIndex]);

  if (!config || !isInitialized) {
    return <LoadingSkeleton />;
  }

  return (
    <TreeTestComponent
      config={config}
      initialTaskIndex={initialTaskIndex}
      onTaskChange={storeTaskIndex}
    />
  );
}
