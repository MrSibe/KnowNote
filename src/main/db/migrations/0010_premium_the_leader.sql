DROP INDEX `idx_items_notebook_order`;--> statement-breakpoint
CREATE INDEX `idx_items_notebook_order` ON `items` (`notebook_id`,`order`);--> statement-breakpoint
ALTER TABLE `items` DROP COLUMN `is_pinned`;