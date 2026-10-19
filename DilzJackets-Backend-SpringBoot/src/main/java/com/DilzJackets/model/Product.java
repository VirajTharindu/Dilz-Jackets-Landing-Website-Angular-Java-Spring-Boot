package com.DilzJackets.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "products")
@Getter
@Setter
@ToString
public class Product {

    public Product() {
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type")
    @JsonProperty("productType")
    @JsonAlias({"product_type", "productType"})
    private ProductType productType;

    private String material;

    @Column(name = "price_lkr")
    @JsonProperty("priceLkr")
    @JsonAlias({"price_lkr", "priceLkr"})
    private BigDecimal priceLkr;

    private String description;

    // handles the array of sizes (S, M, L, XL, XXL) in PostgreSQL text[] column
    @Column(name = "available_sizes", columnDefinition = "text[]")
    @JsonProperty("availableSizes")
    @JsonAlias({"available_sizes", "availableSizes"})
    private List<String> availableSizes;

    // handles the array of cloudinary image urls in PostgreSQL text[] column
    @Column(name = "image_urls", columnDefinition = "text[]")
    @JsonProperty("imageUrls")
    @JsonAlias({"image_urls", "imageUrls"})
    private List<String> imageUrls;

    @Column(name = "in_stock")
    @JsonProperty("inStock")
    @JsonAlias({"in_stock", "inStock"})
    private Boolean inStock = true;

    @Column(name = "created_at", updatable = false)
    @JsonProperty("createdAt")
    @JsonAlias({"created_at", "createdAt"})
    private LocalDateTime createdAt = LocalDateTime.now();
}