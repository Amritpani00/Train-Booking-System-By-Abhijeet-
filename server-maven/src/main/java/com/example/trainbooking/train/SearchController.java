package com.example.trainbooking.train;

import com.example.trainbooking.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final RouteRepository routeRepository;

    @GetMapping("/routes")
    public ResponseEntity<ApiResponse<List<Route>>> routes(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        List<Route> routes = routeRepository.findByFromStation_CodeAndToStation_CodeAndDepartureTimeBetween(from, to, start, end);
        return ResponseEntity.ok(ApiResponse.<List<Route>>builder().success(true).data(routes).build());
    }
}

