package com.DilzJackets.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.DilzJackets.model.Product;
import com.DilzJackets.model.ProductType;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // custom CRUD operations can be added here
    // spring boot jpa repository already provides all the CRUD operations
    // but we can add custom operations here if needed

    List<Product> findByProductType(ProductType productType);

}
