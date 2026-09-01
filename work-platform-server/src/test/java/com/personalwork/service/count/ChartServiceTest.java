package com.personalwork.service.count;

import com.personalwork.constants.CountType;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.domain.dto.MonthProjectCountDto;
import com.personalwork.domain.dto.MonthRecordDto;
import com.personalwork.domain.dto.WorkTimeProportionDto;
import com.personalwork.domain.entity.ProjectDo;
import com.personalwork.domain.entity.TypeDo;
import com.personalwork.domain.query.TimeCountChartParam;
import com.personalwork.service.MonthRecordService;
import com.personalwork.service.count.manage.MonthRecordManager;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * <p>ChartService 的单元测试。</p>
 */
class ChartServiceTest {

    /**
     * <p>验证首次统计项目或类型时只累计一次分钟数。</p>
     */
    @Test
    void workTimeProportionCountShouldNotDoubleCountFirstRecord() {
        ProjectDo firstProject = buildProject(1, 10);
        ProjectDo secondProject = buildProject(2, 10);
        MonthRecordDto monthRecord = buildMonthRecord(30, 60);
        TimeCountChartParam param = new TimeCountChartParam();
        param.setCountType(CountType.TYPE);
        ChartService chartService = new ChartService(new InMemoryProjectMapper(Map.of(
                firstProject.getId(), firstProject,
                secondProject.getId(), secondProject)), new FixedMonthRecordManager(List.of(monthRecord)));

        List<WorkTimeProportionDto> result = chartService.workTimeProportionCount(param);

        assertEquals(1, result.size());
        assertEquals(90, result.get(0).getMinutes());
    }

    private ProjectDo buildProject(int projectId, int typeId) {
        TypeDo type = new TypeDo();
        type.setId(typeId);
        ProjectDo project = new ProjectDo();
        project.setId(projectId);
        project.setType(type);
        return project;
    }

    private MonthRecordDto buildMonthRecord(int firstMinutes, int secondMinutes) {
        MonthProjectCountDto firstCount = new MonthProjectCountDto();
        firstCount.setProjectId(1);
        firstCount.setMinute(firstMinutes);
        MonthProjectCountDto secondCount = new MonthProjectCountDto();
        secondCount.setProjectId(2);
        secondCount.setMinute(secondMinutes);
        MonthRecordDto monthRecord = new MonthRecordDto();
        monthRecord.setProjectCountList(List.of(firstCount, secondCount));
        return monthRecord;
    }

    /**
     * <p>提供固定的月份统计记录，避免该单元测试依赖数据库。</p>
     */
    private static class FixedMonthRecordManager extends MonthRecordManager {
        private final List<MonthRecordDto> monthRecords;

        private FixedMonthRecordManager(List<MonthRecordDto> monthRecords) {
            super((MonthRecordService) null);
            this.monthRecords = monthRecords;
        }

        @Override
        public List<MonthRecordDto> getMonthRecordList(TimeCountChartParam param) {
            return monthRecords;
        }
    }

    /**
     * <p>提供内存项目数据，避免该单元测试依赖 MyBatis。</p>
     */
    private static class InMemoryProjectMapper implements ProjectMapper {
        private final Map<Integer, ProjectDo> projects;

        private InMemoryProjectMapper(Map<Integer, ProjectDo> projects) {
            this.projects = projects;
        }

        @Override
        public ProjectDo getProject(int id) {
            return projects.get(id);
        }

        @Override
        public List<ProjectDo> listByUser(int userId) {
            return List.of();
        }

        @Override
        public ProjectDo getProjectByName(String name, Integer userId) {
            return null;
        }

        @Override
        public boolean addProject(ProjectDo project) {
            return false;
        }

        @Override
        public boolean updateProject(ProjectDo project) {
            return false;
        }

        @Override
        public boolean deleteProject(int id) {
            return false;
        }
    }
}
