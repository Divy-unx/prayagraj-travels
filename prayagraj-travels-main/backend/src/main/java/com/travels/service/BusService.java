package com.travels.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.travels.repository.TravelsRepository;
import java.util.List;
import java.util.Map;

/**
 * Retained for backward-compatible bus CRUD operations.
 * Delegates to TravelsRepository via TravelsService.
 */
@Service
public class BusService {

    @Autowired
    private TravelsRepository repo;

    public List<Map<String, Object>> getAllBuses() {
        return repo.findAllBuses();
    }

    public Map<String, Object> getBusById(Long id) {
        return repo.findBusById(id);
    }

    // createBus / updateBus / deleteBus removed intentionally:
    // bus master data is managed via DB seeding.
}
