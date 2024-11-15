package com.personalwork.modal.query;

import com.personalwork.validation.constraints.ValidDate;
import com.personalwork.constants.ProblemLevel;
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
    @NotNull
    private String weekDate;
    private ProblemLevel level;
    private String resolve;
    @NotNull
    @NotBlank
    private String title;
}

