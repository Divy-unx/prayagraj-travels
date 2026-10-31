package com.travels.model.auth;

import java.util.Map;

public class AuthResponse {
    private final String token;
    private final Map<String, Object> user;

    public AuthResponse(String token, Map<String, Object> user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public Map<String, Object> getUser() {
        return user;
    }
}