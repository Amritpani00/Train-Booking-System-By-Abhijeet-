package com.example.trainbooking.booking;

import com.example.trainbooking.common.ApiResponse;
import com.example.trainbooking.user.User;
import com.example.trainbooking.user.UserRepository;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Booking>>> myBookings(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.<List<Booking>>builder().success(true).data(bookingRepository.findByUser(user)).build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> book(Principal principal, @RequestBody BookRequest req) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Booking booking = bookingService.bookSeats(req.getRouteId(), req.getSeats(), req.getFarePerSeat());
        booking.setUser(user);
        bookingRepository.save(booking);
        return ResponseEntity.ok(ApiResponse.<Booking>builder().success(true).data(booking).build());
    }

    @Data
    public static class BookRequest {
        private Long routeId;
        @Min(1)
        private int seats;
        private double farePerSeat;
    }
}

