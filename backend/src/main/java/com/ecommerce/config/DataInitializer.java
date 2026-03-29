package com.ecommerce.config;

import com.ecommerce.entity.*;
import com.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Update all existing users to have verified emails (remove OTP requirement)
        userRepository.findAll().forEach(user -> {
            if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                userRepository.save(user);
            }
        });
        
        // Create admin user
        if (!userRepository.existsByEmail("admin@eshop.com")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmail("admin@eshop.com");
            admin.setPassword(passwordEncoder != null ? passwordEncoder.encode("admin123") : "admin123");
            admin.setPhone("+1234567890");
            admin.setRole(User.Role.ADMIN);
            admin.setEmailVerified(true);
            userRepository.save(admin);
        }
        
        // Create test customer user
        if (!userRepository.existsByEmail("customer@test.com")) {
            User customer = new User();
            customer.setFirstName("Test");
            customer.setLastName("Customer");
            customer.setEmail("customer@test.com");
            customer.setPassword(passwordEncoder != null ? passwordEncoder.encode("password123") : "password123");
            customer.setPhone("+1234567899");
            customer.setRole(User.Role.CUSTOMER);
            customer.setEmailVerified(true);
            userRepository.save(customer);
        }

        // Create categories if they don't exist
        if (categoryRepository.count() == 0) {
            Category home = createCategory("Home", "Home decor and furnishings", "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300&h=300&fit=crop");
            Category electronics = createCategory("Electronics", "Latest gadgets and electronic devices", "https://images.unsplash.com/photo-1468495244123-6c6ef332ad74?w=300&h=300&fit=crop");
            Category clothing = createCategory("Clothing", "Fashionable apparel for men and women", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop");
            Category books = createCategory("Books", "Books across all genres", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=300&fit=crop");
            Category sports = createCategory("Sports", "Sports equipment and accessories", "https://images.unsplash.com/photo-1461896836934-voices8501ea2d6e?w=300&h=300&fit=crop");

            // Create subcategories
            Category smartphones = createSubcategory("Smartphones", "Latest smartphones", electronics);
            Category laptops = createSubcategory("Laptops", "Computers and laptops", electronics);
            Category mensWear = createSubcategory("Men's Wear", "Clothing for men", clothing);
            Category womensWear = createSubcategory("Women's Wear", "Clothing for women", clothing);

            // Create products
            createProduct("iPhone 15 Pro", "Latest iPhone with advanced camera system and A17 Pro chip", 
                    new BigDecimal("999.00"), new BigDecimal("899.00"), 50, "IPH15PRO", 
                    smartphones, 
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&h=500&fit=crop"
    
                    ),
                    Arrays.asList("smartphone", "apple", "5g", "premium"), true);

            createProduct("Samsung Galaxy S24", "Flagship Android smartphone with AI features", 
                    new BigDecimal("899.00"), new BigDecimal("749.00"), 40, "SGS24", 
                    smartphones,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1610945415002-63e70f1b8f4e?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("smartphone", "samsung", "android", "5g"), true);

            createProduct("MacBook Pro 16", "Professional laptop for creators with M3 Max chip", 
                    new BigDecimal("2499.00"), new BigDecimal("2299.00"), 30, "MBP16", 
                    laptops,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("laptop", "apple", "pro", "m3"), true);

            createProduct("Nike Air Max", "Comfortable running shoes with air cushioning", 
                    new BigDecimal("129.00"), new BigDecimal("99.00"), 100, "NAM90", 
                    sports,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("shoes", "nike", "running", "sports"), true);

            createProduct("The Great Gatsby", "Classic American novel by F. Scott Fitzgerald", 
                    new BigDecimal("15.00"), new BigDecimal("12.00"), 200, "TGG001", 
                    books,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("fiction", "classic", "bestseller"), false);

            createProduct("Modern Sofa", "Comfortable 3-seater sofa with premium fabric", 
                    new BigDecimal("599.00"), new BigDecimal("499.00"), 20, "MS3S", 
                    home,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("furniture", "sofa", "living-room", "modern"), true);

            createProduct("Cotton T-Shirt", "Premium quality 100% cotton t-shirt", 
                    new BigDecimal("29.00"), null, 150, "CT001", 
                    mensWear,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("clothing", "tshirt", "cotton"), false);

            createProduct("Summer Dress", "Elegant floral summer dress for women", 
                    new BigDecimal("79.00"), new BigDecimal("59.00"), 80, "SD001", 
                    womensWear,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1572804013309-2fe0e88d5e30?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("clothing", "dress", "summer", "fashion"), true);

            createProduct("Wireless Earbuds", "High-quality wireless earbuds with noise cancellation", 
                    new BigDecimal("149.00"), new BigDecimal("119.00"), 75, "WE001", 
                    electronics,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("audio", "wireless", "earbuds", "bluetooth"), true);

            createProduct("Yoga Mat", "Non-slip exercise yoga mat with carrying strap", 
                    new BigDecimal("35.00"), new BigDecimal("25.00"), 120, "YM001", 
                    sports,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1552674605-5d28c4e1902c?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("fitness", "yoga", "exercise"), false);

            createProduct("Sony WH-1000XM5", "Premium noise-canceling headphones with exceptional sound", 
                    new BigDecimal("399.00"), new BigDecimal("349.00"), 45, "SONY-XM5", 
                    electronics,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("audio", "headphones", "wireless", "premium"), true);

            createProduct("iPad Air", "Lightweight tablet for work and play with M2 chip", 
                    new BigDecimal("599.00"), new BigDecimal("549.00"), 60, "IPAD-AIR", 
                    electronics,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("tablet", "apple", "portable", "m2"), true);

            createProduct("Leather Jacket", "Genuine leather biker jacket for men", 
                    new BigDecimal("199.00"), new BigDecimal("149.00"), 35, "LJ-001", 
                    mensWear,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("clothing", "leather", "jacket", "fashion"), true);

            createProduct("Running Watch", "GPS sports watch with heart rate monitor and tracking", 
                    new BigDecimal("299.00"), new BigDecimal("249.00"), 50, "RW-GPS", 
                    sports,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("watch", "fitness", "gps", "sports"), true);

            createProduct("Coffee Maker", "Automatic espresso coffee machine for home", 
                    new BigDecimal("249.00"), new BigDecimal("199.00"), 40, "CM-ESP", 
                    home,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("kitchen", "coffee", "appliance", "espresso"), true);

            // Additional Featured Products with Premium Images
            createProduct("Canon EOS R6", "Professional mirrorless camera with 4K video", 
                    new BigDecimal("2499.00"), new BigDecimal("2299.00"), 25, "CANON-R6", 
                    electronics,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("camera", "canon", "photography", "professional"), true);

            createProduct("Designer Sunglasses", "Luxury polarized sunglasses with UV protection", 
                    new BigDecimal("189.00"), new BigDecimal("149.00"), 60, "DS-LUX", 
                    clothing,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1577803645773-f96470509666?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("accessories", "sunglasses", "luxury", "fashion"), true);

            createProduct("Smart Home Speaker", "Voice-controlled smart speaker with premium sound", 
                    new BigDecimal("129.00"), new BigDecimal("99.00"), 80, "SHS-001", 
                    electronics,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1543515912-1c3cd6ad71b7?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1588612502809-7733118d9e8e?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("smart-home", "speaker", "voice-control", "audio"), true);

            createProduct("Premium Watch", "Elegant stainless steel watch with leather strap", 
                    new BigDecimal("399.00"), new BigDecimal("329.00"), 40, "PW-ELG", 
                    mensWear,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("watch", "luxury", "accessories", "fashion"), true);

            createProduct("Organic Skincare Set", "Natural skincare routine with essential oils", 
                    new BigDecimal("89.00"), new BigDecimal("69.00"), 90, "OSS-SET", 
                    womensWear,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1608248597309-6e9f514dd809?w=500&h=500&fit=crop",                        
                        "https://pyxis.nymag.com/v1/imgs/921/c0c/d56eeaa21522d8918ee1cedde9dea91293.rsquare.w600.jpg"
                    ),
                    Arrays.asList("skincare", "organic", "beauty", "natural"), true);

            createProduct("Gaming Mouse", "RGB wireless gaming mouse with programmable buttons", 
                    new BigDecimal("79.00"), new BigDecimal("59.00"), 100, "GM-RGB", 
                    electronics,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1615663245857-acda5b2b1508?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("gaming", "mouse", "rgb", "wireless"), true);

            createProduct("Minimalist Backpack", "Water-resistant laptop backpack with USB charging port", 
                    new BigDecimal("69.00"), new BigDecimal("49.00"), 120, "MB-USB", 
                    clothing,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("backpack", "laptop", "travel", "usb"), true);

            createProduct("Ceramic Vase Set", "Handcrafted decorative vases for modern homes", 
                    new BigDecimal("59.00"), new BigDecimal("39.00"), 70, "CV-SET", 
                    home,
                    Arrays.asList(
                        "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=500&h=500&fit=crop",
                        "https://images.unsplash.com/photo-1534349762913-96c8713495ec?w=500&h=500&fit=crop"
                    ),
                    Arrays.asList("decor", "vase", "ceramic", "handmade"), true);
            
        }
    }

    private Category createCategory(String name, String description, String imageUrl) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setImageUrl(imageUrl);
        return categoryRepository.save(category);
    }

    private Category createSubcategory(String name, String description, Category parent) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setParent(parent);
        return categoryRepository.save(category);
    }

    private void createProduct(String name, String description, BigDecimal price, 
                               BigDecimal discountPrice, int stock, String sku, 
                               Category category, List<String> images, 
                               List<String> tags, boolean featured) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setDiscountPrice(discountPrice);
        product.setStockQuantity(stock);
        product.setSku(sku);
        product.setCategory(category);
        product.setImages(images);
        product.setTags(tags);
        product.setFeatured(featured);
        product.setActive(true);
        
        // Add random rating between 3.5 and 5.0
        double rating = 3.5 + (Math.random() * 1.5);
        product.setRating(Math.round(rating * 10.0) / 10.0); // Round to 1 decimal
        
        // Add random review count between 20 and 500
        product.setReviewCount((int)(Math.random() * 480) + 20);
        
        productRepository.save(product);
    }
}


