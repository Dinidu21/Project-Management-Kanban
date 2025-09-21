package com.dinidu.pms.service;

import com.dinidu.pms.dto.TaskRequest;
import com.dinidu.pms.entity.Project;
import com.dinidu.pms.entity.Task;
import com.dinidu.pms.entity.User;
import com.dinidu.pms.repo.ProjectRepository;
import com.dinidu.pms.repo.TaskRepository;
import com.dinidu.pms.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<Task> getAllTasks() {
        User currentUser = getCurrentUser();
        boolean admin = currentUser.getRole() == User.Role.ADMIN;
        return taskRepository.findAccessibleTasksFor(currentUser, admin);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @PreAuthorize("!hasRole('GUEST')")
    public Task createTask(TaskRequest request) {
        User currentUser = getCurrentUser();

        var taskBuilder = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Task.Status.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .dueDate(request.getDueDate());

        // Set project if provided, and enforce RBAC
        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            if (!canUseProject(currentUser, project)) {
                throw new RuntimeException("Access denied for project");
            }
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

        return taskRepository.save(task);
    }

    @PreAuthorize("!hasRole('GUEST')")
    public Task updateTask(Long id, TaskRequest request) {
        Task task = getTaskById(id);
        User currentUser = getCurrentUser();

        if (!canEditTask(currentUser, task)) {
            throw new RuntimeException("Access denied");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        // Update project if provided (RBAC)
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            if (!canUseProject(currentUser, project)) {
                throw new RuntimeException("Access denied for project");
            }
            task.setProject(project);
        }

        // Update assignee if provided
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }

        return taskRepository.save(task);
    }

    @PreAuthorize("!hasRole('GUEST')")
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        User currentUser = getCurrentUser();

        if (!canEditTask(currentUser, task)) {
            throw new RuntimeException("Access denied");
        }

        taskRepository.delete(task);
    }

    public Long getTaskCountByStatus(Task.Status status) {
        User currentUser = getCurrentUser();
        boolean admin = currentUser.getRole() == User.Role.ADMIN;
        return taskRepository.countAccessibleTasksByStatus(currentUser, status, admin);
    }

    private boolean canUseProject(User user, Project project) {
        if (user.getRole() == User.Role.ADMIN) return true;
        // Project owner can always use
        if (project.getOwner() != null && project.getOwner().getId().equals(user.getId())) return true;
        // Team membership or ownership
        if (project.getTeam() != null) {
            boolean inTeam = project.getTeam().getOwner().getId().equals(user.getId())
                    || (project.getTeam().getMembers() != null &&
                        project.getTeam().getMembers().stream().anyMatch(u -> u.getId().equals(user.getId())));
            return inTeam; // TEAM_LEAD or MEMBER in team can use
        }
        // If no team: allow only owner (already handled) or admin
        return false;
    }

    private boolean canEditTask(User user, Task task) {
        if (user.getRole() == User.Role.ADMIN) return true;
        // Assignee can edit
        if (task.getAssignee() != null && task.getAssignee().getId().equals(user.getId())) return true;
        // Project owner can edit
        if (task.getProject() != null && task.getProject().getOwner() != null
                && task.getProject().getOwner().getId().equals(user.getId())) return true;
        // Team-based permissions
        if (task.getProject() != null && task.getProject().getTeam() != null) {
            boolean inTeam = task.getProject().getTeam().getOwner().getId().equals(user.getId())
                    || (task.getProject().getTeam().getMembers() != null &&
                        task.getProject().getTeam().getMembers().stream().anyMatch(u -> u.getId().equals(user.getId())));
            if (inTeam) {
                // TEAM_LEAD can manage team’s tasks; MEMBER can edit tasks in their team projects
                return user.getRole() == User.Role.TEAM_LEAD || user.getRole() == User.Role.MEMBER;
            }
        }
        return false;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(authentication.getName());
    }
}