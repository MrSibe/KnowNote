CREATE TABLE `quiz_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`notebook_id` text NOT NULL,
	`answers` text,
	`score` integer,
	`total_questions` integer NOT NULL,
	`correct_count` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_quiz_sessions_quiz` ON `quiz_sessions` (`quiz_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_quiz_sessions_notebook` ON `quiz_sessions` (`notebook_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`notebook_id` text NOT NULL,
	`title` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`questions_data` text NOT NULL,
	`chunk_mapping` text NOT NULL,
	`metadata` text,
	`status` text DEFAULT 'generating' NOT NULL,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_quizzes_notebook` ON `quizzes` (`notebook_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_quizzes_version` ON `quizzes` (`notebook_id`,`version`);