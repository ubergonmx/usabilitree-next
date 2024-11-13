"use server";

import { db } from "@/db";
import { participants, studyCollaborators, treeTaskResults, treeTasks } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { TreeTestOverviewStats } from "../types/tree-test";

export async function getStudyOverviewStats(studyId: string): Promise<TreeTestOverviewStats> {
  try {
    // Get participant counts
    const [participantCounts] = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`sum(case when ${participants.completedAt} is not null then 1 else 0 end)`,
      })
      .from(participants)
      .where(eq(participants.studyId, studyId));

    // Calculate completion times
    const completionTimes = await db
      .select({
        timeTaken: sql<number>`${participants.completedAt} - ${participants.startedAt}`,
      })
      .from(participants)
      .where(and(eq(participants.studyId, studyId), sql`${participants.completedAt} is not null`));

    const times = completionTimes.map((t) => t.timeTaken).sort((a, b) => a - b);
    const medianIndex = Math.floor(times.length / 2);

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

    const completionRate = (participantCounts.completed / participantCounts.total) * 100;

    return {
      totalParticipants: participantCounts.total,
      completedParticipants: participantCounts.completed,
      abandonedParticipants: participantCounts.total - participantCounts.completed,
      completionRate: Math.round(completionRate),
      medianCompletionTime: times[medianIndex] || 0,
      shortestCompletionTime: times[0] || 0,
      longestCompletionTime: times[times.length - 1] || 0,
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

export interface TaskStats {
  id: string;
  description: string;
  expectedAnswer: string;
  stats: {
    success: {
      rate: number;
      margin: number;
    };
    directness: {
      rate: number;
      margin: number;
    };
    time: {
      median: number;
      min: number;
      max: number;
    };
    score: number;
  };
}

export async function getTasksStats(studyId: string): Promise<TaskStats[]> {
  try {
    const tasks = await db
      .select({
        id: treeTasks.id,
        description: treeTasks.description,
        expectedAnswer: treeTasks.expectedAnswer,
      })
      .from(treeTasks)
      .where(eq(treeTasks.studyId, studyId))
      .orderBy(treeTasks.taskIndex);

    const taskStats = await Promise.all(
      tasks.map(async (task) => {
        const [stats] = await db
          .select({
            successRate: sql<number>`avg(case when ${treeTaskResults.successful} = 1 then 100.0 else 0.0 end)`,
            successMargin: sql<number>`sqrt(avg(case when ${treeTaskResults.successful} = 1 then 100.0 else 0.0 end) * (1 - avg(case when ${treeTaskResults.successful} = 1 then 1.0 else 0.0 end)) / count(*)) * 1.96`,
            directnessRate: sql<number>`avg(case when ${treeTaskResults.directPathTaken} = 1 then 100.0 else 0.0 end)`,
            directnessMargin: sql<number>`sqrt(avg(case when ${treeTaskResults.directPathTaken} = 1 then 100.0 else 0.0 end) * (1 - avg(case when ${treeTaskResults.directPathTaken} = 1 then 1.0 else 0.0 end)) / count(*)) * 1.96`,
            medianTime: sql<number>`avg(${treeTaskResults.completionTimeSeconds})`,
            minTime: sql<number>`min(${treeTaskResults.completionTimeSeconds})`,
            maxTime: sql<number>`max(${treeTaskResults.completionTimeSeconds})`,
          })
          .from(treeTaskResults)
          .where(eq(treeTaskResults.taskId, task.id));

        // Calculate overall score (weighted average of success and directness)
        const score = Math.round(stats.successRate * 0.7 + stats.directnessRate * 0.3);

        return {
          ...task,
          stats: {
            success: {
              rate: Math.round(stats.successRate || 0),
              margin: Math.round(stats.successMargin || 0),
            },
            directness: {
              rate: Math.round(stats.directnessRate || 0),
              margin: Math.round(stats.directnessMargin || 0),
            },
            time: {
              median: Math.round(stats.medianTime || 0),
              min: Math.round(stats.minTime || 0),
              max: Math.round(stats.maxTime || 0),
            },
            score,
          },
        };
      })
    );

    return taskStats;
  } catch (error) {
    console.error("Failed to get tasks stats:", error);
    throw new Error("Failed to get tasks stats");
  }
}
