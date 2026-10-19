package com.DilzJackets.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.DilzJackets.model.Product;
import com.DilzJackets.service.ProductService;

@RestController
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    // public endpoints for the showroom
    @GetMapping("api/products")
    public List<Product> getCatalog(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String material) {
        return service.getAllProducts(type, material);
    }

    @GetMapping("api/products/{id}")
    public Product getSingleProduct(@PathVariable Long id) {
        return service.getProductById(id);
    }

    // admin endpoints (we will secure these with JWT)
    @PostMapping("api/admin/products")
    public Product addProduct(@RequestBody Product product) {
        return service.saveProduct(product);
    }

    @PutMapping("api/admin/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    @DeleteMapping("api/admin/products/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
    }
}
