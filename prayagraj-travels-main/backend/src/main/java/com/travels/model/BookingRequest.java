package com.travels.model;

/**
 * Represents a booking request from the client.
 */
public class BookingRequest {

    private Long   busId;
    private String seatNumber;
    private String travelDate;   // yyyy-MM-dd
    private String userId;
    private String passengerName;
    private String passengerPhone;

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getBusId()                        { return busId; }
    public void setBusId(Long busId)              { this.busId = busId; }

    public String getSeatNumber()                 { return seatNumber; }
    public void setSeatNumber(String seatNumber)  { this.seatNumber = seatNumber; }

    public String getTravelDate()                 { return travelDate; }
    public void setTravelDate(String travelDate)  { this.travelDate = travelDate; }

    public String getUserId()                     { return userId; }
    public void setUserId(String userId)          { this.userId = userId; }

    public String getPassengerName()              { return passengerName; }
    public void setPassengerName(String n)        { this.passengerName = n; }

    public String getPassengerPhone()             { return passengerPhone; }
    public void setPassengerPhone(String p)       { this.passengerPhone = p; }
}
