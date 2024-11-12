import * as React from "react";
import { db } from "@/db";
import { studies as studiesTable, studyCollaborators, users } from "@/db/schema";
import { StudyCard } from "./study-card";
import { NewStudy } from "./new-study";
import { getCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function Studies() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Get owned studies
  const ownedStudies = await db.select().from(studiesTable).where(eq(studiesTable.userId, user.id));

  // Get collaborated studies
  const collaboratedStudies = await db
    .select({
      study: studiesTable,
      owner: users,
    })
    .from(studyCollaborators)
    .innerJoin(studiesTable, eq(studiesTable.id, studyCollaborators.studyId))
    .innerJoin(users, eq(users.id, studiesTable.userId))
    .where(eq(studyCollaborators.email, user.email));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NewStudy isEligible={ownedStudies.length <= 3} />
        {ownedStudies.map((study) => (
          <StudyCard key={study.id} study={study} isOwner={true} />
        ))}
      </div>

      {collaboratedStudies.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">Shared with me</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collaboratedStudies.map(({ study, owner }) => (
              <StudyCard key={study.id} study={study} userName={owner.email} isOwner={false} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
