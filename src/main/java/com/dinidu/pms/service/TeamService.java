package com.dinidu.pms.service;

import com.dinidu.pms.dto.TeamMembersRequest;
import com.dinidu.pms.dto.TeamRequest;
import com.dinidu.pms.entity.Team;
import com.dinidu.pms.entity.User;
import com.dinidu.pms.repo.TeamRepository;
import com.dinidu.pms.repo.UserRepository;
import lombok.RequiredArgsConstructor;
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

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<Team> getMyTeams() {
        User current = currentUser();
        return teamRepository.findTeamsForUser(current);
    }

    @PreAuthorize("!hasRole('GUEST')")
    public Team createTeam(TeamRequest req) {
        User current = currentUser();

        Team team = Team.builder()
                .name(req.getName())
                .description(req.getDescription())
                .owner(current)
                .build();

        // Optionally add owner to members set as well
        Set<User> members = new HashSet<>();
        members.add(current);
        team.setMembers(members);

        return teamRepository.save(team);
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

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(authentication.getName());
    }
}