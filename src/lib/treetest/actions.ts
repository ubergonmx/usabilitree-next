"use server";

import { db } from "@/db";
import { participants, studies, treeConfigs, treeTaskResults, treeTasks } from "@/db/schema";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { desc, and, ne, eq, sql } from "drizzle-orm";
import { StudyFormData, TreeNode } from "@/lib/types/tree-test";

const defaultWelcomeMessage = `Welcome to this Tree Test study, and thank you for agreeing to participate!

We are [insert names here].

The activity shouldn't take longer than **10 to 15 minutes** to complete.

Your response will **help us to organize the content of the website, [insert organization name here]**. Find out how on the next page...`;

const defaultCompletionMessage = `# Thanks
All done, awesome! Thanks again for your participation. Your feedback is incredibly useful in helping to determine how our content should be organized, so we can make our website easier to use.

You may now close this window or navigate to another web page.`;

export async function createStudy(type: "tree_test" | "card_sort") {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const studyId = nanoid();

  try {
    await db.insert(studies).values({
      id: studyId,
      userId: user.id,
      title: "Untitled Study",
      description: "",
      status: "draft",
      type: type,
    });

    await db.insert(treeConfigs).values({
      id: nanoid(),
      studyId: studyId,
      treeStructure: "",
      parsedTree: JSON.stringify([]),
      welcomeMessage: defaultWelcomeMessage,
      completionMessage: defaultCompletionMessage,
    });

    revalidatePath("/dashboard");

    return { id: studyId };
  } catch (error) {
    console.error("Failed to create study:", error);
    throw new Error("Failed to create study");
  }
}

export async function updateStudyStatus(id: string, status: "draft" | "active" | "completed") {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    await db.update(studies).set({ status, updatedAt: new Date() }).where(eq(studies.id, id));

    revalidatePath(`/treetest/setup/${id}`);
  } catch (error) {
    console.error("Failed to update study status:", error);
    throw new Error("Failed to update study status");
  }
}

export async function deleteStudy(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    await db.delete(studies).where(eq(studies.id, id));
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to delete study:", error);
    throw new Error("Failed to delete study");
  }
}

export async function saveStudyData(id: string, data: StudyFormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    await db.transaction(async (tx) => {
      const [study] = await tx
        .select({ status: studies.status })
        .from(studies)
        .where(eq(studies.id, id));

      await tx
        .update(studies)
        .set({
          title: data.general.title || "Untitled Study",
          description: data.general.description,
          updatedAt: new Date(),
        })
        .where(eq(studies.id, id));

      const [existingConfig] = await tx
        .select()
        .from(treeConfigs)
        .where(eq(treeConfigs.studyId, id));

      if (existingConfig) {
        await tx
          .update(treeConfigs)
          .set({
            treeStructure: data.tree.structure,
            parsedTree: JSON.stringify(data.tree.parsed),
            welcomeMessage: data.messages.welcome,
            completionMessage: data.messages.completion,
          })
          .where(eq(treeConfigs.studyId, id));
      } else {
        await tx.insert(treeConfigs).values({
          id: nanoid(),
          studyId: id,
          treeStructure: data.tree.structure,
          parsedTree: JSON.stringify(data.tree.parsed),
          welcomeMessage: data.messages.welcome,
          completionMessage: data.messages.completion,
        });
      }

      // Handle tasks based on study status
      if (study?.status === "draft") {
        // In draft mode, can delete and recreate tasks
        await tx.delete(treeTasks).where(eq(treeTasks.studyId, id));

        if (data.tasks.items.length > 0) {
          const tasksToInsert = data.tasks.items
            .filter((task) => task.description && task.answer)
            .map((task, index) => ({
              id: nanoid(),
              studyId: id,
              taskIndex: index,
              description: task.description,
              expectedAnswer: task.answer,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

          if (tasksToInsert.length > 0) {
            await tx.insert(treeTasks).values(tasksToInsert);
          }
        }
      } else {
        // Not in draft mode, update existing tasks only
        const existingTasks = await tx
          .select()
          .from(treeTasks)
          .where(eq(treeTasks.studyId, id))
          .orderBy(treeTasks.taskIndex);

        const now = new Date();

        await Promise.all(
          existingTasks.map(async (task, index) => {
            const updatedTask = data.tasks.items[index];
            if (
              !updatedTask?.description ||
              !updatedTask?.answer ||
              (task.description === updatedTask.description &&
                task.expectedAnswer === updatedTask.answer)
            ) {
              return;
            }

            // Update task
            await tx
              .update(treeTasks)
              .set({
                description: updatedTask.description,
                expectedAnswer: updatedTask.answer,
                updatedAt: now,
              })
              .where(eq(treeTasks.id, task.id));

            // If answer changed, update all results for this task
            if (task.expectedAnswer !== updatedTask.answer) {
              const taskResults = await tx
                .select()
                .from(treeTaskResults)
                .where(eq(treeTaskResults.taskId, task.id));

              const correctAnswers = updatedTask.answer.split(",").map((a) => a.trim());

              await Promise.all(
                taskResults.map((result) => {
                  const actualPath = findLastValidPath(data.tree.parsed, result.pathTaken);

                  return tx
                    .update(treeTaskResults)
                    .set({
                      successful: actualPath ? correctAnswers.includes(actualPath) : false,
                    })
                    .where(eq(treeTaskResults.id, result.id));
                })
              );
            }
          })
        );
      }
    });

    revalidatePath(`/treetest/setup/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to save study data:", error);
    throw new Error("Failed to save study data");
  }
}

export async function loadStudyData(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const [study] = await db.select().from(studies).where(eq(studies.id, id));
    if (!study) throw new Error("Study not found");

    const [config] = await db.select().from(treeConfigs).where(eq(treeConfigs.studyId, id));

    const tasks = await db
      .select()
      .from(treeTasks)
      .where(eq(treeTasks.studyId, id))
      .orderBy(treeTasks.taskIndex);

    return {
      general: {
        title: study.title,
        description: study.description || "",
      },
      tree: {
        structure: config?.treeStructure || "",
        parsed: config?.parsedTree ? (JSON.parse(config.parsedTree) as TreeNode[]) : [],
      },
      tasks: {
        items: tasks.map((task) => ({
          description: task.description,
          answer: task.expectedAnswer,
        })),
      },
      messages: {
        welcome: config?.welcomeMessage || "",
        completion: config?.completionMessage || "",
      },
    } satisfies StudyFormData;
  } catch (error) {
    console.error("Failed to load study data:", error);
    throw new Error("Failed to load study data");
  }
}

export async function loadWelcomeMessage(id: string) {
  try {
    const [config] = await db
      .select({
        welcomeMessage: treeConfigs.welcomeMessage,
      })
      .from(treeConfigs)
      .where(eq(treeConfigs.studyId, id));

    return config?.welcomeMessage || defaultWelcomeMessage;
  } catch (error) {
    console.error("Failed to load welcome message:", error);
    throw new Error("Failed to load welcome message");
  }
}

export async function loadCompletionMessage(id: string) {
  try {
    const [config] = await db
      .select({
        completionMessage: treeConfigs.completionMessage,
      })
      .from(treeConfigs)
      .where(eq(treeConfigs.studyId, id));

    return config?.completionMessage || defaultCompletionMessage;
  } catch (error) {
    console.error("Failed to load completion message:", error);
    throw new Error("Failed to load completion message");
  }
}

export async function loadTestConfig(id: string, preview: boolean = false, participantId?: string) {
  try {
    const [config] = await db
      .select({
        treeStructure: treeConfigs.parsedTree,
        requireConfidenceRating: treeConfigs.requireConfidenceRating,
      })
      .from(treeConfigs)
      .where(eq(treeConfigs.studyId, id));

    const tasks = await db
      .select({
        id: treeTasks.id,
        description: treeTasks.description,
        expectedAnswer: treeTasks.expectedAnswer,
      })
      .from(treeTasks)
      .where(eq(treeTasks.studyId, id))
      .orderBy(treeTasks.taskIndex);

    if (!config) throw new Error("Test configuration not found");

    // check if participantId is already in the database
    let existingParticipantId;
    if (participantId) {
      const result = await db
        .select({ id: participants.id })
        .from(participants)
        .where(and(eq(participants.id, participantId), eq(participants.studyId, id)));
      if (result.length > 0) {
        existingParticipantId = result[0].id;
      }
    }
    console.log("Existing participant ID:", existingParticipantId);
    if (!preview && !existingParticipantId) {
      const [participant] = await db
        .insert(participants)
        .values({
          id: nanoid(),
          studyId: id,
          sessionId: nanoid(),
          startedAt: new Date(),
        })
        .returning({ id: participants.id });
      participantId = participant.id;
    }

    return {
      tree: JSON.parse(config.treeStructure),
      tasks: tasks.map((task) => ({
        id: task.id,
        description: task.description,
        link: task.expectedAnswer,
      })),
      requireConfidenceRating: config.requireConfidenceRating,
      preview,
      participantId,
      studyId: id,
    };
  } catch (error) {
    console.error("Failed to load test configuration:", error);
    throw new Error("Failed to load test configuration");
  }
}

export async function storeTreeTaskResult(
  participantId: string,
  taskId: string,
  result: {
    successful: boolean;
    directPathTaken: boolean;
    completionTimeSeconds: number;
    confidenceRating?: number;
    pathTaken: string;
    skipped: boolean;
  }
) {
  try {
    await db.insert(treeTaskResults).values({
      id: nanoid(),
      participantId,
      taskId,
      successful: result.successful,
      directPathTaken: result.directPathTaken,
      completionTimeSeconds: result.completionTimeSeconds,
      confidenceRating: result.confidenceRating,
      pathTaken: result.pathTaken,
      skipped: result.skipped,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to store tree task result:", error);
    throw new Error("Failed to store tree task result");
  }
}

export async function updateParticipantCompletion(
  participantId: string,
  activeTime: number | null
) {
  try {
    await db
      .update(participants)
      .set({
        completedAt: new Date(),
        durationSeconds: activeTime,
      })
      .where(eq(participants.id, participantId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update participant completion time:", error);
    throw new Error("Failed to update participant completion time");
  }
}

export async function getStudyDetails(studyId: string): Promise<{ title: string; status: string }> {
  try {
    const study = await db
      .select({
        title: studies.title,
        status: studies.status,
      })
      .from(studies)
      .where(eq(studies.id, studyId))
      .get();

    return {
      title: study?.title || "Study Results",
      status: study?.status || "draft",
    };
  } catch (error) {
    console.error("Failed to get study details:", error);
    return {
      title: "Study Results",
      status: "draft",
    };
  }
}

export async function checkStudyCompletion(id: string): Promise<boolean> {
  try {
    const [config] = await db
      .select({
        status: studies.status,
      })
      .from(studies)
      .where(eq(studies.id, id));

    return config?.status === "completed";
  } catch (error) {
    console.error("Failed to load welcome message:", error);
    throw new Error("Failed to load welcome message");
  }
}

export async function getExistingStudies(currentStudyId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const studiesList = await db
      .select({
        id: studies.id,
        title: studies.title,
        taskCount: sql<number>`count(${treeTasks.id})`.mapWith(Number),
        updatedAt: studies.updatedAt,
      })
      .from(studies)
      .leftJoin(treeTasks, eq(treeTasks.studyId, studies.id))
      .where(
        and(
          eq(studies.userId, user.id),
          eq(studies.type, "tree_test"),
          ne(studies.id, currentStudyId)
        )
      )
      .groupBy(studies.id, studies.title, studies.updatedAt)
      .having(sql`count(${treeTasks.id}) > 0`)
      .orderBy(desc(studies.updatedAt));

    return studiesList;
  } catch (error) {
    console.error("Failed to get existing studies:", error);
    throw new Error("Failed to get existing studies");
  }
}

export async function getStudyTasks(studyId: string) {
  try {
    const tasks = await db
      .select({
        description: treeTasks.description,
        answer: treeTasks.expectedAnswer,
      })
      .from(treeTasks)
      .where(eq(treeTasks.studyId, studyId))
      .orderBy(treeTasks.taskIndex);

    return tasks;
  } catch (error) {
    console.error("Failed to get study tasks:", error);
    throw new Error("Failed to get study tasks");
  }
}

function findLastValidPath(tree: TreeNode[], pathTaken: string): string | null {
  // Split path into segments
  const segments = pathTaken.split("/").filter(Boolean);

  // Function to collect all valid links from tree
  const collectLinks = (nodes: TreeNode[], validLinks: string[]) => {
    for (const node of nodes) {
      if (node.link) {
        validLinks.push(node.link);
      }
      if (node.children) {
        collectLinks(node.children, validLinks);
      }
    }
  };

  const validLinks: string[] = [];
  collectLinks(tree, validLinks);

  // Go through segments in reverse to find last valid path
  for (let i = segments.length - 1; i >= 0; i--) {
    const targetNode = segments[i];
    const validLink = validLinks.find((link) => link.endsWith(`/${targetNode}`));
    if (validLink) {
      return validLink;
    }
  }

  return null;
}
