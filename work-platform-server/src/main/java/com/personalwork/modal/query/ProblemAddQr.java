package com.personalwork.modal.query;

import com.personalwork.annotaton.ValidDate;
import com.personalwork.enu.ProblemLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/8
 */
@Data
public class ProblemAddQr {
    @ValidDate
    private String weekDate;
    private ProblemLevel level;
    private String resolve;
    @NotNull
    @NotBlank
    private String title;
}

