import { useEffect, useState } from "react";

import { TreeTestComponent } from "@/components/tree-test";
import { loadTestConfig } from "@/lib/treetest/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { TreeTestConfig } from "@/lib/types/tree-test";

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
    return <Loading />;
  }

  return (
    <div>
      <TreeTestComponent config={config} />
    </div>
  );
}

// Add loading state
export function Loading() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <div className="mt-8 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
