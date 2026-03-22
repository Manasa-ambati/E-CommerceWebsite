package com.ecommerce.dto;

import com.ecommerce.entity.WishlistItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal productPrice;
    private BigDecimal productDiscountPrice;
    private LocalDateTime createdAt;
    
    public static WishlistItemDTO fromWishlistItem(WishlistItem item) {
        return WishlistItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImage(item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0))
                .productPrice(item.getProduct().getPrice())
                .productDiscountPrice(item.getProduct().getDiscountPrice())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
