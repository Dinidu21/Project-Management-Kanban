package com.dinidu.pms.service;


import com.dinidu.pms.dto.ProjectRequest;
import com.dinidu.pms.entity.Project;
import com.dinidu.pms.entity.User;
import com.dinidu.pms.repo.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserService userService;

    public List<Project> getAllProjects() {
        User currentUser = getCurrentUser();
        return projectRepository.findByOwnerOrderByCreatedAtDesc(currentUser);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public Project createProject(ProjectRequest request) {
        User currentUser = getCurrentUser();

        var project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Project.Status.PLANNING)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .owner(currentUser)
                .build();

        return projectRepository.save(project);
    }

    public Project updateProject(Long id, ProjectRequest request) {
        Project project = getProjectById(id);
        User currentUser = getCurrentUser();

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        User currentUser = getCurrentUser();

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        projectRepository.delete(project);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(authentication.getName());
    }
}