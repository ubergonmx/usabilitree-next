CREATE TABLE `email_verification_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text(21) NOT NULL,
	`email` text(255) NOT NULL,
	`code` text(8) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_codes_user_id_unique` ON `email_verification_codes` (`user_id`);--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`study_id` text NOT NULL,
	`session_id` text NOT NULL,
	`started_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`study_id`) REFERENCES `studies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_session_id_unique` ON `participants` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_participants_study_id` ON `participants` (`study_id`);--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` text(40) PRIMARY KEY NOT NULL,
	`user_id` text(21) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_password_reset_tokens_user_id` ON `password_reset_tokens` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`user_id` text(21) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `studies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text(21) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_studies_lookup` ON `studies` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `study_collaborators` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`study_id` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`study_id`) REFERENCES `studies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_collaborations` ON `study_collaborators` (`study_id`,`email`);--> statement-breakpoint
CREATE TABLE `tree_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`study_id` text NOT NULL,
	`tree_structure` text NOT NULL,
	`parsed_tree` text NOT NULL,
	`welcome_message` text,
	`completion_message` text,
	`require_confidence_rating` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`study_id`) REFERENCES `studies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tree_task_results` (
	`id` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`task_id` text NOT NULL,
	`successful` integer NOT NULL,
	`direct_path_taken` integer NOT NULL,
	`completion_time_seconds` integer NOT NULL,
	`confidence_rating` integer,
	`path_taken` text NOT NULL,
	`skipped` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `tree_tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_task_results_lookup` ON `tree_task_results` (`participant_id`,`task_id`);--> statement-breakpoint
CREATE TABLE `tree_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`study_id` text NOT NULL,
	`task_index` integer NOT NULL,
	`description` text NOT NULL,
	`expected_answer` text NOT NULL,
	`max_time_seconds` integer,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`study_id`) REFERENCES `studies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_tree_tasks_order` ON `tree_tasks` (`study_id`,`task_index`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_study_task_index` ON `tree_tasks` (`study_id`,`task_index`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(21) PRIMARY KEY NOT NULL,
	`discord_id` text(255),
	`google_id` text(255),
	`email` text(255) NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`hashed_password` text(255),
	`avatar` text(255),
	`stripe_subscription_id` text(191),
	`stripe_price_id` text(191),
	`stripe_customer_id` text(191),
	`stripe_current_period_end` integer,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (STRFTIME('%s', 'now') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_id_unique` ON `users` (`discord_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_unique` ON `users` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);