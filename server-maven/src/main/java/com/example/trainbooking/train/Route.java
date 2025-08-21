package com.example.trainbooking.train;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "routes")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Train train;

    @ManyToOne(optional = false)
    @JoinColumn(name = "from_station_id")
    private Station fromStation;

    @ManyToOne(optional = false)
    @JoinColumn(name = "to_station_id")
    private Station toStation;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private LocalDateTime arrivalTime;

    @Column(nullable = false)
    private double baseFare;
}

