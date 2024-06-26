package com.personalwork.controller;

import com.personalwork.modal.entity.ProblemDo;
import com.personalwork.modal.query.ProblemAddQr;
import com.personalwork.modal.query.ProblemQr;
import com.personalwork.service.ProblemsService;
import com.personalwork.modal.vo.ProblemInFormVo;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/1/11
 */

@RestController
@RequestMapping("/problems")
public class ProblemController {

    private final ProblemsService problemsService;
    @Autowired
    public ProblemController(ProblemsService problemsService){
        this.problemsService = problemsService;
    }

    @GetMapping("/other-problems")
    public List<ProblemInFormVo> getProblemsExceptThisWeek(@RequestParam @NotNull Integer weekId){
        List<ProblemDo> doList = problemsService.getProblemsExceptThisWeek(weekId);
        if (doList == null || doList.isEmpty()) {
            return new ArrayList<>();
        }
        return doList.stream().map(i -> {
            ProblemInFormVo vo = new ProblemInFormVo();
            BeanUtils.copyProperties(i,vo);
            return vo;
        }).toList();
    }

    @GetMapping
    public List<ProblemDo> list(ProblemQr problemQr){
        return problemsService.getProblems(problemQr);
    }

    @GetMapping("/is-exist")
    public boolean isExist(@RequestParam @NotNull String title) {
        return problemsService.isExists(title);
    }

    @PostMapping
    public ProblemInFormVo addProblem(@RequestBody @Validated ProblemAddQr problemAddQr) {
        return problemsService.add(problemAddQr);
    }

    @PutMapping("/{id}")
    public  boolean updateProblem(@RequestBody @Validated ProblemAddQr problemAddQr,@PathVariable Integer id){
        return problemsService.update(problemAddQr, id);
    }


    @DeleteMapping("/{ids}")
    public boolean delete(@PathVariable String  ids){
        List<Integer> idList = Arrays.stream(ids.split(",")).map(Integer::parseInt).collect(Collectors.toList());
        return problemsService.delete(idList);
    }

    @PutMapping("/{id}/done")
    public boolean done(@PathVariable int  id){
        return problemsService.done(id);
    }

    @PutMapping("/{id}/callback")
    public boolean callback(@PathVariable Integer  id){
        return problemsService.callback(id);
    }

}
