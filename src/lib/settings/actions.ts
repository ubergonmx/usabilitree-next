"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verify, hash } from "@/lib/auth/hash";
import { revalidatePath } from "next/cache";

export async function updateUserSettings({
  userId,
  email,
  currentPassword,
  newPassword,
}: {
  userId: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  try {
    const [existingUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Only allow password change if user has a password set
    if (newPassword && !existingUser.hashedPassword) {
      throw new Error("Cannot set password for OAuth accounts");
    }

    // If changing password, verify current password
    if (newPassword && currentPassword) {
      const isValid = await verify(existingUser.hashedPassword!, currentPassword);
      if (!isValid) {
        throw new Error("Current password is incorrect");
      }
    }

    const updateData: Partial<typeof users.$inferInsert> = {
      email,
      updatedAt: new Date(),
    };

    if (newPassword) {
      updateData.hashedPassword = await hash(newPassword);
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
