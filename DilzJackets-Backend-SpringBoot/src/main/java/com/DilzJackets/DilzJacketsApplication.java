package com.DilzJackets;

import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.DilzJackets.config.DotenvLoader;

@SpringBootApplication
@RestController
public class DilzJacketsApplication {

    static {
        // Loads .env variables into System properties before Spring initializes
        DotenvLoader.load();
    }

    public static void main(String[] args) {
        DotenvLoader.load();
        SpringApplication.run(DilzJacketsApplication.class, args);
    }

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "shop", "Dilz Jackets - Maspotha, Kurunegala",
                "status", "Backend API is LIVE and connected to Supabase!!!!!!!!!!!!!!!!!");
    }

}
