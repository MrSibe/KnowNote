CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`notebook_id` text NOT NULL,
	`type` text NOT NULL,
	`resource_id` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`is_pinned` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_items_notebook_order` ON `items` (`notebook_id`,`is_pinned`,`order`);--> statement-breakpoint
CREATE INDEX `idx_items_type` ON `items` (`type`);--> statement-breakpoint
CREATE INDEX `idx_items_resource` ON `items` (`type`,`resource_id`);--> statement-breakpoint
-- 数据迁移：将现有的 notes 迁移到 items 表
INSERT INTO `items` (`id`, `notebook_id`, `type`, `resource_id`, `order`, `is_pinned`, `created_at`, `updated_at`)
SELECT
  'item-note-' || `id` as id,
  `notebook_id`,
  'note' as type,
  `id` as resource_id,
  0 as `order`,
  0 as is_pinned,
  `created_at`,
  `updated_at`
FROM `notes`;
--> statement-breakpoint
-- 数据迁移：将现有的 mindMaps 迁移到 items 表
INSERT INTO `items` (`id`, `notebook_id`, `type`, `resource_id`, `order`, `is_pinned`, `created_at`, `updated_at`)
SELECT
  'item-mindmap-' || `id` as id,
  `notebook_id`,
  'mindmap' as type,
  `id` as resource_id,
  0 as `order`,
  0 as is_pinned,
  `created_at`,
  `updated_at`
FROM `mind_maps`;