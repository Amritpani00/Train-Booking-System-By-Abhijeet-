package com.example.trainbooking.train;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "trains")
public class Train {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code; // e.g., TR1234

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private int totalSeats;
}

