package com.dinidu.pms.service;

import com.dinidu.pms.dto.TeamMembersRequest;
import com.dinidu.pms.dto.TeamRequest;
import com.dinidu.pms.entity.Team;
import com.dinidu.pms.entity.User;
import com.dinidu.pms.repo.TeamRepository;
import com.dinidu.pms.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TeamService {

    private static final Logger log = LoggerFactory.getLogger(TeamService.class);

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @PreAuthorize("isAuthenticated()")
    public List<Team> getMyTeams() {
        User current = currentUser();
        return teamRepository.findTeamsForUser(current);
    }

    @PreAuthorize("isAuthenticated() and !hasRole('GUEST')")
    public Team createTeam(TeamRequest req) {
        User current = currentUser();
        log.info("Creating team for user: {} with name: {}", current.getUsername(), req.getName());

        String name = req.getName() != null ? req.getName().trim() : null;
        if (name == null || name.isEmpty()) {
            log.warn("Team creation failed: name is null or empty for user: {}", current.getUsername());
            throw new IllegalArgumentException("Team name is required");
        }

        Team team = Team.builder()
                .name(name)
                .description(req.getDescription())
                .owner(current)
                .build();

        // Ensure owner is also a member
        Set<User> members = new HashSet<>();
        members.add(current);
        team.setMembers(members);

        try {
            Team saved = teamRepository.save(team);
            log.info("Team created successfully: {} for user: {}", saved.getName(), current.getUsername());
            return saved;
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.warn("Team creation failed due to data integrity violation for user: {} with name: {}", current.getUsername(), name, ex);
            throw new IllegalArgumentException("A team with this name already exists", ex);
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('TEAM_LEAD')")
    public Team updateMembers(Long teamId, TeamMembersRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        User current = currentUser();
        boolean isAdmin = current.getRole() == User.Role.ADMIN;

        // TEAM_LEAD may only manage teams they belong to (owner or member)
        if (!isAdmin) {
            boolean inTeam = team.getOwner().getId().equals(current.getId())
                    || (team.getMembers() != null && team.getMembers().stream().anyMatch(u -> u.getId().equals(current.getId())));
            if (!inTeam) {
                throw new RuntimeException("Access denied");
            }
        }

        Set<User> newMembers = new HashSet<>();
        if (request != null && request.getMemberIds() != null) {
            List<User> users = userRepository.findAllById(request.getMemberIds());
            newMembers.addAll(users);
        }

        // Always ensure owner remains effectively part of the team membership set
        newMembers.add(team.getOwner());

        team.setMembers(newMembers);
        return teamRepository.save(team);
    }

    public boolean checkTeamNameExists(String name) {
        return teamRepository.existsByName(name.trim());
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(authentication.getName());
    }
}