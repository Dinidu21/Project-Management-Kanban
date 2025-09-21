package com.dinidu.pms.service;

import com.dinidu.pms.dto.ProjectRequest;
import com.dinidu.pms.entity.Project;
import com.dinidu.pms.entity.Team;
import com.dinidu.pms.entity.User;
import com.dinidu.pms.repo.ProjectRepository;
import com.dinidu.pms.repo.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserService userService;

    public List<Project> getAllProjects() {
        User currentUser = getCurrentUser();
        boolean admin = currentUser.getRole() == User.Role.ADMIN;
        return projectRepository.findAccessibleProjectsFor(currentUser, admin);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    @PreAuthorize("!hasRole('GUEST')")
    public Project createProject(ProjectRequest request) {
        User currentUser = getCurrentUser();

        Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            boolean admin = currentUser.getRole() == User.Role.ADMIN;
            boolean inTeam = team.getOwner().getId().equals(currentUser.getId())
                    || (team.getMembers() != null && team.getMembers().stream().anyMatch(u -> u.getId().equals(currentUser.getId())));
            if (!admin && !inTeam) {
                throw new RuntimeException("Access denied to selected team");
            }
        }

        var project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Project.Status.PLANNING)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .owner(currentUser)
                .team(team)
                .build();

        return projectRepository.save(project);
    }

    @PreAuthorize("!hasRole('GUEST')")
    public Project updateProject(Long id, ProjectRequest request) {
        Project project = getProjectById(id);
        User currentUser = getCurrentUser();

        if (!canManageProject(currentUser, project)) {
            throw new RuntimeException("Access denied");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            boolean admin = currentUser.getRole() == User.Role.ADMIN;
            boolean inTeam = team.getOwner().getId().equals(currentUser.getId())
                    || (team.getMembers() != null && team.getMembers().stream().anyMatch(u -> u.getId().equals(currentUser.getId())));
            if (!admin && !inTeam) {
                throw new RuntimeException("Access denied to selected team");
            }
            project.setTeam(team);
        }

        return projectRepository.save(project);
    }

    @PreAuthorize("!hasRole('GUEST')")
    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        User currentUser = getCurrentUser();

        if (!canManageProject(currentUser, project)) {
            throw new RuntimeException("Access denied");
        }

        projectRepository.delete(project);
    }

    private boolean canManageProject(User currentUser, Project project) {
        if (currentUser.getRole() == User.Role.ADMIN) return true;
        if (project.getOwner() != null && project.getOwner().getId().equals(currentUser.getId())) return true;
        if (project.getTeam() != null) {
            boolean inTeam = project.getTeam().getOwner().getId().equals(currentUser.getId())
                    || (project.getTeam().getMembers() != null &&
                        project.getTeam().getMembers().stream().anyMatch(u -> u.getId().equals(currentUser.getId())));
            // TEAM_LEAD can manage team projects
            return inTeam && currentUser.getRole() == User.Role.TEAM_LEAD;
        }
        return false;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(authentication.getName());
    }
}