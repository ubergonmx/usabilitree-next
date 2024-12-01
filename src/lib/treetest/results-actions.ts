"use server";

import { db } from "@/db";
import {
  participants,
  studyCollaborators,
  treeConfigs,
  treeTaskResults,
  treeTasks,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { Item, ParentClickStats, TreeTestOverviewStats } from "../types/tree-test";
import { sanitizeTreeTestLink } from "../utils";

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
  index: number;
  description: string;
  expectedAnswer: string;
  maxTimeSeconds: number | null;
  parsedTree: string;
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
      q1: number;
      q3: number;
    };
    score: number;
    breakdown: {
      directSuccess: number;
      indirectSuccess: number;
      directFail: number;
      indirectFail: number;
      directSkip: number;
      indirectSkip: number;
      total: number;
    };
    parentClicks: {
      path: string;
      isCorrect: boolean;
      firstClickCount: number;
      firstClickPercentage: number;
      totalClickCount: number;
      totalClickPercentage: number;
    }[];
    incorrectDestinations: {
      path: string;
      count: number;
      percentage: number;
    }[];
    confidenceRatings: {
      value: number;
      count: number;
      percentage: number;
    }[];
  };
}

export async function getTasksStats(studyId: string): Promise<TaskStats[]> {
  try {
    const tasks = await db
      .select({
        id: treeTasks.id,
        description: treeTasks.description,
        expectedAnswer: treeTasks.expectedAnswer,
        maxTimeSeconds: treeTasks.maxTimeSeconds || undefined,
        index: treeTasks.taskIndex,
        parsedTree: treeConfigs.parsedTree,
      })
      .from(treeTasks)
      .innerJoin(treeConfigs, eq(treeConfigs.studyId, treeTasks.studyId))
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
            minTime: sql<number>`MIN(${treeTaskResults.completionTimeSeconds})`,
            maxTime: sql<number>`MAX(${treeTaskResults.completionTimeSeconds})`,
            // Median using subquery with correct column name
            medianTime: sql<number>`(
              SELECT AVG(completion_time_seconds)
              FROM (
                SELECT ${treeTaskResults.completionTimeSeconds} as completion_time_seconds
                FROM ${treeTaskResults}
                WHERE ${treeTaskResults.taskId} = ${task.id}
                ORDER BY ${treeTaskResults.completionTimeSeconds}
                LIMIT 2 - (SELECT COUNT(*) FROM ${treeTaskResults} WHERE ${treeTaskResults.taskId} = ${task.id}) % 2
                OFFSET (SELECT (COUNT(*) - 1) / 2 FROM ${treeTaskResults} WHERE ${treeTaskResults.taskId} = ${task.id})
              )
            )`,
            // Q1 using subquery with correct column name
            q1Time: sql<number>`(
              SELECT AVG(completion_time_seconds)
              FROM (
                SELECT ${treeTaskResults.completionTimeSeconds} as completion_time_seconds
                FROM ${treeTaskResults}
                WHERE ${treeTaskResults.taskId} = ${task.id}
                ORDER BY ${treeTaskResults.completionTimeSeconds}
                LIMIT 2 - (SELECT (COUNT(*) + 1) / 4 FROM ${treeTaskResults} WHERE ${treeTaskResults.taskId} = ${task.id}) % 2
                OFFSET (SELECT ((COUNT(*) + 1) / 4) - 1 FROM ${treeTaskResults} WHERE ${treeTaskResults.taskId} = ${task.id})
              )
            )`,
            // Q3 using subquery with correct column name
            q3Time: sql<number>`(
              SELECT AVG(completion_time_seconds)
              FROM (
                SELECT ${treeTaskResults.completionTimeSeconds} as completion_time_seconds
                FROM ${treeTaskResults}
                WHERE ${treeTaskResults.taskId} = ${task.id}
                ORDER BY ${treeTaskResults.completionTimeSeconds}
                LIMIT 2 - (SELECT (3 * (COUNT(*) + 1)) / 4 FROM ${treeTaskResults} WHERE ${treeTaskResults.taskId} = ${task.id}) % 2
                OFFSET (SELECT ((3 * (COUNT(*) + 1)) / 4) - 1 FROM ${treeTaskResults} WHERE ${treeTaskResults.taskId} = ${task.id})
              )
            )`,
            directSuccess: sql<number>`sum(case when ${treeTaskResults.successful} = 1 and ${treeTaskResults.directPathTaken} = 1 and ${treeTaskResults.skipped} = 0 then 1 else 0 end)`,
            indirectSuccess: sql<number>`sum(case when ${treeTaskResults.successful} = 1 and ${treeTaskResults.directPathTaken} = 0 and ${treeTaskResults.skipped} = 0 then 1 else 0 end)`,
            directFail: sql<number>`sum(case when ${treeTaskResults.successful} = 0 and ${treeTaskResults.directPathTaken} = 1 and ${treeTaskResults.skipped} = 0 then 1 else 0 end)`,
            indirectFail: sql<number>`sum(case when ${treeTaskResults.successful} = 0 and ${treeTaskResults.directPathTaken} = 0 and ${treeTaskResults.skipped} = 0 then 1 else 0 end)`,
            directSkip: sql<number>`sum(case when ${treeTaskResults.skipped} = 1 and ${treeTaskResults.directPathTaken} = 1 then 1 else 0 end)`,
            indirectSkip: sql<number>`sum(case when ${treeTaskResults.skipped} = 1 and ${treeTaskResults.directPathTaken} = 0 then 1 else 0 end)`,
            total: sql<number>`count(*)`,
          })
          .from(treeTaskResults)
          .where(eq(treeTaskResults.taskId, task.id));

        // Calculate overall score (weighted average of success and directness)
        const score = Math.round(stats.successRate * 0.7 + stats.directnessRate * 0.3);

        // Get parent clicks statistics
        const pathResults = await db
          .select({
            pathTaken: treeTaskResults.pathTaken,
            count: sql<number>`count(*)`,
          })
          .from(treeTaskResults)
          .innerJoin(participants, eq(participants.id, treeTaskResults.participantId))
          .where(
            and(
              eq(participants.studyId, studyId),
              eq(treeTaskResults.taskId, task.id),
              eq(treeTaskResults.skipped, false)
            )
          )
          .groupBy(treeTaskResults.pathTaken);

        const totalParticipants = pathResults.reduce((sum, r) => sum + Number(r.count), 0);

        // Parse the tree to determine if "home" is the only root child
        const tree = JSON.parse(task.parsedTree) as Item[];
        const hasOnlyHomeRoot = tree.length === 1 && tree[0].name.toLowerCase().includes("home");

        // Process paths to get parent click statistics
        const parentClickStats = new Map<string, ParentClickStats>();
        const homeRoot = hasOnlyHomeRoot ? sanitizeTreeTestLink(tree[0].name) : "";

        pathResults.forEach((result) => {
          const pathParts = result.pathTaken.split("/").filter(Boolean);
          const expectedAnswers = task.expectedAnswer.split(",").map((answer) => answer.trim());

          // Get parent path based on tree structure
          const parentPath =
            hasOnlyHomeRoot && pathParts.length > 1
              ? `/${homeRoot}/${pathParts[1]}`
              : `/${pathParts[0]}`;

          const expectedParentPaths = expectedAnswers.map((answer) => {
            const expectedParts = answer.split("/").filter(Boolean);
            return hasOnlyHomeRoot && expectedParts.length > 1
              ? `/${homeRoot}/${expectedParts[1]}`
              : `/${expectedParts[0]}`;
          });

          if (!parentClickStats.has(parentPath)) {
            parentClickStats.set(parentPath, {
              path: parentPath,
              isCorrect: expectedParentPaths.includes(parentPath),
              firstClickCount: Number(result.count),
              firstClickPercentage: Math.round((Number(result.count) / totalParticipants) * 100),
              totalClickCount: Number(result.count),
              totalClickPercentage: Math.round((Number(result.count) / totalParticipants) * 100),
            });
          } else {
            const stats = parentClickStats.get(parentPath)!;
            stats.totalClickCount += Number(result.count);
            stats.totalClickPercentage = Math.round(
              (stats.totalClickCount / totalParticipants) * 100
            );
          }
        });

        // Get incorrect destinations
        const incorrectResults = await db
          .select({
            pathTaken: treeTaskResults.pathTaken,
            count: sql<number>`count(*)`,
          })
          .from(treeTaskResults)
          .innerJoin(participants, eq(participants.id, treeTaskResults.participantId))
          .where(
            and(
              eq(participants.studyId, studyId),
              eq(treeTaskResults.taskId, task.id),
              eq(treeTaskResults.successful, false),
              eq(treeTaskResults.skipped, false)
            )
          )
          .groupBy(treeTaskResults.pathTaken);

        const totalIncorrect = incorrectResults.reduce((sum, r) => sum + Number(r.count), 0);

        // Get confidence ratings distribution
        const confidenceRatings = await db
          .select({
            value: treeTaskResults.confidenceRating,
            count: sql<number>`count(*)`,
          })
          .from(treeTaskResults)
          .where(
            and(
              eq(treeTaskResults.taskId, task.id),
              sql`${treeTaskResults.confidenceRating} is not null`
            )
          )
          .groupBy(treeTaskResults.confidenceRating);

        const totalRatings = confidenceRatings.reduce((sum, r) => sum + Number(r.count), 0);

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
              q1: Math.round(stats.q1Time || 0),
              q3: Math.round(stats.q3Time || 0),
            },
            score,
            breakdown: {
              directSuccess: Number(stats.directSuccess) || 0,
              indirectSuccess: Number(stats.indirectSuccess) || 0,
              directFail: Number(stats.directFail) || 0,
              indirectFail: Number(stats.indirectFail) || 0,
              directSkip: Number(stats.directSkip) || 0,
              indirectSkip: Number(stats.indirectSkip) || 0,
              total: Number(stats.total) || 0,
            },
            parentClicks: Array.from(parentClickStats.values()).sort(
              (a, b) => b.firstClickCount - a.firstClickCount
            ),
            incorrectDestinations: incorrectResults.map((result) => ({
              path: result.pathTaken,
              count: Number(result.count),
              percentage: Math.round((Number(result.count) / totalIncorrect) * 100),
            })),
            confidenceRatings: confidenceRatings.map((rating) => ({
              value: Number(rating.value),
              count: Number(rating.count),
              percentage: Math.round((Number(rating.count) / totalRatings) * 100),
            })),
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

export interface Participant {
  id: string;
  sessionId: string;
  startedAt: Date;
  completedAt: Date | null;
  taskResults: {
    id: string;
    taskId: string;
    successful: boolean;
    directPathTaken: boolean;
    completionTimeSeconds: number;
    pathTaken: string;
    taskIndex: number;
    description: string;
    skipped: boolean;
    createdAt: Date;
  }[];
  hasDuplicates: boolean;
  participantNumber: number;
}

export async function getParticipants(studyId: string): Promise<Participant[]> {
  try {
    const studyParticipants = await db
      .select({
        id: participants.id,
        sessionId: participants.sessionId,
        startedAt: participants.startedAt,
        completedAt: participants.completedAt,
      })
      .from(participants)
      .where(eq(participants.studyId, studyId));

    const participantsWithResults = await Promise.all(
      studyParticipants.map(async (participant, index) => {
        const results = await db
          .select({
            id: treeTaskResults.id,
            taskId: treeTaskResults.taskId,
            successful: treeTaskResults.successful,
            directPathTaken: treeTaskResults.directPathTaken,
            completionTimeSeconds: treeTaskResults.completionTimeSeconds,
            pathTaken: treeTaskResults.pathTaken,
            skipped: treeTaskResults.skipped,
            taskIndex: treeTasks.taskIndex,
            description: treeTasks.description,
            createdAt: treeTaskResults.createdAt,
          })
          .from(treeTaskResults)
          .innerJoin(treeTasks, eq(treeTasks.id, treeTaskResults.taskId))
          .where(eq(treeTaskResults.participantId, participant.id));

        // Group results by taskIndex to identify duplicates
        const groupedResults = results.reduce(
          (acc, result) => {
            if (!acc[result.taskIndex]) {
              acc[result.taskIndex] = [];
            }
            acc[result.taskIndex].push(result);
            return acc;
          },
          {} as Record<number, typeof results>
        );

        return {
          ...participant,
          taskResults: results,
          hasDuplicates: Object.values(groupedResults).some((group) => group.length > 1),
          participantNumber: index + 1,
        };
      })
    );

    return participantsWithResults;
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    throw new Error("Failed to fetch participants");
  }
}

export async function deleteTaskResult(taskId: string): Promise<void> {
  try {
    await db.delete(treeTaskResults).where(eq(treeTaskResults.id, taskId));
  } catch (error) {
    console.error("Failed to delete task result:", error);
    throw new Error("Failed to delete task result");
  }
}

export async function deleteParticipant(participantId: string): Promise<void> {
  try {
    await db.delete(participants).where(eq(participants.id, participantId));
  } catch (error) {
    console.error("Failed to delete participant:", error);
    throw new Error("Failed to delete participant");
  }
}
