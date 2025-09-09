package com.dinidu.pms.dto;

import com.dinidu.pms.entity.User;
import lombok.Data;

@Data
public class UpdateUserResponse {
    private User user;
    private String token;
}
