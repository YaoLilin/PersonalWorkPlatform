ALTER TABLE `type`
    ADD COLUMN `color` varchar(7) DEFAULT NULL COMMENT '类型显示颜色，HEX格式' AFTER `parentid`;

ALTER TABLE `project`
    MODIFY COLUMN `color` varchar(7) DEFAULT NULL COMMENT '项目显示颜色，HEX格式；为空时使用所属类型颜色';

UPDATE `project`
SET `color` = NULL
WHERE `color` = '#1677FF';
