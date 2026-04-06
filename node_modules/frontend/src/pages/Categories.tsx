import React from 'react';
import BackButton from '../components/BackButton';

const Categories: React.FC = () => {
  return (
    <div className="categories-page">
      <BackButton fallbackPath="/" />
      
      <h1>Browse Categories</h1>
      <p>Categories page coming soon...</p>
    </div>
  );
};

export default Categories;
