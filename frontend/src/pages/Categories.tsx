import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../services/api';
import BackButton from '../components/BackButton';
import './Categories.css';

interface Category {
  id: number;
  name: string;
  image?: string;
  parentId?: number;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const response = await categoryAPI.getAll();
        console.log('Categories response:', response.data);
        const categoriesData = response.data?.data || response.data || [];
        console.log('Categories data:', categoriesData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Category images mapping
  const categoryImages: { [key: string]: string } = {
    'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
    'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=300&fit=crop',
    'Home': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&h=300&fit=crop',
    'Beauty': 'https://images.pexels.com/photos/2071953/pexels-photo-2071953.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop',
    'Toys': 'https://images.pexels.com/photos/356508/pexels-photo-356508.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Men Wear': 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=300&h=300&fit=crop&q=80',
    'Women Wear': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&q=80'
  };

  if (loading) {
    return (
      <div className="categories-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <BackButton fallbackPath="/" />
      
      <div className="categories-header">
        <h1>All Categories</h1>
        <p>Explore our wide range of products</p>
      </div>

      <div className="categories-container">
        <div className="categories-grid-amazon">
          {categories.map((category) => {
            const imageUrl = categoryImages[category.name] || 'https://via.placeholder.com/300x300?text=Category';
            return (
              <Link 
                key={category.id} 
                to={`/products?category=${category.id}`}
                className="category-card-amazon"
              >
                <div className="category-image-wrapper">
                  <img 
                    src={imageUrl} 
                    alt={category.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=' + category.name;
                    }}
                  />
                </div>
                <div className="category-name-amazon">
                  <h3>{category.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;
