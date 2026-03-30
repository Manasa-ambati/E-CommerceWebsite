import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md',
  color 
}) => {
  const sizeClass = `spinner-${size}`;
  
  const style = color ? {
    borderTopColor: color,
  } : undefined;

  return (
    <div className={`spinner ${sizeClass}`} style={style}></div>
  );
};

export default Spinner;
