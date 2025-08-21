package com.example.trainbooking.train;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByFromStation_CodeAndToStation_CodeAndDepartureTimeBetween(
            String fromCode,
            String toCode,
            LocalDateTime start,
            LocalDateTime end
    );
}

