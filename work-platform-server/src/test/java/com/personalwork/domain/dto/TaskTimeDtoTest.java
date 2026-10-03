package com.personalwork.domain.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

/** <p>项目与独立清单时间值对象测试。</p> */
class TaskTimeDtoTest {
    @Test
    void distinguishesProjectFromChecklistWithSameIdAndValue() {
        TaskTimeDto project = new TaskTimeDto(7, "健身", 60, false);
        TaskTimeDto checklist = new TaskTimeDto(7, "健身", 60, true);

        assertNotEquals(project, checklist);
        assertEquals(project, new TaskTimeDto(7, "健身", 60, false));
    }
}
