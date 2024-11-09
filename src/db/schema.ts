import { relations } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id", { length: 21 }).primaryKey(),
  discordId: text("discord_id", { length: 255 }).unique(),
  googleId: text("google_id", { length: 255 }).unique(),
  email: text("email", { length: 255 }).notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  hashedPassword: text("hashed_password", { length: 255 }),
  avatar: text("avatar", { length: 255 }),
  stripeSubscriptionId: text("stripe_subscription_id", { length: 191 }),
  stripePriceId: text("stripe_price_id", { length: 191 }),
  stripeCustomerId: text("stripe_customer_id", { length: 191 }),
  stripeCurrentPeriodEnd: integer("stripe_current_period_end", {
    mode: "timestamp",
  }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(STRFTIME('%s', 'now') * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(STRFTIME('%s', 'now') * 1000)`),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id", { length: 255 }).primaryKey(),
    userId: text("user_id", { length: 21 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userIdIndex: index("idx_sessions_user_id").on(table.userId),
  })
);

export const emailVerificationCodes = sqliteTable("email_verification_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id", { length: 21 })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email", { length: 255 }).notNull(),
  code: text("code", { length: 8 }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const passwordResetTokens = sqliteTable(
  "password_reset_tokens",
  {
    id: text("id", { length: 40 }).primaryKey(),
    userId: text("user_id", { length: 21 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userIdIndex: index("idx_password_reset_tokens_user_id").on(table.userId),
  })
);

export const studies = sqliteTable(
  "studies",
  {
    id: text("id").primaryKey(),
    userId: text("user_id", { length: 21 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("draft"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(STRFTIME('%s', 'now') * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(STRFTIME('%s', 'now') * 1000)`),
  },
  (table) => ({
    studyLookupIndex: index("idx_studies_lookup").on(table.userId, table.status),
  })
);

export const studyCollaborators = sqliteTable(
  "study_collaborators",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studyId: text("study_id")
      .notNull()
      .references(() => studies.id, { onDelete: "cascade" }),
    userId: text("user_id", { length: 21 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("editor"),
    invitedAt: integer("invited_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(STRFTIME('%s', 'now') * 1000)`),
  },
  (table) => ({
    collaborationIndex: index("idx_collaborations").on(table.studyId, table.userId),
  })
);

export const treeConfigs = sqliteTable("tree_configs", {
  id: text("id").primaryKey(),
  studyId: text("study_id")
    .notNull()
    .references(() => studies.id, { onDelete: "cascade" }),
  treeStructure: text("tree_structure").notNull(),
  tasks: text("tasks").notNull(),
  welcomeMessage: text("welcome_message"),
  completionMessage: text("completion_message"),
  maxTimePerTaskSeconds: integer("max_time_per_task_seconds"),
  requireConfidenceRating: integer("require_confidence_rating", {
    mode: "boolean",
  })
    .notNull()
    .default(true),
});

export const participants = sqliteTable(
  "participants",
  {
    id: text("id").primaryKey(),
    studyId: text("study_id")
      .notNull()
      .references(() => studies.id, { onDelete: "cascade" }),
    sessionId: text("session_id").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(STRFTIME('%s', 'now') * 1000)`),
  },
  (table) => ({
    studyIdIndex: index("idx_participants_study_id").on(table.studyId),
  })
);

export const taskResults = sqliteTable(
  "task_results",
  {
    id: text("id").primaryKey(),
    participantId: text("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    taskIndex: integer("task_index").notNull(),
    successful: integer("successful", { mode: "boolean" }).notNull(),
    directPathTaken: integer("direct_path_taken", {
      mode: "boolean",
    }).notNull(),
    completionTimeSeconds: integer("completion_time_seconds").notNull(),
    confidenceRating: integer("confidence_rating"),
    pathTaken: text("path_taken").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(STRFTIME('%s', 'now') * 1000)`),
  },
  (table) => ({
    taskLookupIndex: index("idx_task_results_lookup").on(table.participantId, table.taskIndex),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  studies: many(studies),
  studyCollaborations: many(studyCollaborators),
  sessions: many(sessions),
  passwordResetTokens: many(passwordResetTokens),
  emailVerificationCodes: many(emailVerificationCodes),
}));

export const studiesRelations = relations(studies, ({ one, many }) => ({
  user: one(users, { fields: [studies.userId], references: [users.id] }),
  treeConfig: one(treeConfigs, {
    fields: [studies.id],
    references: [treeConfigs.studyId],
  }),
  participants: many(participants),
  collaborators: many(studyCollaborators),
}));

export const studyCollaboratorsRelations = relations(studyCollaborators, ({ one }) => ({
  user: one(users, { fields: [studyCollaborators.userId], references: [users.id] }),
  study: one(studies, { fields: [studyCollaborators.studyId], references: [studies.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

export const emailVerificationCodesRelations = relations(emailVerificationCodes, ({ one }) => ({
  user: one(users, { fields: [emailVerificationCodes.userId], references: [users.id] }),
}));

export const participantsRelations = relations(participants, ({ one, many }) => ({
  study: one(studies, {
    fields: [participants.studyId],
    references: [studies.id],
  }),
  taskResults: many(taskResults),
}));

export const taskResultsRelations = relations(taskResults, ({ one }) => ({
  participant: one(participants, {
    fields: [taskResults.participantId],
    references: [participants.id],
  }),
}));

export const treeConfigsRelations = relations(treeConfigs, ({ one }) => ({
  study: one(studies, { fields: [treeConfigs.studyId], references: [studies.id] }),
}));
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
