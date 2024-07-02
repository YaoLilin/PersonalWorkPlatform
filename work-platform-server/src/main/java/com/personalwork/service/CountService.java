package com.personalwork.service;

import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.dao.RecordWeekMapper;
import com.personalwork.modal.entity.RecordWeekDo;
import com.personalwork.modal.entity.ProjectTimeDo;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/6/18
 */
@Service
public class CountService {

    private ProjectTimeMapper projectTimeMapper;
    private RecordWeekMapper recordWeekMapper;

    public void setProjectTimeMapper(ProjectTimeMapper projectTimeMapper) {
        this.projectTimeMapper = projectTimeMapper;
    }

    public void setWorkWeekMapper(RecordWeekMapper recordWeekMapper) {
        this.recordWeekMapper = recordWeekMapper;
    }

    public boolean insertProjectTime(ProjectTimeDo projectTimeDo) {
        return projectTimeMapper.insert(projectTimeDo);
    }

    public boolean updateProjectTime(ProjectTimeDo projectTimeDo) {
        return projectTimeMapper.update(projectTimeDo);
    }

    public List<ProjectTimeDo> getProjectTimeByDate(int projectId, String date) {
        return projectTimeMapper.getProjectTimeByDate(projectId,date);
    }

    public RecordWeekDo getWorkWeek(String  id) {
        return recordWeekMapper.getWorkWeekByDate(id);
    }

    public List<RecordWeekDo> getWorkWeekByYear(int year) {
        return recordWeekMapper.getWorkWeekByYear(year);
    }

    public boolean addWorkWeek(RecordWeekDo recordWeekDo) {
        return recordWeekMapper.addWorkWeek(recordWeekDo);
    }

    public boolean deleteWorkWeek(Integer  id) {
        return recordWeekMapper.deleteWorkWeek(id);
    }

    public boolean updateWorkWeek(RecordWeekDo recordWeekDo) {
        return recordWeekMapper.updateWorkWeek(recordWeekDo);
    }
}
