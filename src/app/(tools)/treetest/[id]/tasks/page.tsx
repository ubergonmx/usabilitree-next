"use client";

import { useEffect, useState } from "react";
import { TreeTestComponent } from "@/components/tree-test";
import { loadTestConfig } from "@/lib/treetest/actions";
import { TreeTestConfig } from "@/lib/types/tree-test";
import { LoadingSkeleton } from "@/components/tree-test-loading-skeleton";

export default function TreeTestPage({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState<TreeTestConfig>();

  useEffect(() => {
    const fetchConfig = async () => {
      const participantId = localStorage.getItem("participantId");
      let config;

      if (participantId) {
        config = await loadTestConfig(params.id, false, participantId);
      } else {
        config = await loadTestConfig(params.id, false);
        localStorage.setItem("participantId", config.participantId!);
      }

      setConfig(config);
    };

    fetchConfig();
  }, [params.id]);

  if (!config) {
    return <LoadingSkeleton />;
  }

  return <TreeTestComponent config={config} />;
}
