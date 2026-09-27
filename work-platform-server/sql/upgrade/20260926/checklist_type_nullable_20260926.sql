-- 收集箱清单以空的清单类型编号表示；修复旧数据库中该字段仍为 NOT NULL 的情况。
ALTER TABLE `checklist`
  MODIFY COLUMN `checklist_type_id` int(11) DEFAULT NULL COMMENT '所属清单类型id，为空时归入收集箱类型';
