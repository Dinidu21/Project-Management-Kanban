package com.dinidu.pms.controller;

import com.dinidu.pms.dto.TaskRequest;
import com.dinidu.pms.entity.*;
import com.dinidu.pms.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        try {
            Task task = taskService.getTaskById(id);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest request) {
        try {
            Task task = taskService.createTask(request);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        try {
            Task task = taskService.updateTask(id, request);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats/{status}")
    public ResponseEntity<Long> getTaskCountByStatus(@PathVariable Task.Status status) {
        Long count = taskService.getTaskCountByStatus(status);
        return ResponseEntity.ok(count);
    }
}