package com.dinidu.pms.service;


import com.dinidu.pms.dto.TaskRequest;
import com.dinidu.pms.entity.Project;
import com.dinidu.pms.entity.Tag;
import com.dinidu.pms.entity.Task;
import com.dinidu.pms.entity.User;
import com.dinidu.pms.repo.ProjectRepository;
import com.dinidu.pms.repo.TaskRepository;
import com.dinidu.pms.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TagService tagService;
    private final UserService userService;

    public List<Task> getAllTasks() {
        User currentUser = getCurrentUser();
        return taskRepository.findTasksByUserOrProjectOwner(currentUser);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public Task createTask(TaskRequest request) {
        User currentUser = getCurrentUser();

        var taskBuilder = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Task.Status.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .dueDate(request.getDueDate());

        // Set project if provided
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            taskBuilder.project(project);
        }

        // Set assignee if provided, otherwise assign to current user
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            taskBuilder.assignee(assignee);
        } else {
            taskBuilder.assignee(currentUser);
        }

        Task task = taskBuilder.build();

        // Handle tags
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : request.getTags()) {
                Tag tag = tagService.findOrCreateTag(tagName);
                tags.add(tag);
            }
            task.setTags(tags);
        }

        return taskRepository.save(task);
    }

    public Task updateTask(Long id, TaskRequest request) {
        Task task = getTaskById(id);
        User currentUser = getCurrentUser();

        // Check if user has permission to update
        if (!task.getAssignee().getId().equals(currentUser.getId()) &&
                (task.getProject() == null || !task.getProject().getOwner().getId().equals(currentUser.getId()))) {
            throw new RuntimeException("Access denied");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        // Update project if provided
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            task.setProject(project);
        }

        // Update assignee if provided
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }

        // Handle tags
        if (request.getTags() != null) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : request.getTags()) {
                Tag tag = tagService.findOrCreateTag(tagName);
                tags.add(tag);
            }
            task.setTags(tags);
        }

        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        User currentUser = getCurrentUser();

        // Check if user has permission to delete
        if (!task.getAssignee().getId().equals(currentUser.getId()) &&
                (task.getProject() == null || !task.getProject().getOwner().getId().equals(currentUser.getId()))) {
            throw new RuntimeException("Access denied");
        }

        taskRepository.delete(task);
    }

    public Long getTaskCountByStatus(Task.Status status) {
        User currentUser = getCurrentUser();
        return taskRepository.countTasksByUserAndStatus(currentUser, status);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(authentication.getName());
    }
}