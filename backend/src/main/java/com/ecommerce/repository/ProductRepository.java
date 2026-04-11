package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Page<Product> findByActiveTrue(Pageable pageable);
    
    List<Product> findByFeaturedTrueAndActiveTrue();
    
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);
    
    @Query("SELECT p FROM Product p JOIN p.category c WHERE p.active = true AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:tag IS NULL OR :tag MEMBER OF p.tags) AND " +
           "(:minDiscount IS NULL OR (p.discountPrice IS NOT NULL AND " +
           "((p.price - p.discountPrice) / p.price * 100) >= :minDiscount)) AND " +
           "(:minRating IS NULL OR p.rating >= :minRating)")
    Page<Product> findProductsWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("search") String search,
            @Param("tag") String tag,
            @Param("minDiscount") Integer minDiscount,
            @Param("minRating") Double minRating,
            Pageable pageable);
    
    @Query("SELECT p FROM Product p JOIN p.category c WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);
}
