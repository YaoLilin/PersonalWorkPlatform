package com.personalwork.dao;

import com.personalwork.domain.vo.ScheduleEventVo;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.io.Resources;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * 验证分批读取的日程与清单信息能正确合并。
 */
class ProjectTimeMapperTest {

    @Test
    void mergesChecklistDetailsWithoutChangingScheduleOrder() {
        ProjectTimeMapper mapper = mock(ProjectTimeMapper.class, CALLS_REAL_METHODS);
        ScheduleEventVo first = new ScheduleEventVo();
        first.setId(1);
        first.setChecklistId(7);
        ScheduleEventVo second = new ScheduleEventVo();
        second.setId(2);
        second.setChecklistId(7);
        ScheduleEventVo detail = new ScheduleEventVo();
        detail.setChecklistId(7);
        detail.setChecklistName("清单 A");
        detail.setChecklistProjectId(3);
        detail.setChecklistProjectName("项目 B");
        detail.setChecklistTypeColor("#123456");
        detail.setChecklistIsDone(1);
        doReturn(List.of(first, second)).when(mapper).listScheduleBaseByUser(1);
        doReturn(List.of(detail)).when(mapper).listChecklistDetailsByIds(List.of(7));

        List<ScheduleEventVo> result = mapper.listScheduleByUser(1);

        assertEquals(List.of(first, second), result);
        assertEquals("清单 A", result.get(0).getChecklistName());
        assertEquals("项目 B", result.get(1).getChecklistProjectName());
        assertEquals("#123456", result.get(0).getChecklistTypeColor());
        assertEquals(1, result.get(1).getChecklistIsDone());
        verify(mapper).listChecklistDetailsByIds(List.of(7));
    }

    @Test
    void skipsChecklistQueryWhenSchedulesHaveNoChecklist() {
        ProjectTimeMapper mapper = mock(ProjectTimeMapper.class, CALLS_REAL_METHODS);
        ScheduleEventVo event = new ScheduleEventVo();
        event.setId(1);
        doReturn(List.of(event)).when(mapper).listScheduleBaseByUser(1);

        List<ScheduleEventVo> result = mapper.listScheduleByUser(1);

        assertEquals(1, result.size());
        assertNull(result.get(0).getChecklistId());
        verify(mapper, never()).listChecklistDetailsByIds(org.mockito.ArgumentMatchers.anyList());
    }

    @Test
    void limitsChecklistLookupToOneThousandIdsPerQuery() {
        ProjectTimeMapper mapper = mock(ProjectTimeMapper.class, CALLS_REAL_METHODS);
        List<ScheduleEventVo> events = new ArrayList<>(1001);
        for (int id = 1; id <= 1001; id++) {
            ScheduleEventVo event = new ScheduleEventVo();
            event.setChecklistId(id);
            events.add(event);
        }
        doReturn(events).when(mapper).listScheduleBaseByUser(1);
        List<Integer> firstBatch = events.subList(0, 1000).stream()
                .map(ScheduleEventVo::getChecklistId).toList();
        doReturn(List.of()).when(mapper).listChecklistDetailsByIds(firstBatch);
        doReturn(List.of()).when(mapper).listChecklistDetailsByIds(List.of(1001));

        assertEquals(1001, mapper.listScheduleByUser(1).size());
        verify(mapper).listChecklistDetailsByIds(firstBatch);
        verify(mapper).listChecklistDetailsByIds(List.of(1001));
    }

    @Test
    void bindsChecklistIdsInSplitMapperQuery() throws Exception {
        Configuration configuration = new Configuration();
        String resource = "mapper/ProjectTimeMapper.xml";
        try (InputStream input = Resources.getResourceAsStream(resource)) {
            new XMLMapperBuilder(input, configuration, resource, configuration.getSqlFragments()).parse();
        }

        BoundSql boundSql = configuration.getMappedStatement(
                "com.personalwork.dao.ProjectTimeMapper.listChecklistDetailsByIds")
                .getBoundSql(Map.of("checklistIds", List.of(7, 8)));

        assertTrue(boundSql.getSql().contains("cl.id in"));
        assertEquals(2, boundSql.getParameterMappings().size());
    }
}
