
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product } from '../types';
import { MOCK_ANALYTICS } from '../constants';
import { geminiService } from '../services/geminiService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface AdminDashboardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, setProducts, categories, setCategories, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'taxonomy'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', category: categories[0] || 'Uncategorized', price: 0, stock: 50 });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Taxonomy specific feedback
  const [taxonomyFeedback, setTaxonomyFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear feedback after 3 seconds
  useEffect(() => {
    if (taxonomyFeedback) {
      const timer = setTimeout(() => setTaxonomyFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [taxonomyFeedback]);

  const filteredAdminProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
      p.category.toLowerCase().includes(adminSearch.toLowerCase())
    );
  }, [products, adminSearch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) return;
    
    setIsGenerating(true);
    try {
      const description = await geminiService.generateProductDescription(newProduct.name, newProduct.category);
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        description,
        price: newProduct.price,
        category: newProduct.category,
        image: imagePreview || `https://picsum.photos/seed/${newProduct.name.replace(/\s/g, '')}/600/400`,
        rating: 5.0,
        stock: newProduct.stock,
        tags: [newProduct.category.toLowerCase()]
      };
      setProducts(prev => [product, ...prev]);
      // Reset form
      setNewProduct({ name: '', category: categories[0] || 'Uncategorized', price: 0, stock: 50 });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setTaxonomyFeedback({ type: 'error', message: 'Category name cannot be empty.' });
      return;
    }

    // Check for duplicates (case-insensitive)
    const exists = categories.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setTaxonomyFeedback({ type: 'error', message: `"${trimmed}" already exists in the market taxonomy.` });
      return;
    }

    setCategories(prev => [...prev, trimmed]);
    setNewCategoryName('');
    setTaxonomyFeedback({ type: 'success', message: `"${trimmed}" added successfully.` });
    
    // Auto-select this category for the next product addition to improve flow
    setNewProduct(prev => ({ ...prev, category: trimmed }));
  };

  const deleteCategory = (catToDelete: string) => {
    const count = products.filter(p => p.category === catToDelete).length;
    if (count > 0) {
      setTaxonomyFeedback({ type: 'error', message: `Blocked: ${count} items currently use "${catToDelete}".` });
      return;
    }
    
    if (confirm(`Remove "${catToDelete}" from taxonomy? This action cannot be undone.`)) {
      setCategories(prev => prev.filter(cat => cat !== catToDelete));
      setTaxonomyFeedback({ type: 'success', message: `"${catToDelete}" has been removed.` });
      
      // If the current newProduct selection was this category, reset it
      if (newProduct.category === catToDelete) {
        setNewProduct(prev => ({ ...prev, category: categories.find(c => c !== catToDelete) || 'Uncategorized' }));
      }
    }
  };

  const updateProductInline = (id: string, field: keyof Product, value: string | number) => {
    setIsSyncing(true);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    setTimeout(() => setIsSyncing(false), 500);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-200">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Merchant Portal</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={onLogout}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1"
              >
                Sign Out Securely
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              {isSyncing && (
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                  Live Syncing...
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'overview' ? 'bg-white shadow-lg text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Intelligence
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'products' ? 'bg-white shadow-lg text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('taxonomy')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'taxonomy' ? 'bg-white shadow-lg text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Taxonomy
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Total Revenue', value: '₦1,245,592', delta: '+18.4%', color: 'emerald', icon: '💰' },
              { label: 'Active Sessions', value: '1,402', delta: '+42', color: 'indigo', icon: '👤' },
              { label: 'Avg. Order Value', value: '₦21,050', delta: '+5.2%', color: 'emerald', icon: '📈' },
            ].map(stat => (
              <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-4xl group-hover:scale-110 transition-transform">{stat.icon}</div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-[450px]">
            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
               Performance Velocity
               <span className="bg-slate-100 text-[10px] px-3 py-1 rounded-full text-slate-500 font-bold uppercase tracking-widest">Live Updates</span>
            </h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_ANALYTICS}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                    labelStyle={{ fontWeight: 900, marginBottom: '4px', color: '#1e293b' }}
                    formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Sales']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black mb-8">Stream Audit</h3>
            <div className="space-y-8">
              {[
                { user: 'Bello S.', action: 'Purchased 2x Rice Bags', time: 'Just now', color: 'bg-emerald-500' },
                { user: 'Gemini Chef', action: 'Suggested Jollof recipe', time: '12 mins ago', color: 'bg-purple-500' },
                { user: 'System', action: 'Sync with Bani.africa', time: '42 mins ago', color: 'bg-blue-500' },
                { user: 'Store', action: 'Tomatoes: Restocked', time: '2 hours ago', color: 'bg-orange-500' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 3 && <div className="absolute top-10 left-5 w-0.5 h-10 bg-slate-100" />}
                  <div className={`w-10 h-10 rounded-2xl ${activity.color} flex-shrink-0 flex items-center justify-center font-black text-white text-xs shadow-lg`}>
                    {activity.user[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-none mb-1">{activity.user}</p>
                    <p className="text-xs text-slate-500">{activity.action}</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-black uppercase tracking-widest">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Product Media & AI Architect</h3>
                <p className="text-xs text-slate-500">Upload produce snapshot and let Gemini handle descriptions.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Item Photo</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group relative ${imagePreview ? 'border-emerald-500' : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'}`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs font-bold">Upload Photo</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Item Name</label>
                    <input 
                      type="text" 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Atarodo Special"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Market Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium appearance-none"
                    >
                      {categories.map(cat => <option key={cat}>{cat}</option>)}
                      {categories.length === 0 && <option>No Categories Defined</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Unit Price (₦)</label>
                    <input 
                      type="number" 
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Stock Units</label>
                    <input 
                      type="number" 
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddProduct}
                  disabled={isGenerating || !newProduct.name || categories.length === 0}
                  className="w-full bg-emerald-600 text-white font-black h-[70px] rounded-[2rem] hover:bg-emerald-700 disabled:bg-slate-200 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  {isGenerating ? 'AI Architecting...' : 'Commit Asset to Inventory'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-black text-slate-900 text-lg">Inventory Matrix</h3>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Filter items..."
                  className="bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none w-full md:w-80"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produce Details</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Price</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Management</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={product.image} className="w-14 h-14 rounded-xl object-cover border border-white shadow-sm" alt="" />
                          <div>
                            <p className="font-black text-slate-900">{product.name}</p>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{product.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <span className="font-black text-slate-400 mr-1">₦</span>
                          <input 
                            type="number"
                            value={product.price}
                            onChange={(e) => updateProductInline(product.id, 'price', parseFloat(e.target.value))}
                            className="bg-transparent border-transparent focus:bg-white focus:border-slate-200 rounded-lg py-1 px-2 w-32 font-black text-slate-900 outline-none"
                          />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <input 
                          type="number"
                          value={product.stock}
                          onChange={(e) => updateProductInline(product.id, 'stock', parseInt(e.target.value))}
                          className="bg-transparent border-transparent focus:bg-white focus:border-slate-200 rounded-lg py-1 px-2 w-16 font-bold text-slate-700 outline-none"
                        />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'taxonomy' && (
        <div className="space-y-8 max-w-4xl">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
             {/* Feedback Toast */}
             {taxonomyFeedback && (
               <div className={`absolute top-0 left-0 w-full p-4 text-center text-xs font-black uppercase tracking-widest animate-in slide-in-from-top duration-300 ${
                 taxonomyFeedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
               }`}>
                 {taxonomyFeedback.message}
               </div>
             )}

             <div className="flex items-center gap-4 mb-8 mt-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Taxonomy Manager</h3>
                <p className="text-xs text-slate-500">Refine the market taxonomy to help customers find produce faster.</p>
              </div>
            </div>

            <div className="flex gap-4 mb-10">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="Enter unique category name..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
                {newCategoryName && (
                  <button 
                    onClick={() => setNewCategoryName('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button 
                onClick={handleAddCategory}
                className="bg-indigo-600 text-white px-8 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                Create
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(cat => {
                const productCount = products.filter(p => p.category === cat).length;
                return (
                  <div key={cat} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
                    <div>
                      <p className="font-black text-slate-900">{cat}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{productCount} Items Assigned</p>
                    </div>
                    <button 
                      onClick={() => deleteCategory(cat)}
                      className="p-3 bg-white rounded-xl text-slate-300 hover:text-red-500 hover:border-red-100 border border-slate-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Delete Category"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active taxonomy defined.</p>
                   <p className="text-slate-300 text-[10px] mt-2">Start by creating your first produce section above.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
               <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <div>
              <p className="text-sm font-black text-emerald-900 mb-1">Taxonomy Governance</p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Categories are the backbone of your market's navigation. Ensure they are descriptive. Note that categories with active inventory cannot be deleted to maintain data integrity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
