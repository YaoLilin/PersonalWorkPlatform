package com.personalwork.service;

import com.personalwork.dao.ProblemMapper;
import com.personalwork.constants.ProblemLevel;
import com.personalwork.constants.ProblemState;
import com.personalwork.exception.ProblemAddException;
import com.personalwork.modal.entity.ProblemDo;
import com.personalwork.modal.query.ProblemAddQr;
import com.personalwork.modal.query.ProblemQr;
import com.personalwork.modal.vo.ProblemInFormVo;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * @author 姚礼林
 * @desc 问题业务类
 * @date 2024/1/11
 */
@Service
public class ProblemsService {
    private final ProblemMapper problemMapper;

    @Autowired
    public ProblemsService(ProblemMapper problemMapper) {
        this.problemMapper = problemMapper;
    }

    public List<ProblemDo> getProblems(ProblemQr problemQr) {
        UserDetail loginUser = getLoginUser();
        problemQr.setUserId(loginUser.getId());
        return problemMapper.getProblems(problemQr);
    }

    /**
     * 获取除指定周之外的未解决问题
     * @param weekId 周id
     * @return 问题列表
     */
    public List<ProblemDo> getProblemsExceptThisWeek(Integer weekId){
        UserDetail loginUser = getLoginUser();
        return problemMapper.getProblemsExceptThisWeek(weekId,loginUser.getId());
    }

    private static UserDetail getLoginUser() {
        return Objects.requireNonNull(UserUtil.getLoginUser());
    }

    public ProblemDo getProblemById(int id) {
        return problemMapper.getProblemById(id);
    }


    public ProblemInFormVo add(ProblemAddQr problemQr) throws ProblemAddException {
        if (isExists(problemQr.getTitle())){
            throw new ProblemAddException("已有相同问题，不能重复添加");
        }
        UserDetail loginUser = getLoginUser();
        ProblemDo problemDo = new ProblemDo();
        BeanUtils.copyProperties(problemQr, problemDo);
        problemDo.setUserId(loginUser.getId());
        problemDo.setState(ProblemState.UN_RESOLVE);
        if (problemDo.getLevel() == null) {
            problemDo.setLevel(ProblemLevel.NORMAL);
        }
        if (!problemMapper.add(problemDo)){
            throw new ProblemAddException("添加问题出错");
        }
        ProblemDo newProblemDo = problemMapper.getOpenProblemByName(problemQr.getTitle(),getLoginUser().getId());
        ProblemInFormVo vo = new ProblemInFormVo();
        BeanUtils.copyProperties(newProblemDo,vo);
        return vo;
    }

    public boolean update(ProblemAddQr problemAddQr,Integer id) throws ProblemAddException {
        ProblemDo pro = problemMapper.getOpenProblemByName(problemAddQr.getTitle(),getLoginUser().getId());
        if (pro != null && !pro.getId().equals(id)){
            throw new ProblemAddException("已存在相同问题");
        }
        ProblemDo problemDo = new ProblemDo();
        BeanUtils.copyProperties(problemAddQr, problemDo);
        problemDo.setId(id);
        return problemMapper.update(problemDo);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean delete(List<Integer> ids) {
        for (int id : ids) {
            problemMapper.delete(id);
        }
        return true;
    }

    public boolean isExists(String name) {
        ProblemDo problem = problemMapper.getOpenProblemByName(name,getLoginUser().getId());
        return problem != null;
    }

    public boolean done(int id) {
        return problemMapper.done(id);
    }

    public boolean callback(int id) {
        return problemMapper.callback(id);
    }
}
