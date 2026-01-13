
import React from 'react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetail: (id: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onViewDetail }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-xl font-medium">No results found.</p>
        <p className="text-sm">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map(product => (
        <div key={product.id} className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col">
          <div 
            className="relative aspect-[4/3] overflow-hidden cursor-pointer"
            onClick={() => onViewDetail(product.id)}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white/20 flex items-center gap-1.5">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-sm font-bold text-slate-800">{product.rating}</span>
              </div>
            </div>
            {product.stock < 10 && (
              <div className="absolute bottom-4 left-4 z-10">
                <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-orange-200">
                  Last {product.stock}
                </span>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-xl scale-90 group-hover:scale-100 transition-transform">
                 View Details
               </span>
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-3">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{product.category}</span>
              <h3 
                className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mt-1 cursor-pointer"
                onClick={() => onViewDetail(product.id)}
              >
                {product.name}
              </h3>
            </div>
            
            <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900">₦{product.price.toLocaleString()}</span>
              </div>
              <button
                onClick={() => onAddToCart(product)}
                className="bg-slate-900 text-white w-12 h-12 rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center shadow-lg shadow-slate-100 active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
