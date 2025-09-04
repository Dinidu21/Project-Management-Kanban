package com.dinidu.pms.dto;



import com.dinidu.pms.entity.Project;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;
    private Project.Status status;
    private LocalDate startDate;
    private LocalDate endDate;
}