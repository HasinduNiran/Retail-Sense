import React from "react";
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaTag } from 'react-icons/fa';

const ProductCard = ({ id, img, name, price, category, brand, quantity, originalPrice }) => {
  // Calculate discount percentage if originalPrice is provided
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
      <div className="relative overflow-hidden h-60 group">
        <img 
          src={img} 
          alt={name} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300" 
        />
        
        {/* Stock status badges (right corner) */}
        {quantity <= 0 && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 m-2 rounded-full text-xs font-medium">
            Out of Stock
          </div>
        )}
        {quantity > 0 && quantity < 5 && (
          <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 m-2 rounded-full text-xs font-medium">
            Low Stock
          </div>
        )}
        
        {/* Discount badge (left corner) */}
        {hasDiscount && (
          <div className="absolute top-0 left-0 bg-red-500 text-white m-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <FaTag className="rotate-180" />
            Save {discountPercentage}%
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-xs" />
              ))}
            </div>
            <span className="text-xs">{brand}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">{name}</h3>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">{category}</span>
        </div>
        
        <div className="mb-4">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-purple-800">${price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</p>
            </div>
          ) : (
            <p className="text-xl font-bold text-purple-800">${price.toFixed(2)}</p>
          )}
        </div>
        
        <div className="mt-auto">
          <Link 
            to={`/product/${id}`} 
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium ${
              quantity > 0 
                ? 'bg-purple-700 hover:bg-purple-800 text-white' 
                : 'bg-gray-300 cursor-not-allowed text-gray-600'
            } transition-colors duration-300`}
            disabled={quantity <= 0}
          >
            <FaShoppingCart />
            {quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
