CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`notebook_id` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`source_uri` text,
	`source_note_id` text,
	`content` text,
	`content_hash` text,
	`mime_type` text,
	`file_size` integer,
	`metadata` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`chunk_count` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_documents_notebook` ON `documents` (`notebook_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_documents_status` ON `documents` (`status`);--> statement-breakpoint
CREATE TABLE `chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`notebook_id` text NOT NULL,
	`content` text NOT NULL,
	`chunk_index` integer NOT NULL,
	`start_offset` integer,
	`end_offset` integer,
	`metadata` text,
	`token_count` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_chunks_document` ON `chunks` (`document_id`);--> statement-breakpoint
CREATE INDEX `idx_chunks_notebook` ON `chunks` (`notebook_id`);--> statement-breakpoint
CREATE TABLE `embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`chunk_id` text NOT NULL,
	`notebook_id` text NOT NULL,
	`model` text NOT NULL,
	`dimensions` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chunk_id`) REFERENCES `chunks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_embeddings_chunk` ON `embeddings` (`chunk_id`);--> statement-breakpoint
CREATE INDEX `idx_embeddings_notebook` ON `embeddings` (`notebook_id`);--> statement-breakpoint
CREATE INDEX `idx_embeddings_model` ON `embeddings` (`model`);
