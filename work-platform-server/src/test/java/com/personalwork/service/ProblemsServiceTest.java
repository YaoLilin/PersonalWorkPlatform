package com.personalwork.service;

import com.personalwork.dao.ProblemMapper;
import com.personalwork.exception.ProblemAddException;
import com.personalwork.modal.entity.ProblemDo;
import com.personalwork.modal.query.ProblemAddQr;
import com.personalwork.modal.query.ProblemQr;
import com.personalwork.modal.vo.ProblemInFormVo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProblemsServiceTest {

    @Mock
    private ProblemMapper problemMapper;

    @InjectMocks
    private ProblemsService problemsService;

    private ProblemQr problemQr;
    private ProblemAddQr problemAddQr;
    private List<ProblemDo> problemList;
    private ProblemDo problemDo;

    @BeforeEach
    void setUp() {
        problemQr = new ProblemQr();
        problemAddQr = new ProblemAddQr();
        problemList = Collections.emptyList();
        problemDo = new ProblemDo();
    }

    @Test
    void getProblemsShouldReturnEmptyListWhenNoProblems() {
        when(problemMapper.getProblems(any(ProblemQr.class))).thenReturn(problemList);
        List<ProblemDo> result = problemsService.getProblems(problemQr);
        assertTrue(result.isEmpty());
    }

    @Test
    void getProblemsShouldReturnNonEmptyListWhenProblemsExist() {
        problemList = Arrays.asList(new ProblemDo(), new ProblemDo());
        when(problemMapper.getProblems(any(ProblemQr.class))).thenReturn(problemList);
        List<ProblemDo> result = problemsService.getProblems(problemQr);
        assertEquals(2, result.size());
    }

    @Test
    void addShouldThrowProblemAddExceptionWhenProblemExists() {
        problemAddQr.setTitle("Existing Problem");
        when(problemMapper.getOpenProblemByName(anyString())).thenReturn(problemDo);
        assertThrows(ProblemAddException.class, () -> problemsService.add(problemAddQr));
    }

    @Test
    void addShouldReturnProblemInFormVoWhenProblemAddedSuccessfully() {
        problemAddQr.setTitle("New Problem");
        when(problemMapper.getOpenProblemByName(anyString())).thenReturn(null).thenReturn(problemDo);
        when(problemMapper.add(any(ProblemDo.class))).thenReturn(true);
        ProblemInFormVo result = problemsService.add(problemAddQr);
        assertNotNull(result);
    }

    @Test
    void updateShouldThrowProblemAddExceptionWhenSameProblemExists() {
        problemAddQr.setTitle("Existing Problem");
        problemDo.setId(1);
        when(problemMapper.getOpenProblemByName(anyString())).thenReturn(problemDo);
        assertThrows(ProblemAddException.class, () -> problemsService.update(problemAddQr, 2));
    }

    @Test
    void updateShouldReturnTrueWhenProblemUpdatedSuccessfully() {
        problemAddQr.setTitle("Update Problem");
        when(problemMapper.getOpenProblemByName(anyString())).thenReturn(null);
        when(problemMapper.update(any(ProblemDo.class))).thenReturn(true);
        boolean result = problemsService.update(problemAddQr, 1);
        assertTrue(result);
    }

    @Test
    void deleteShouldReturnTrueWhenProblemsDeletedSuccessfully() {
        when(problemMapper.delete(anyInt())).thenReturn(true);
        boolean result = problemsService.delete(Arrays.asList(1, 2, 3));
        assertTrue(result);
    }

    @Test
    void isExistsShouldReturnFalseWhenProblemDoesNotExist() {
        when(problemMapper.getOpenProblemByName(anyString())).thenReturn(null);
        boolean result = problemsService.isExists("NonExisting Problem");
        assertFalse(result);
    }

    @Test
    void isExistsShouldReturnTrueWhenProblemExists() {
        when(problemMapper.getOpenProblemByName(anyString())).thenReturn(problemDo);
        boolean result = problemsService.isExists("Existing Problem");
        assertTrue(result);
    }

    @Test
    void doneShouldReturnTrueWhenProblemMarkedAsDone() {
        when(problemMapper.done(anyInt())).thenReturn(true);
        boolean result = problemsService.done(1);
        assertTrue(result);
    }

    @Test
    void callbackShouldReturnTrueWhenProblemCallbacksSuccessfully() {
        when(problemMapper.callback(anyInt())).thenReturn(true);
        boolean result = problemsService.callback(1);
        assertTrue(result);
    }
}
