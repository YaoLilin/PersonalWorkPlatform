ALTER TABLE project_time
    ADD COLUMN end_date DATE NULL AFTER date,
    ADD COLUMN schedule_name VARCHAR(255) NULL AFTER end_time,
    ADD COLUMN description VARCHAR(1000) NULL AFTER schedule_name;

ALTER TABLE record_week
    MODIFY COLUMN time INT(11) NOT NULL DEFAULT 0 COMMENT '利用时间，单位：分',
    MODIFY COLUMN mark TINYINT(4) NULL COMMENT '1:不合格 2:合格 3:优秀';
