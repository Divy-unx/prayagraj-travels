package com.travels.controller;

import com.travels.service.TravelsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private TravelsService travelsService;

    @GetMapping("/routes")
    public ResponseEntity<?> getRoutes() {
        return ResponseEntity.ok(travelsService.getBusSummaries());
    }

    @PostMapping("/routes")
    public ResponseEntity<?> createRoute(@RequestBody Map<String, Object> payload) {
        long id = travelsService.createBus(payload);
        return ResponseEntity.ok(Map.of("success", true, "id", id));
    }

    @PutMapping("/routes/{id}")
    public ResponseEntity<?> updateRoute(@PathVariable long id, @RequestBody Map<String, Object> payload) {
        int rows = travelsService.updateBus(id, payload);
        return ResponseEntity.ok(Map.of("success", rows > 0, "updated", rows));
    }

    @DeleteMapping("/routes/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable long id) {
        int rows = travelsService.deleteBus(id);
        return ResponseEntity.ok(Map.of("success", rows > 0, "deleted", rows));
    }
}