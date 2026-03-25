package com.ecommerce.repository;

import com.ecommerce.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmail(String email);
    boolean existsByEmail(String email);
    
    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.email = ?1")
    int deleteByEmail(String email);
}
