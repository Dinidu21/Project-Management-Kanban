package com.dinidu.pms.controller;

import com.dinidu.pms.dto.TeamMembersRequest;
import com.dinidu.pms.dto.TeamRequest;
import com.dinidu.pms.entity.Team;
import com.dinidu.pms.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<?> createTeam(@Valid @RequestBody TeamRequest request) {
        try {
            Team team = teamService.createTeam(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(team);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Team>> myTeams() {
        List<Team> teams = teamService.getMyTeams();
        return ResponseEntity.ok(teams);
    }

    @PutMapping("/{id}/members")
    public ResponseEntity<?> updateMembers(@PathVariable Long id, @RequestBody TeamMembersRequest request) {
        try {
            Team updated = teamService.updateMembers(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeam(@PathVariable Long id, @Valid @RequestBody TeamRequest request) {
        try {
            Team updated = teamService.updateTeam(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeam(@PathVariable Long id) {
        try {
            teamService.deleteTeam(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/check-name/{name}")
    public ResponseEntity<Boolean> checkTeamName(@PathVariable String name) {
        boolean exists = teamService.checkTeamNameExists(name);
        return ResponseEntity.ok(exists);
    }
}