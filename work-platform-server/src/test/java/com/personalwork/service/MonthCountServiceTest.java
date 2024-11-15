package com.personalwork.service;

import com.personalwork.base.TestSetUp;
import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.dao.RecordMonthMapper;
import com.personalwork.exception.MethodParamInvalidException;
import com.personalwork.modal.entity.*;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.UserUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.ArrayList;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;


class MonthCountServiceTest extends TestSetUp {
    @InjectMocks
    private MonthCountService monthCountService;

    @Mock
    private MonthProjectCountMapper monthProjectCountMapper;

    @Mock
    private ProjectTimeMapper projectTimeMapper;

    @Mock
    private RecordMonthMapper recordMonthMapper;

    @BeforeEach
    public void setUp() {
        UserDo userDo = new UserDo();
        userDo.setId(1);
        UserDetail userDetail = new UserDetail("admin","admin","123@163.com","123",1);
        when(UserUtil.getLoginUser()).thenReturn(userDetail);
    }

    /**
     * Method under test: {@link MonthCountService#countMonthProjectTime(int, int)}
     */
    @Test
    void testCountMonthProjectTime() {
        assertThrows(MethodParamInvalidException.class, () -> monthCountService.countMonthProjectTime(3, 3));
        assertThrows(MethodParamInvalidException.class, () -> monthCountService.countMonthProjectTime(-1, 3));
    }

    /**
     * Method under test: {@link MonthCountService#reCountAll()}
     */
    @DisplayName("测试重新统计所有月份，没有任务数据，将不会进行统计")
    @Test
    void testReCountAll() {
        when(projectTimeMapper.list(anyInt())).thenReturn(new ArrayList<>());
        monthCountService.reCountAll();
        verify(projectTimeMapper).list(anyInt());
    }

    /**
     * Method under test: {@link MonthCountService#reCountAll()}
     */
    @Test
    @DisplayName("测试重新统计所有月份，有1个任务数据，将会插入1条月份数据，以及插入1条任务月份统计数据")
    void testReCountAll2() {
        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        typeDo.setName("yyyy-MM-dd");
        typeDo.setParentId(1);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setId(1);
        projectDo.setName("java");

        ProjectTimeDo projectTimeDo = buildProjectTimeDo(projectDo, "2020-03-01", "08:00", "09:00", "java");

        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setYear(2020);
        recordMonthDo.setMonth(3);
        recordMonthDo.setWorkTime(60);
        recordMonthDo.setId(1);

        ArrayList<ProjectTimeDo> projectTimeDoList = new ArrayList<>();
        projectTimeDoList.add(projectTimeDo);
        when(projectTimeMapper.list(anyInt())).thenReturn(projectTimeDoList);
        when(recordMonthMapper.getByDate(anyInt(),anyInt(),anyInt())).thenReturn(null)
                .thenReturn(recordMonthDo);
        monthCountService.reCountAll();
        verify(projectTimeMapper).list(anyInt());
        verify(recordMonthMapper, times(1)).insert(argThat(arg -> arg.getMonth() == 3
                && arg.getYear() == 2020 && arg.getWorkTime().equals(60)));
        verify(monthProjectCountMapper, times(1)).insert(argThat( arg ->
                arg.getMinute().equals(60)));
    }

    private  ProjectTimeDo buildProjectTimeDo(ProjectDo projectDo,String date,String startTime,String endTime,
                                              String projectName) {
        ProjectTimeDo projectTimeDo = new ProjectTimeDo();
        projectTimeDo.setDate(date);
        projectTimeDo.setEndTime(endTime);
        projectTimeDo.setId(1);
        projectTimeDo.setProject(projectDo);
        projectTimeDo.setProjectName(projectName);
        projectTimeDo.setStartTime(startTime);
        return projectTimeDo;
    }

    /**
     * Method under test: {@link MonthCountService#reCountAll()}
     */
    @Test
    @DisplayName("测试重新统计所有月份，有2个同项目的任务数据，将会插入1条月份数据，以及插入1条任务月份统计数据")
    void testReCountAll3() {
        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        typeDo.setName("yyyy-MM-dd");
        typeDo.setParentId(1);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setId(1);
        projectDo.setName("java");

        ProjectTimeDo projectTimeDo = buildProjectTimeDo(projectDo, "2020-03-01", "08:00", "09:00", "java");
        ProjectTimeDo projectTimeDo2 = buildProjectTimeDo(projectDo, "2020-03-02", "08:00", "09:00", "java");

        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setYear(2020);
        recordMonthDo.setMonth(3);
        recordMonthDo.setId(1);
        recordMonthDo.setWorkTime(120);

        ArrayList<ProjectTimeDo> projectTimeDoList = new ArrayList<>();
        projectTimeDoList.add(projectTimeDo);
        projectTimeDoList.add(projectTimeDo2);
        when(projectTimeMapper.list(anyInt())).thenReturn(projectTimeDoList);
        when(recordMonthMapper.getByDate(anyInt(),anyInt(),anyInt())).thenReturn(null)
                .thenReturn(recordMonthDo);
        monthCountService.reCountAll();
        verify(projectTimeMapper).list(anyInt());
        verify(recordMonthMapper, times(1)).insert(argThat(arg -> arg.getMonth() == 3
                && arg.getYear() == 2020 && arg.getWorkTime().equals(120)));
        verify(monthProjectCountMapper, times(1)).insert(argThat( arg ->
                arg.getMinute().equals(120)));
    }

    /**
     * Method under test: {@link MonthCountService#reCountAll()}
     */
    @Test
    @DisplayName("测试重新统计所有月份，有2个不同项目的任务数据，将会插入1条月份数据，以及插入2条任务月份统计数据")
    void testReCountAll4() {
        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        typeDo.setName("yyyy-MM-dd");
        typeDo.setParentId(1);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setId(1);
        projectDo.setName("java");
        ProjectDo projectDo2 = new ProjectDo();
        projectDo2.setId(2);
        projectDo2.setName("python");

        ProjectTimeDo projectTimeDo = buildProjectTimeDo(projectDo, "2020-03-01", "08:00", "09:00", "java");
        ProjectTimeDo projectTimeDo2 = buildProjectTimeDo(projectDo2, "2020-03-02", "08:00", "09:00", "python");

        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setYear(2020);
        recordMonthDo.setMonth(3);
        recordMonthDo.setId(1);
        recordMonthDo.setWorkTime(120);

        ArrayList<ProjectTimeDo> projectTimeDoList = new ArrayList<>();
        projectTimeDoList.add(projectTimeDo);
        projectTimeDoList.add(projectTimeDo2);
        when(projectTimeMapper.list(anyInt())).thenReturn(projectTimeDoList);
        when(recordMonthMapper.getByDate(anyInt(),anyInt(),anyInt())).thenReturn(null)
                .thenReturn(recordMonthDo);
        monthCountService.reCountAll();
        verify(projectTimeMapper).list(anyInt());
        verify(recordMonthMapper, times(1)).insert(argThat(arg -> arg.getMonth() == 3
                && arg.getYear() == 2020 && arg.getWorkTime().equals(120)));
        verify(monthProjectCountMapper,times(1)).insert(argThat( arg ->
                arg.getMinute().equals(60) && arg.getProjectId().equals(1)));
        verify(monthProjectCountMapper,times(1)).insert(argThat( arg ->
                arg.getMinute().equals(60) && arg.getProjectId().equals(2)));
    }

    /**
     * Method under test: {@link MonthCountService#reCountAll()}
     */
    @Test
    @DisplayName("测试重新统计所有月份，有1个任务数据，将会插入1条月份数据，以及更新1条任务月份统计数据")
    void testReCountAll5() {
        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        typeDo.setName("yyyy-MM-dd");
        typeDo.setParentId(1);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setId(1);
        projectDo.setName("java");

        ProjectTimeDo projectTimeDo = buildProjectTimeDo(projectDo, "2020-03-01", "08:00", "09:00", "java");

        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setYear(2020);
        recordMonthDo.setMonth(3);
        recordMonthDo.setId(1);
        recordMonthDo.setWorkTime(120);

        MonthProjectCountDo monthProjectCountDo = new MonthProjectCountDo();
        monthProjectCountDo.setMonthId(1);
        monthProjectCountDo.setMinute(20);
        monthProjectCountDo.setProjectId(1);

        ArrayList<ProjectTimeDo> projectTimeDoList = new ArrayList<>();
        projectTimeDoList.add(projectTimeDo);
        when(projectTimeMapper.list(anyInt())).thenReturn(projectTimeDoList);
        when(recordMonthMapper.getByDate(anyInt(),anyInt(),anyInt())).thenReturn(null)
                .thenReturn(recordMonthDo);
        when(monthProjectCountMapper.list(anyInt())).thenReturn(Stream.of(monthProjectCountDo).toList());
        monthCountService.reCountAll();
        verify(projectTimeMapper).list(anyInt());
        verify(recordMonthMapper, times(1)).insert(argThat(arg -> arg.getMonth() == 3
                && arg.getYear() == 2020 && arg.getWorkTime().equals(60)));
        verify(monthProjectCountMapper,times(1)).update(argThat( arg ->
                arg.getMinute().equals(60)));
    }

    /**
     * Method under test: {@link MonthCountService#reCountAll()}
     */
    @Test
    @DisplayName("测试统计指定月份，有1个任务数据，将会插入1条月份数据，以及更新1条任务月份统计数据")
    void testCountMonthProjectTime2() {
        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        typeDo.setName("yyyy-MM-dd");
        typeDo.setParentId(1);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setId(1);
        projectDo.setName("java");

        ProjectTimeDo projectTimeDo = buildProjectTimeDo(projectDo, "2020-03-01", "08:00", "09:00", "java");

        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setYear(2020);
        recordMonthDo.setMonth(3);
        recordMonthDo.setId(1);
        recordMonthDo.setWorkTime(120);

        MonthProjectCountDo monthProjectCountDo = new MonthProjectCountDo();
        monthProjectCountDo.setMonthId(1);
        monthProjectCountDo.setMinute(20);
        monthProjectCountDo.setProjectId(1);

        when(projectTimeMapper.getProjectTimesByRange(eq("2020-03-01"),eq("2020-03-31"),anyInt()))
                .thenReturn(Stream.of(projectTimeDo).toList());
        when(recordMonthMapper.getByDate(anyInt(),anyInt(),anyInt())).thenReturn(null)
                .thenReturn(recordMonthDo);
        when(monthProjectCountMapper.list(anyInt())).thenReturn(Stream.of(monthProjectCountDo).toList());
        monthCountService.countMonthProjectTime(2020,3);
        verify(projectTimeMapper).getProjectTimesByRange(eq("2020-03-01"),eq("2020-03-31"),anyInt());
        verify(recordMonthMapper, times(1)).insert(argThat(arg -> arg.getMonth() == 3
                && arg.getYear() == 2020 && arg.getWorkTime().equals(60)));
        verify(monthProjectCountMapper,times(1)).update(argThat( arg ->
                arg.getMinute().equals(60)));
    }

    /**
     * Method under test: {@link MonthCountService#reCountAll()}
     */
    @Test
    @DisplayName("测试月份参数不对")
    void testCountMonthProjectTime3() {
        MethodParamInvalidException methodParamInvalidException =
                assertThrows(MethodParamInvalidException.class,
                        () -> monthCountService.countMonthProjectTime(2020, 13));
        assertTrue(methodParamInvalidException.getMessage().contains("月份参数错误，月份：13"));
        MethodParamInvalidException methodParamInvalidException2 =
                assertThrows(MethodParamInvalidException.class,
                        () -> monthCountService.countMonthProjectTime(2020, 0));
        assertTrue(methodParamInvalidException2.getMessage().contains("月份参数错误，月份：0"));
    }

    /**
     * Method under test: {@link MonthCountService#reCountAll()}
     */
    @Test
    @DisplayName("测试年份参数不对")
    void testCountMonthProjectTime4() {
        MethodParamInvalidException methodParamInvalidException =
                assertThrows(MethodParamInvalidException.class,
                        () -> monthCountService.countMonthProjectTime(202, 12));
        assertTrue(methodParamInvalidException.getMessage().contains("年份参数错误，年份：202"));
    }


}

