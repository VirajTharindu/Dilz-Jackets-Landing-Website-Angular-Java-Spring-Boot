package com.DilzJackets.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

import com.DilzJackets.model.Product;
import com.DilzJackets.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    // fetch and filter products based on what yhe angular ui requests
    public List<Product> getAllProducts(String type, String material) {
        List<Product> all = repo.findAll();

        if (type != null) {
            all = all.stream().filter(p -> p.getProductType().name().equalsIgnoreCase(type))
                    .collect(Collectors.toList());
        }
        if (material != null) {
            all = all.stream().filter(p -> p.getMaterial().equalsIgnoreCase(material)).collect(Collectors.toList());
        }
        return all;

    }

    public Product getProductById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Product Not Found!"));
    }

    public Product saveProduct(Product product) {
        return repo.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = getProductById(id);
        if (updatedProduct.getName() != null) {
            existing.setName(updatedProduct.getName());
        }
        if (updatedProduct.getProductType() != null) {
            existing.setProductType(updatedProduct.getProductType());
        }
        if (updatedProduct.getMaterial() != null) {
            existing.setMaterial(updatedProduct.getMaterial());
        }
        if (updatedProduct.getPriceLkr() != null) {
            existing.setPriceLkr(updatedProduct.getPriceLkr());
        }
        if (updatedProduct.getDescription() != null) {
            existing.setDescription(updatedProduct.getDescription());
        }
        if (updatedProduct.getAvailableSizes() != null) {
            existing.setAvailableSizes(updatedProduct.getAvailableSizes());
        }
        if (updatedProduct.getImageUrls() != null) {
            existing.setImageUrls(updatedProduct.getImageUrls());
        }
        if (updatedProduct.getInStock() != null) {
            existing.setInStock(updatedProduct.getInStock());
        }
        return repo.save(existing);
    }

    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }
}
