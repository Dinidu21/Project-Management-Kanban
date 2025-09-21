package com.dinidu.pms.controller;


import com.dinidu.pms.dto.ProjectRequest;
import com.dinidu.pms.entity.Project;
import com.dinidu.pms.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        try {
            Project project = projectService.getProjectById(id);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectRequest request) {
        try {
            Project project = projectService.createProject(request);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        try {
            Project project = projectService.updateProject(id, request);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/test-log")
    public ResponseEntity<String> testLog() {
        Logger log = null;
        log.info("INFO test log");
        log.error("ERROR test log", new RuntimeException("simulated"));
        return ResponseEntity.ok("ok");
    }

}