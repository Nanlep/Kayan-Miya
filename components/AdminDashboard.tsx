
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Order, OrderStatus } from '../types';
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
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, setProducts, categories, setCategories, orders, setOrders, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'taxonomy'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: keyof Product, direction: 'asc' | 'desc'}>({key: 'name', direction: 'asc'});
  
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    category: categories[0] || 'Uncategorized', 
    price: 0, 
    stock: 50,
    description: ''
  });
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [taxonomyFeedback, setTaxonomyFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (taxonomyFeedback) {
      const timer = setTimeout(() => setTaxonomyFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [taxonomyFeedback]);

  const sortedAndFilteredProducts = useMemo(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
      p.category.toLowerCase().includes(adminSearch.toLowerCase())
    );

    result.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, adminSearch, sortConfig]);

  const requestSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setIsSyncing(true);
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const logistics = order.logistics || {};
        if (status === 'dispatched') logistics.dispatchedAt = new Date().toISOString();
        if (status === 'arrived') logistics.arrivedAt = new Date().toISOString();
        if (status === 'shipped') logistics.lastLocation = 'Local Transit Hub';
        
        return { ...order, status, logistics };
      }
      return order;
    }));
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) return;
    setIsGenerating(true);
    try {
      const description = newProduct.description || await geminiService.generateProductDescription(newProduct.name, newProduct.category);
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
      setNewProduct({ name: '', category: categories[0] || 'Uncategorized', price: 0, stock: 50, description: '' });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAISuggestDescription = async () => {
    if (!newProduct.name) return;
    setIsGenerating(true);
    try {
      const desc = await geminiService.generateProductDescription(newProduct.name, newProduct.category);
      setNewProduct(prev => ({ ...prev, description: desc }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories(prev => [...prev, trimmed]);
    setNewCategoryName('');
    setTaxonomyFeedback({ type: 'success', message: `Added "${trimmed}" to taxonomy.` });
  };

  const deleteProduct = (id: string) => {
    if (confirm('Permanently remove this asset from inventory?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateProductInline = (id: string, field: keyof Product, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Merchant Rail</h1>
            <div className="flex items-center gap-3">
              <button onClick={onLogout} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Secure Logout</button>
              {isSyncing && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">● System Syncing</span>}
            </div>
          </div>
        </div>
        
        <nav className="flex bg-slate-200/50 p-1.5 rounded-2xl backdrop-blur-sm overflow-x-auto scrollbar-hide">
          {['overview', 'products', 'orders', 'taxonomy'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Settlement Total', value: `₦${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}`, delta: '+18.4%', icon: '💰' },
              { label: 'Active Inventory', value: products.length, delta: 'Verified', icon: '📦' },
              { label: 'Pending Logistics', value: orders.filter(o => o.status !== 'delivered').length, delta: 'Active', icon: '🚚' },
            ].map(stat => (
              <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-4xl">{stat.icon}</div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-black mb-8 flex items-center gap-3 uppercase tracking-tight">Market Performance Velocity</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_ANALYTICS}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
          {/* Enhanced Add Product Form */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </span>
              Asset Deployment
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Functional Upload Area */}
              <div className="lg:col-span-4 space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Visualization</label>
                <div 
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group ${
                    isDragging ? 'border-emerald-600 bg-emerald-50 scale-[1.02]' : 
                    imagePreview ? 'border-emerald-500' : 'border-slate-200 hover:border-emerald-400 bg-slate-50'
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="Preview" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Replace Asset</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-emerald-100 transition-all">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Drag & Drop Image</p>
                      <p className="text-[8px] font-medium opacity-60">PNG, JPG or WEBP (Max 2MB)</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
                </div>
              </div>

              {/* Enhanced Form Inputs */}
              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Produce Identifier</label>
                    <input 
                      type="text" 
                      value={newProduct.name} 
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))} 
                      placeholder="e.g., Local Smoked Fish (1kg)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Taxonomy Node</label>
                    <select 
                      value={newProduct.category} 
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 appearance-none focus:bg-white transition-all cursor-pointer"
                    >
                      {categories.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Description</label>
                    <button 
                      onClick={handleAISuggestDescription}
                      disabled={isGenerating || !newProduct.name}
                      className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline disabled:opacity-40 disabled:no-underline"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      AI Assist
                    </button>
                  </div>
                  <textarea 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the freshness, origin, and culinary profile..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[120px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Settlement Unit Price (₦)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₦</span>
                      <input 
                        type="number" 
                        value={newProduct.price || ''} 
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 outline-none font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory Volume</label>
                    <input 
                      type="number" 
                      value={newProduct.stock} 
                      onChange={(e) => setNewProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddProduct}
                  disabled={isGenerating || !newProduct.name || newProduct.price <= 0}
                  className="w-full h-16 md:h-20 bg-emerald-600 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:bg-slate-200 disabled:shadow-none flex items-center justify-center gap-4 active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Architecting Asset...
                    </>
                  ) : (
                    <>
                      Commit to Market Inventory
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Listing & Management Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">Inventory Ledger</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{products.length} Active Records Linked</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input 
                    type="text" 
                    value={adminSearch} 
                    onChange={(e) => setAdminSearch(e.target.value)} 
                    placeholder="Search ledger..." 
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none focus:bg-white w-full md:w-64 transition-all" 
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th 
                      onClick={() => requestSort('name')}
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Asset Name
                        {sortConfig.key === 'name' && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => requestSort('category')}
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600 transition-colors"
                    >
                       Taxonomy Node
                    </th>
                    <th 
                      onClick={() => requestSort('price')}
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Settlement Price
                        {sortConfig.key === 'price' && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => requestSort('stock')}
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600 transition-colors"
                    >
                      Volume
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedAndFilteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center opacity-40">
                          <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <p className="font-bold uppercase tracking-widest text-[10px]">Registry Clear</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedAndFilteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                              <img src={product.image} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">{product.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight line-clamp-1 max-w-[200px]">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1 group/price">
                            <span className="font-black text-slate-400 text-xs">₦</span>
                            <input 
                              type="number" 
                              value={product.price} 
                              onChange={(e) => updateProductInline(product.id, 'price', parseFloat(e.target.value))}
                              className="w-24 bg-transparent border-none outline-none font-black text-slate-900 text-sm focus:bg-white rounded px-1 transition-colors"
                            />
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <input 
                              type="number" 
                              value={product.stock} 
                              onChange={(e) => updateProductInline(product.id, 'stock', parseInt(e.target.value))}
                              className={`w-16 bg-transparent border-none outline-none font-black text-sm focus:bg-white rounded px-1 transition-colors ${
                                product.stock < 10 ? 'text-red-500' : 'text-slate-600'
                              }`}
                            />
                            {product.stock < 10 && (
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => deleteProduct(product.id)}
                               className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                             >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Logistics Management Hub</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{orders.length} Active Shipments</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Logistics Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase text-xs">No customer orders identified in the registry.</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-8 py-6 font-black text-slate-900 text-sm">#{order.id}</td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-700 text-sm">{order.customerName}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black">{order.items.length} Items • ₦{order.total.toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                            order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            {order.status === 'pending' && (
                              <button onClick={() => updateOrderStatus(order.id, 'dispatched')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors">Dispatch Goods</button>
                            )}
                            {order.status === 'dispatched' && (
                              <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">Set In Transit</button>
                            )}
                            {order.status === 'shipped' && (
                              <button onClick={() => updateOrderStatus(order.id, 'arrived')} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors">Mark as Arrived</button>
                            )}
                            {order.status === 'arrived' && (
                              <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors">Confirm Delivery</button>
                            )}
                            {order.status === 'delivered' && (
                              <span className="text-emerald-500">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'taxonomy' && (
        <div className="space-y-8 max-w-4xl animate-in slide-in-from-left duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
             {taxonomyFeedback && (
               <div className={`absolute top-0 left-0 w-full p-3 text-center text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-top duration-300 ${taxonomyFeedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                 {taxonomyFeedback.message}
               </div>
             )}
            <div className="flex gap-4 mb-10">
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} placeholder="New Category ID..." className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold placeholder:font-medium transition-all focus:bg-white" />
              <button onClick={handleAddCategory} className="bg-indigo-600 text-white px-10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95">Deploy</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(cat => (
                <div key={cat} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                  <div>
                    <p className="font-black text-slate-900 uppercase text-xs tracking-tight">{cat}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{products.filter(p => p.category === cat).length} Assets Linked</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
