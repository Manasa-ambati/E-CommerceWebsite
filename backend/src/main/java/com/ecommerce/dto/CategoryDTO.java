package com.ecommerce.dto;

import com.ecommerce.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Long parentId;
    private List<CategoryDTO> subcategories;
    private boolean active;
    
    public static CategoryDTO fromCategory(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .subcategories(category.getSubcategories() != null ? 
                        category.getSubcategories().stream()
                                .map(CategoryDTO::fromCategory)
                                .collect(Collectors.toList()) : null)
                .active(category.isActive())
                .build();
    }
}
