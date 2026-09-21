CREATE TABLE `checklist_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `parentid` int(11) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL COMMENT '类型显示颜色，HEX格式',
  `gmt_create` datetime DEFAULT CURRENT_TIMESTAMP,
  `gmt_modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `checklist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `is_done` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0:未完成 1:已完成',
  `checklist_type_id` int(11) DEFAULT NULL COMMENT '所属清单类型id，为空时归入收集箱类型',
  `gmt_create` datetime DEFAULT CURRENT_TIMESTAMP,
  `gmt_modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `checklist_type_id` (`checklist_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `project_time`
  ADD COLUMN `checklist_id` int(11) DEFAULT NULL COMMENT '关联清单id' AFTER `week_id`,
  ADD KEY `checklist_id` (`checklist_id`);

ALTER TABLE `checklist`
  MODIFY COLUMN `checklist_type_id` int(11) DEFAULT NULL COMMENT '所属清单类型id，为空时归入收集箱类型';
