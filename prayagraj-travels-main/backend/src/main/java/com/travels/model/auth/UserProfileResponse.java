package com.travels.model.auth;

import java.util.Map;

public class UserProfileResponse {
    private final Map<String, Object> user;

    public UserProfileResponse(Map<String, Object> user) {
        this.user = user;
    }

    public Map<String, Object> getUser() {
        return user;
    }
}