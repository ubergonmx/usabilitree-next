CREATE INDEX `idx_task_results_task_id` ON `tree_task_results` (`task_id`);--> statement-breakpoint
CREATE INDEX `idx_task_results_time_stats` ON `tree_task_results` (`task_id`,`completion_time_seconds`);--> statement-breakpoint
CREATE INDEX `idx_task_results_confidence` ON `tree_task_results` (`task_id`,`confidence_rating`);--> statement-breakpoint
CREATE INDEX `idx_task_results_path_analysis` ON `tree_task_results` (`task_id`,`path_taken`,`successful`,`direct_path_taken`);