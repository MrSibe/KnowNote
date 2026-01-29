CREATE TABLE `anki_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`notebook_id` text NOT NULL,
	`title` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`cards_data` text NOT NULL,
	`chunk_mapping` text NOT NULL,
	`metadata` text,
	`status` text DEFAULT 'generating' NOT NULL,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_ankicards_notebook` ON `anki_cards` (`notebook_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_ankicards_version` ON `anki_cards` (`notebook_id`,`version`);