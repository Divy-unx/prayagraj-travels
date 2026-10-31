package com.travels.scheduler;

import com.travels.repository.TravelsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Simulates realistic GPS movement for all buses every 15 seconds.
 * Buses follow their route corridor (source → destination) with
 * small random perturbations to mimic real movement.
 */
@Component
public class LocationSimulator {

    private static final Logger log = LoggerFactory.getLogger(LocationSimulator.class);

    @Autowired
    private TravelsRepository repo;

    private final Random random = new Random();

    /**
     * Route corridors: busId → [startLat, startLng, endLat, endLng]
     * Prayagraj bounding box: lat ~25.35–25.55, lng ~81.75–81.95
     */
    private static final Map<Long, double[]> ROUTES = Map.of(
        1L, new double[]{25.4480, 81.8380, 25.3950, 81.8730},   // Civil Lines → Naini
        2L, new double[]{25.3950, 81.8730, 25.4480, 81.8380},   // Naini → Civil Lines
        3L, new double[]{25.4540, 81.7340, 25.4480, 81.8380},   // Airport → Prayagraj Jn
        4L, new double[]{25.4229, 81.8841, 25.4229, 81.8841},   // Sangam → George Town
        5L, new double[]{25.4480, 81.8380, 25.4600, 81.8800},   // Civil Lines → Jhunsi
        6L, new double[]{25.4600, 81.8200, 25.4100, 81.9000},   // Rambagh → Phaphamau
        7L, new double[]{25.4300, 81.8600, 25.4229, 81.8841},   // George Town → Sangam
        8L, new double[]{25.4480, 81.8380, 25.4540, 81.7340},   // Prayagraj Jn → Airport
        9L, new double[]{25.4480, 81.8380, 25.4600, 81.8800},   // Civil Lines → Jhunsi
       10L, new double[]{25.4100, 81.9000, 25.4600, 81.8200}    // Phaphamau → Rambagh
    );

    /** Tracks fractional progress (0.0 → 1.0) of each bus along its route. */
    private final Map<Long, Double> progress = new HashMap<>();

    @Scheduled(fixedRate = 15000) // every 15 seconds
    public void simulateMovement() {
        try {
            for (Map.Entry<Long, double[]> entry : ROUTES.entrySet()) {
                Long busId = entry.getKey();
                double[] corridor = entry.getValue();

                // Advance progress 3–7% per tick → full route in ~4–7 minutes, then reset
                double p = progress.getOrDefault(busId, random.nextDouble());
                p += 0.04 + random.nextDouble() * 0.04;
                if (p > 1.0) p = 0.0;
                progress.put(busId, p);

                // Linear interpolation along corridor + small noise
                double lat = corridor[0] + (corridor[2] - corridor[0]) * p
                           + (random.nextDouble() - 0.5) * 0.004;
                double lng = corridor[1] + (corridor[3] - corridor[1]) * p
                           + (random.nextDouble() - 0.5) * 0.004;

                int speed   = 30 + random.nextInt(40);   // 30–70 km/h
                int heading = (int)(Math.toDegrees(Math.atan2(
                        corridor[3] - corridor[1], corridor[2] - corridor[0])) + 360) % 360;

                String status = p > 0.9 ? "ARRIVED" : "ON_TIME";
                String nextStop = deriveNextStop(busId, p);

                repo.updateLiveLocation(busId, lat, lng, speed, heading, nextStop, status);
            }
            log.debug("Bus locations updated for {} buses", ROUTES.size());
        } catch (Exception e) {
            log.error("Location simulation error", e);
        }
    }

    private String deriveNextStop(Long busId, double p) {
        String[] stops;
        switch (busId.intValue()) {
            case 1  -> stops = new String[]{"Allahpur Chowk","Balson Crossing","Naini Bridge","Naini"};
            case 2  -> stops = new String[]{"Naini Depot","Muirabad","Zero Road","Civil Lines"};
            case 3  -> stops = new String[]{"Airport Gate","Bamrauli","Phaphamau Rd","Prayagraj Jn"};
            case 4  -> stops = new String[]{"Sangam Ghat","Daraganj","Raj Rupa","George Town"};
            case 5  -> stops = new String[]{"Civil Lines","Khuldabad","Jhunsi Crossing","Jhunsi"};
            case 6  -> stops = new String[]{"Rambagh","Colonelganj","Nawabganj","Phaphamau"};
            case 7  -> stops = new String[]{"George Town","Chowk","Atala","Sangam"};
            case 8  -> stops = new String[]{"Prayagraj Jn","Bamrauli Rd","Airport Colony","Airport"};
            case 9  -> stops = new String[]{"Civil Lines","Lukerganj","Jhunsi Rd","Jhunsi"};
            case 10 -> stops = new String[]{"Phaphamau","Nawabganj","Colonelganj","Rambagh"};
            default -> stops = new String[]{"Next Stop"};
        }
        int idx = (int)(p * stops.length);
        return stops[Math.min(idx, stops.length - 1)];
    }
}
