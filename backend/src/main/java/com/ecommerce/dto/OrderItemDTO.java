package com.ecommerce.dto;

import com.ecommerce.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage; // Add product image field
    private BigDecimal productPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    
    public static OrderItemDTO fromOrderItem(OrderItem orderItem) {
        return OrderItemDTO.builder()
                .id(orderItem.getId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProductName())
                .productImage(orderItem.getProduct().getImages() != null && !orderItem.getProduct().getImages().isEmpty() 
                    ? orderItem.getProduct().getImages().get(0) 
                    : null)
                .productPrice(orderItem.getProductPrice())
                .quantity(orderItem.getQuantity())
                .subtotal(orderItem.getSubtotal())
                .build();
    }
}
