CREATE TABLE `mind_maps` (
	`id` text PRIMARY KEY NOT NULL,
	`notebook_id` text NOT NULL,
	`title` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`tree_data` text NOT NULL,
	`chunk_mapping` text NOT NULL,
	`metadata` text,
	`status` text DEFAULT 'generating' NOT NULL,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_mindmaps_notebook` ON `mind_maps` (`notebook_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_mindmaps_version` ON `mind_maps` (`notebook_id`,`version`);