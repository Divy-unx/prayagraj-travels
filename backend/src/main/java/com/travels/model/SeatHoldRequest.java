package com.travels.model;

/**
 * Represents a seat hold request (temp lock via Redis).
 */
public class SeatHoldRequest {

    private Long   busId;
    private String seatNumber;
    private String travelDate;   // yyyy-MM-dd
    private String userId;

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getBusId()                       { return busId; }
    public void setBusId(Long busId)             { this.busId = busId; }

    public String getSeatNumber()                { return seatNumber; }
    public void setSeatNumber(String s)          { this.seatNumber = s; }

    public String getTravelDate()                { return travelDate; }
    public void setTravelDate(String d)          { this.travelDate = d; }

    public String getUserId()                    { return userId; }
    public void setUserId(String u)              { this.userId = u; }
}
