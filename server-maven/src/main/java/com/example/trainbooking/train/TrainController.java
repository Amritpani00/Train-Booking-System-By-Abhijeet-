package com.example.trainbooking.train;

import com.example.trainbooking.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trains")
@RequiredArgsConstructor
public class TrainController {

    private final TrainRepository trainRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Train>>> list() {
        return ResponseEntity.ok(ApiResponse.<List<Train>>builder().success(true).data(trainRepository.findAll()).build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Train>> create(@Valid @RequestBody TrainRequest req) {
        if (trainRepository.existsByCode(req.getCode())) {
            return ResponseEntity.badRequest().body(ApiResponse.<Train>builder().success(false).message("Train code exists").build());
        }
        Train t = Train.builder().code(req.getCode()).name(req.getName()).totalSeats(req.getTotalSeats()).build();
        return ResponseEntity.ok(ApiResponse.<Train>builder().success(true).data(trainRepository.save(t)).build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Train>> update(@PathVariable Long id, @Valid @RequestBody TrainRequest req) {
        Train t = trainRepository.findById(id).orElseThrow();
        t.setName(req.getName());
        t.setTotalSeats(req.getTotalSeats());
        return ResponseEntity.ok(ApiResponse.<Train>builder().success(true).data(trainRepository.save(t)).build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        trainRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Deleted").build());
    }

    @Data
    public static class TrainRequest {
        @NotBlank
        private String code;
        @NotBlank
        private String name;
        private int totalSeats;
    }
}

