package com.personalwork.domain.vo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 验证重命名后的清单标记保持原有响应字段。
 */
class ChecklistFlagVoTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void preservesIsChecklistJsonPropertyForStatisticsViews() throws Exception {
        MonthProjectTimeVo month = new MonthProjectTimeVo();
        month.setChecklist(true);
        WeekProjectTimeVo week = new WeekProjectTimeVo();
        week.setChecklist(true);
        PieCountVo pie = new PieCountVo();
        pie.setChecklist(true);

        assertChecklistProperty(objectMapper.valueToTree(month));
        assertChecklistProperty(objectMapper.valueToTree(week));
        assertChecklistProperty(objectMapper.valueToTree(pie));
    }

    private void assertChecklistProperty(JsonNode json) {
        assertTrue(json.path("isChecklist").asBoolean());
        assertFalse(json.has("checklist"));
    }
}
