import * as React from "react";
import { db } from "@/db";
import { studies as studiesTable } from "@/db/schema";
import { StudyCard } from "./study-card";
import { NewStudy } from "./new-study";

export async function Studies() {
  const studies = await db.select().from(studiesTable);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NewStudy isEligible={studies.length <= 3} />
      {studies.map((study) => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  );
}
