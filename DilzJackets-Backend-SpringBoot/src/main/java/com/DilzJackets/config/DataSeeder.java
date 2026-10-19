package com.DilzJackets.config;

import com.DilzJackets.model.AdminUser;
import com.DilzJackets.model.Product;
import com.DilzJackets.model.ProductType;
import com.DilzJackets.repository.AdminUserRepository;
import com.DilzJackets.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private final AdminUserRepository adminRepo;
    private final ProductRepository productRepo;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AdminUserRepository adminRepo, ProductRepository productRepo, PasswordEncoder passwordEncoder) {
        this.adminRepo = adminRepo;
        this.productRepo = productRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed default admin user if none exists
        if (adminRepo.count() == 0) {
            AdminUser admin = new AdminUser();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            adminRepo.save(admin);
            System.out.println(">>> SEED: Created default admin user (username: admin, password: admin123)");
        }

        // Seed sample products if catalog is empty
        if (productRepo.count() == 0) {
            Product p1 = new Product();
            p1.setName("Cordura All-Weather Riding Jacket");
            p1.setProductType(ProductType.JACKET);
            p1.setMaterial("600D Cordura Nylon");
            p1.setPriceLkr(new BigDecimal("2850.00"));
            p1.setDescription("Heavy-duty CE Level 2 armor pockets, waterproof inner lining, high-vis orange accents.");
            p1.setAvailableSizes(List.of("M", "L", "XL", "XXL"));
            p1.setImageUrls(List.of("https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"));
            p1.setInStock(true);

            Product p2 = new Product();
            p2.setName("StormGuard Pro Bikers Raincoat");
            p2.setProductType(ProductType.RAINCOATS);
            p2.setMaterial("Triple-layer Ripstop PVC");
            p2.setPriceLkr(new BigDecimal("1250.00"));
            p2.setDescription("100% waterproof heat-sealed seam taping with high-visibility reflective 3M strips.");
            p2.setAvailableSizes(List.of("L", "XL", "XXL"));
            p2.setImageUrls(List.of("https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800"));
            p2.setInStock(true);

            Product p3 = new Product();
            p3.setName("Stealth Black Leather Jacket");
            p3.setProductType(ProductType.JACKET);
            p3.setMaterial("Full-Grain Cowhide Leather");
            p3.setPriceLkr(new BigDecimal("4200.00"));
            p3.setDescription(
                    "Premium matte black leather finish with reinforced shoulder and elbow padding, tailored Sri Lankan fit.");
            p3.setAvailableSizes(List.of("S", "M", "L", "XL"));
            p3.setImageUrls(List.of("https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800"));
            p3.setInStock(true);

            productRepo.saveAll(List.of(p1, p2, p3));
            System.out.println(">>> SEED: Created 3 initial catalog products");
        }
    }
}
