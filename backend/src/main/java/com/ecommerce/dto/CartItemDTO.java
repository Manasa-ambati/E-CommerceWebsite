package com.ecommerce.dto;

import com.ecommerce.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal productPrice;
    private BigDecimal productDiscountPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private Integer stockQuantity;
    
    public static CartItemDTO fromCartItem(CartItem cartItem) {
        return CartItemDTO.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .productImage(cartItem.getProduct().getImages().isEmpty() ? null : cartItem.getProduct().getImages().get(0))
                .productPrice(cartItem.getProduct().getPrice())
                .productDiscountPrice(cartItem.getProduct().getDiscountPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(cartItem.getSubtotal())
                .stockQuantity(cartItem.getProduct().getStockQuantity())
                .build();
    }
}
