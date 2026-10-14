package com.personalwork.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalwork.controller.handle.ControllerExceptionHandler;
import com.personalwork.domain.query.ScheduleEventParam;
import com.personalwork.service.ChecklistService;
import com.personalwork.service.ScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * <p>验证真实接口在调用 Service 前，通过 Validation 拒绝非法请求参数。</p>
 *
 * @author 姚礼林
 * @date 2026/10/14
 */
class ApiParameterValidationTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private ScheduleService scheduleService;
    private ChecklistService checklistService;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        scheduleService = mock(ScheduleService.class);
        checklistService = mock(ChecklistService.class);
        mvc = MockMvcBuilders.standaloneSetup(new ScheduleController(scheduleService),
                        new ChecklistController(checklistService))
                .setControllerAdvice(new ControllerExceptionHandler()).build();
    }

    @Test
    void invalidDateAndTimeAreRejectedBeforeService() throws Exception {
        ScheduleEventParam param = validSchedule();
        param.setStartTime("invalid");
        expectInvalid(post("/schedule"), param, "日程日期或时间格式错误");
        param.setStartTime("09:00");
        param.setDate("2026-02-30");
        expectInvalid(put("/schedule/7"), param, "日程日期或时间格式错误");
        verifyNoInteractions(scheduleService);
    }

    @Test
    void endMustBeLaterThanStartOnCreateAndUpdate() throws Exception {
        ScheduleEventParam param = validSchedule();
        param.setEndTime("08:00");
        expectInvalid(post("/schedule"), param, "结束时间必须晚于开始时间");
        param.setEndTime("09:00");
        expectInvalid(put("/schedule/7"), param, "结束时间必须晚于开始时间");
        verifyNoInteractions(scheduleService);
    }

    @Test
    void createRequiresChecklistButLegacyUpdateDoesNot() throws Exception {
        ScheduleEventParam param = validSchedule();
        param.setCreateChecklist(false);
        param.setProjectId(2);
        expectInvalid(post("/schedule"), param, "日程必须关联已有清单或创建清单");
        verifyNoInteractions(scheduleService);

        mvc.perform(put("/schedule/7").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(param)))
                .andExpect(status().isOk());
        verify(scheduleService).updateSchedule(eq(7), any(ScheduleEventParam.class));
    }

    @Test
    void defaultConstraintsStillApplyWithCreateGroup() throws Exception {
        ScheduleEventParam param = validSchedule();
        param.setScheduleName(" ");
        expectInvalid(post("/schedule"), param, "日程名称不能为空");
        param.setScheduleName("日程");
        param.setStartTime(null);
        expectInvalid(post("/schedule"), param, "开始时间不能为空");
        verifyNoInteractions(scheduleService);
    }

    @Test
    void validCrossDayAndShortHourRequestsReachService() throws Exception {
        ScheduleEventParam param = validSchedule();
        param.setStartTime("9:00");
        param.setEndDate("2026-10-15");
        param.setEndTime("01:00");
        mvc.perform(post("/schedule").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(param)))
                .andExpect(status().isOk());
        verify(scheduleService).createSchedule(any(ScheduleEventParam.class));
    }

    @Test
    void invalidChecklistStatesAreRejectedBeforeService() throws Exception {
        for (String body : new String[]{"{}", "{\"isDone\":-1}", "{\"isDone\":2}"}) {
            mvc.perform(put("/checklists/10/state").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest());
        }
        verifyNoInteractions(checklistService);
    }

    @Test
    void validChecklistStateReachesService() throws Exception {
        mvc.perform(put("/checklists/10/state").contentType(MediaType.APPLICATION_JSON).content("{\"isDone\":1}"))
                .andExpect(status().isOk());
        verify(checklistService).updateState(10, 1);
    }

    private void expectInvalid(MockHttpServletRequestBuilder request, ScheduleEventParam param,
                               String message) throws Exception {
        mvc.perform(request.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(param)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString(message)));
    }

    private ScheduleEventParam validSchedule() {
        ScheduleEventParam param = new ScheduleEventParam();
        param.setScheduleName("日程");
        param.setCreateChecklist(true);
        param.setDate("2026-10-14");
        param.setEndDate("2026-10-14");
        param.setStartTime("09:00");
        param.setEndTime("10:00");
        return param;
    }
}
