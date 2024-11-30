import TestPreviewPage from "../_components/preview-tree-test";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div>
      <TestPreviewPage params={params} />
    </div>
  );
}
