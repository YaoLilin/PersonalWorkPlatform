package com.personalwork.controller;

import com.personalwork.constants.ProblemLevel;
import com.personalwork.modal.query.ProblemQr;
import com.personalwork.modal.query.TypeQr;
import jakarta.validation.constraints.NotNull;
import lombok.extern.log4j.Log4j2;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/2/15
 */
@RestController
@Log4j2
public class ApiTestController {

    @RequestMapping("/test")
    public String test() {
        log.info("信息 testObjParam2");
        log.debug("testObjParam2");
        log.error("错误 testObjParam2");
        return "hello3";
    }

    @GetMapping("/testSimpleParam")
    public boolean testSimpleParam(@NotNull String name) {
        return true;
    }

    @GetMapping("/testObjParam")
    public boolean testObjParam1(@Validated TypeQr typeQr) {
        return true;
    }

    @PostMapping("/testObjParam")
    public ProblemQr testObjParam2(@Validated @RequestBody ProblemQr problemQr) {
        log.info("testObjParam2");
        log.debug("testObjParam2");
        log.error("testObjParam2");
        log.info(problemQr);

        return problemQr;
    }

    @GetMapping("/testEnum")
    public String  testEnumGet(@RequestParam @NotNull ProblemLevel level) {
        log.info(Enum.valueOf(ProblemLevel.class,level.name()));
        return level == null ? "无值" : level.toString();
    }

}
