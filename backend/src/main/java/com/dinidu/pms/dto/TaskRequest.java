package com.dinidu.pms.dto;



import com.dinidu.pms.entity.Task;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class TaskRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private Task.Status status;
    private Task.Priority priority;
    private LocalDate dueDate;
    private Long projectId;
    private Long assigneeId;
    private Set<String> tags;
}
