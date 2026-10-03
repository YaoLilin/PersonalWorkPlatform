-- 日程可以不关联项目；现有收集箱项目及其历史日程保持不变。
ALTER TABLE `project_time` MODIFY COLUMN `project_id` int(11) DEFAULT NULL;
