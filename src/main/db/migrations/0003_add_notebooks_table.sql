-- 创建 notebooks 表
CREATE TABLE `notebooks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
-- 创建索引
CREATE INDEX `idx_notebooks_updated` ON `notebooks` (`updated_at`);
--> statement-breakpoint
-- 为现有的 chat_sessions 创建对应的 notebooks
-- 基于现有的 notebook_id 创建笔记本记录
INSERT INTO `notebooks` (`id`, `title`, `description`, `created_at`, `updated_at`)
SELECT DISTINCT
	cs.notebook_id as id,
	'笔记本 ' || substr(cs.notebook_id, -6) as title,
	NULL as description,
	MIN(cs.created_at) as created_at,
	MAX(cs.updated_at) as updated_at
FROM chat_sessions cs
GROUP BY cs.notebook_id;