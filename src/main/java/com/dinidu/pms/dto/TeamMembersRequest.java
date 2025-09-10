package com.dinidu.pms.dto;

import lombok.Data;

import java.util.Set;

@Data
public class TeamMembersRequest {
    private Set<Long> memberIds;
}