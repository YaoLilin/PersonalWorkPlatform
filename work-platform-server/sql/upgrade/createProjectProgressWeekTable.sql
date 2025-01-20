DROP TABLE IF EXISTS `project_progress_week`;
CREATE TABLE `project_progress_week` (
                                         `id` int(11) NOT NULL AUTO_INCREMENT,
                                         `week_id` int(11) NOT NULL,
                                         `user_id` int(11) NOT NULL,
                                         `project_id` int(11) NOT NULL,
                                         `progress` varchar(1000) NOT NULL,
                                         `gmt_create` datetime DEFAULT CURRENT_TIMESTAMP,
                                         `gmt_modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                         PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
