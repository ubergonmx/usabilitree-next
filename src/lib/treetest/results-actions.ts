"use server";

import { db } from "@/db";
import { participants, studyCollaborators, treeTaskResults, treeTasks } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export interface StudyOverviewStats {
  totalParticipants: number;
  completedParticipants: number;
  medianCompletionTime: number;
  successRate: number;
  directnessRate: number;
}

export async function getStudyOverviewStats(studyId: string): Promise<StudyOverviewStats> {
  try {
    // Get participant counts
    const [participantCounts] = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`sum(case when ${participants.completedAt} is not null then 1 else 0 end)`,
      })
      .from(participants)
      .where(eq(participants.studyId, studyId));

    // Calculate median completion time
    const completionTimes = await db
      .select({
        timeTaken: sql<number>`${participants.completedAt} - ${participants.startedAt}`,
      })
      .from(participants)
      .where(and(eq(participants.studyId, studyId), sql`${participants.completedAt} is not null`));

    console.log("completionTimes", completionTimes);

    const sortedTimes = completionTimes.map((t) => t.timeTaken).sort((a, b) => a - b);

    const medianTime = sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length / 2)] : 0;

    console.log("medianTime", medianTime);

    // Get task success and directness rates
    const [taskStats] = await db
      .select({
        successRate: sql<number>`avg(case when ${treeTaskResults.successful} = 1 then 100.0 else 0.0 end)`,
        directnessRate: sql<number>`avg(case when ${treeTaskResults.directPathTaken} = 1 then 100.0 else 0.0 end)`,
      })
      .from(treeTaskResults)
      .innerJoin(
        treeTasks,
        and(eq(treeTasks.id, treeTaskResults.taskId), eq(treeTasks.studyId, studyId))
      );

    console.log("taskStats", taskStats);

    return {
      totalParticipants: participantCounts.total,
      completedParticipants: participantCounts.completed,
      medianCompletionTime: Math.round(medianTime),
      successRate: Math.round(taskStats?.successRate || 0),
      directnessRate: Math.round(taskStats?.directnessRate || 0),
    };
  } catch (error) {
    console.error("Failed to get study overview stats:", error);
    throw new Error("Failed to get study overview stats");
  }
}

export interface Collaborator {
  id: number;
  email: string;
  createdAt: Date;
}

export async function getStudyCollaborators(studyId: string): Promise<Collaborator[]> {
  try {
    const collaborators = await db
      .select()
      .from(studyCollaborators)
      .where(eq(studyCollaborators.studyId, studyId));

    return collaborators.map((c) => ({
      id: c.id,
      email: c.email,
      createdAt: new Date(Number(c.createdAt)),
    }));
  } catch (error) {
    console.error("Failed to get study collaborators:", error);
    throw new Error("Failed to get study collaborators");
  }
}

export async function addStudyCollaborator(studyId: string, email: string) {
  try {
    await db.insert(studyCollaborators).values({
      studyId,
      email,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to add collaborator:", error);
    throw new Error("Failed to add collaborator");
  }
}

export async function removeStudyCollaborator(collaboratorId: number) {
  try {
    await db.delete(studyCollaborators).where(eq(studyCollaborators.id, collaboratorId));
    return { success: true };
  } catch (error) {
    console.error("Failed to remove collaborator:", error);
    throw new Error("Failed to remove collaborator");
  }
}
