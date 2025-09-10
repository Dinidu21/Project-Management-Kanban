package com.dinidu.pms.controller;

import com.dinidu.pms.dto.TeamMembersRequest;
import com.dinidu.pms.dto.TeamRequest;
import com.dinidu.pms.entity.Team;
import com.dinidu.pms.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<Team> createTeam(@Valid @RequestBody TeamRequest request) {
        try {
            Team team = teamService.createTeam(request);
            return ResponseEntity.ok(team);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Team>> myTeams() {
        List<Team> teams = teamService.getMyTeams();
        return ResponseEntity.ok(teams);
    }

    @PutMapping("/{id}/members")
    public ResponseEntity<Team> updateMembers(@PathVariable Long id, @RequestBody TeamMembersRequest request) {
        try {
            Team updated = teamService.updateMembers(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}