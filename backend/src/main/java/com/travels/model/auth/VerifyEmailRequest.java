package com.travels.model.auth;

public class VerifyEmailRequest {

    private String otp;
    private String token; // link-based fallback

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
