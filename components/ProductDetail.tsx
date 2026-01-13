
import React from 'react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onAddToCart, onBack }) => {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Shopping
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-white border border-slate-200 shadow-2xl shadow-slate-200">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 hover:border-emerald-500 cursor-pointer transition-all opacity-50 hover:opacity-100">
                <img src={`${product.image}?sig=${i}`} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                <span>★</span>
                <span className="text-slate-900">{product.rating} (Market Rating)</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-black text-emerald-600 mb-8">₦{product.price.toLocaleString()}</p>
            
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm mb-8">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest text-emerald-600">Freshness Guarantee</h3>
              <p className="text-slate-600 leading-relaxed italic">
                "{product.description}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Availability</p>
                  <p className="text-sm font-bold text-slate-900">{product.stock > 0 ? 'Fresh in Stock' : 'Out of Stock'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Speed</p>
                  <p className="text-sm font-bold text-slate-900">24hr Cold-chain</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => onAddToCart(product)}
                className="flex-1 bg-slate-900 text-white h-16 rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Shopping Bag
              </button>
              <button className="w-16 h-16 rounded-[2rem] border-2 border-slate-200 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all group">
                <svg className="w-6 h-6 group-hover:fill-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-12 pt-12 border-t border-slate-100">
             <h3 className="text-lg font-bold mb-6 italic text-emerald-800">Expert Review by Market Chef</h3>
             <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 relative">
               <div className="absolute -top-4 left-8 bg-emerald-600 text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">AI Insight</div>
               <p className="text-slate-700 italic leading-relaxed">
                 "This produce is sourced from high-altitude farms in Jos, ensuring better firmness and longer shelf life in your kitchen. Perfect for traditional local delicacies where richness and texture are paramount."
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
