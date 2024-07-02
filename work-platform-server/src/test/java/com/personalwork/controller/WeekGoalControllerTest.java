package com.personalwork.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.personalwork.modal.dto.WeekGoalDto;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.service.impl.WeekGoalServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/2
 */
@WebMvcTest(WeekGoalController.class)
class WeekGoalControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private WeekGoalServiceImpl weekGoalService;

    @Test
    void batchDelete() {
    }

    @Test
    void changeState() throws Exception {
        when(weekGoalService.changeState(anyInt(), anyInt())).thenReturn(true);
        mockMvc.perform(MockMvcRequestBuilders.put("/api/week-goals/{id}/change-state", 1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\": 1, \"state\": 2}"))
                .andExpect(status().isOk());

        verify(weekGoalService).changeState(1, 2);
    }

    @Test
    void getWeekGoals() throws Exception {
        ProjectDo projectDo = new ProjectDo();
        projectDo.setName("test");
        projectDo.setId(1);
        WeekGoalDto weekGoalDto  = new WeekGoalDto();
        weekGoalDto.setWeekNumber(1);
        weekGoalDto.setYear(2024);
        weekGoalDto.setIsDone(0);
        weekGoalDto.setId(1);
        weekGoalDto.setProject(projectDo);
        WeekGoalDto weekGoalDto2  = new WeekGoalDto();
        weekGoalDto2.setWeekNumber(1);
        weekGoalDto2.setYear(2024);
        weekGoalDto2.setIsDone(0);
        weekGoalDto2.setId(2);
        weekGoalDto2.setProject(projectDo);
        when(weekGoalService.getGoals(any())).thenReturn(Stream.of(weekGoalDto,weekGoalDto2).toList());
        mockMvc.perform(MockMvcRequestBuilders.get("/api/week-goals"))
                .andExpect(result -> {
                    JSONArray json = JSONArray.parseArray(result.getResponse().getContentAsString());
                    JSONObject item = json.getJSONObject(0);
                    assertEquals(1, item.getInteger("weekNumber"));
                    assertEquals(2,item.getJSONArray("goals").size());
                });
    }

    @Test
    void insertGoal() {
    }
}