ALTER TABLE project
    ADD COLUMN `color` varchar(7) NOT NULL DEFAULT '#1677FF' COMMENT '项目显示颜色，HEX格式' AFTER `important`;
