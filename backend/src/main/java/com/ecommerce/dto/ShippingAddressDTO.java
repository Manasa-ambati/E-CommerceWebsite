package com.ecommerce.dto;

import com.ecommerce.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressDTO {
    private String firstName;
    private String lastName;
    private String phone;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    
    public Order.ShippingAddress toEntity() {
        return new Order.ShippingAddress(
                firstName, lastName, phone, street, city, state, zipCode, country
        );
    }
    
    public static ShippingAddressDTO fromEntity(Order.ShippingAddress address) {
        if (address == null) return null;
        return ShippingAddressDTO.builder()
                .firstName(address.getFirstName())
                .lastName(address.getLastName())
                .phone(address.getPhone())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .country(address.getCountry())
                .build();
    }
}
