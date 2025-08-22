import { TreeTestComponent } from "@/components/tree-test";
import { loadTestConfig } from "@/lib/treetest/actions";

export default async function TreeTestPage({ params }: { params: { id: string } }) {
  const config = await loadTestConfig(params.id, true);

  return <TreeTestComponent config={config} />;
}
