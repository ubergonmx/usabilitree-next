"use server";

import { db } from "@/db";
import { participants, studies, treeConfigs, treeTaskResults, treeTasks } from "@/db/schema";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
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
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Start a transaction to ensure all updates succeed or fail together
    await db.transaction(async (tx) => {
      // Update general study info
      await tx
        .update(studies)
        .set({
          title: data.general.title || "Untitled Study",
          description: data.general.description,
          updatedAt: new Date(),
        })
        .where(eq(studies.id, id));

      // Update or insert tree config
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

      // Delete existing tasks and insert new ones
      await tx.delete(treeTasks).where(eq(treeTasks.studyId, id));

      // Insert new tasks
      if (data.tasks.items.length > 0) {
        const tasksToInsert = data.tasks.items
          .filter((task) => task.description && task.answer) // Filter tasks with non-empty description and answer
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

    if (!preview && !participantId) {
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

export async function updateParticipantCompletion(participantId: string) {
  try {
    await db
      .update(participants)
      .set({
        completedAt: new Date(),
      })
      .where(eq(participants.id, participantId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update participant completion time:", error);
    throw new Error("Failed to update participant completion time");
  }
}

export async function getStudyTitle(studyId: string): Promise<string> {
  try {
    const study = await db
      .select({ title: studies.title })
      .from(studies)
      .where(eq(studies.id, studyId))
      .get();

    return study?.title || "Study Results";
  } catch (error) {
    console.error("Failed to get study title:", error);
    return "Study Results";
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
