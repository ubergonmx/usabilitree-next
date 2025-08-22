import { db } from "@/db";
import TestLivePage from "./_components/live-tree-test";
import { studies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";

export default async function Page({ params }: { params: { id: string } }) {
  const [study] = await db.select().from(studies).where(eq(studies.id, params.id));

  if (!study) {
    return redirect(Paths.Dashboard);
  }

  return <TestLivePage params={params} />;
}
