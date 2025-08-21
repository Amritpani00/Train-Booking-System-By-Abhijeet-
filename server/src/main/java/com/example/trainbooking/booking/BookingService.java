package com.example.trainbooking.booking;

import com.example.trainbooking.train.Route;
import com.example.trainbooking.train.RouteRepository;
import com.example.trainbooking.train.Train;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RouteRepository routeRepository;

    @Transactional
    public Booking bookSeats(Long routeId, int seats, double farePerSeat) {
        Route route = routeRepository.findById(routeId).orElseThrow();
        Train train = route.getTrain();
        // NOTE: For simplicity, no seat lock/inventory yet. In production use pessimistic locking.
        double amount = farePerSeat * seats;
        Booking booking = Booking.builder()
                .route(route)
                .seats(seats)
                .amountPaid(amount)
                .build();
        return bookingRepository.save(booking);
    }
}

