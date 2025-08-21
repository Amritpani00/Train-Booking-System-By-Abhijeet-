package com.example.trainbooking.admin;

import com.example.trainbooking.common.ApiResponse;
import com.example.trainbooking.train.Route;
import com.example.trainbooking.train.RouteRepository;
import com.example.trainbooking.train.Station;
import com.example.trainbooking.train.StationRepository;
import com.example.trainbooking.train.Train;
import com.example.trainbooking.train.TrainRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final TrainRepository trainRepository;
    private final StationRepository stationRepository;
    private final RouteRepository routeRepository;

    @GetMapping("/stations")
    public ResponseEntity<ApiResponse<List<Station>>> listStations() {
        return ResponseEntity.ok(ApiResponse.<List<Station>>builder().success(true).data(stationRepository.findAll()).build());
    }

    @DeleteMapping("/stations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStation(@PathVariable Long id) {
        stationRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Deleted").build());
    }

    @PostMapping("/stations")
    public ResponseEntity<ApiResponse<Station>> addStation(@Valid @RequestBody StationRequest req) {
        Station s = Station.builder().code(req.getCode()).name(req.getName()).build();
        return ResponseEntity.ok(ApiResponse.<Station>builder().success(true).data(stationRepository.save(s)).build());
    }

    @PostMapping("/trains")
    public ResponseEntity<ApiResponse<Train>> addTrain(@Valid @RequestBody TrainRequest req) {
        Train t = Train.builder().code(req.getCode()).name(req.getName()).totalSeats(req.getTotalSeats()).build();
        return ResponseEntity.ok(ApiResponse.<Train>builder().success(true).data(trainRepository.save(t)).build());
    }

    @GetMapping("/routes")
    public ResponseEntity<ApiResponse<List<Route>>> listRoutes() {
        return ResponseEntity.ok(ApiResponse.<List<Route>>builder().success(true).data(routeRepository.findAll()).build());
    }

    @DeleteMapping("/routes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Long id) {
        routeRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Deleted").build());
    }

    @PostMapping("/routes")
    public ResponseEntity<ApiResponse<Route>> addRoute(@RequestBody RouteRequest req) {
        Train t = trainRepository.findById(req.getTrainId()).orElseThrow();
        Station from = stationRepository.findById(req.getFromStationId()).orElseThrow();
        Station to = stationRepository.findById(req.getToStationId()).orElseThrow();
        Route r = Route.builder()
                .train(t)
                .fromStation(from)
                .toStation(to)
                .departureTime(req.getDepartureTime())
                .arrivalTime(req.getArrivalTime())
                .baseFare(req.getBaseFare())
                .build();
        return ResponseEntity.ok(ApiResponse.<Route>builder().success(true).data(routeRepository.save(r)).build());
    }

    @Data
    public static class StationRequest {
        @NotBlank
        private String code;
        @NotBlank
        private String name;
    }

    @Data
    public static class TrainRequest {
        @NotBlank
        private String code;
        @NotBlank
        private String name;
        private int totalSeats;
    }

    @Data
    public static class RouteRequest {
        private Long trainId;
        private Long fromStationId;
        private Long toStationId;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private double baseFare;
    }
}

