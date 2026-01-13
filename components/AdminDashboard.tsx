
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

  // Auto-sync visual feedback
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
      // Hardened AI call with fallback logic
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
      setTaxonomyFeedback({ type: 'error', message: 'Input required.' });
      return;
    }

    const exists = categories.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setTaxonomyFeedback({ type: 'error', message: `"${trimmed}" is already active.` });
      return;
    }

    setCategories(prev => [...prev, trimmed]);
    setNewCategoryName('');
    setTaxonomyFeedback({ type: 'success', message: `Added "${trimmed}" to taxonomy.` });
    
    // Auto-assignment for product flow
    setNewProduct(prev => ({ ...prev, category: trimmed }));
  };

  const deleteCategory = (catToDelete: string) => {
    const count = products.filter(p => p.category === catToDelete).length;
    if (count > 0) {
      setTaxonomyFeedback({ type: 'error', message: `Locked: ${count} active items assigned.` });
      return;
    }
    
    if (confirm(`Permanent removal of "${catToDelete}"?`)) {
      setCategories(prev => prev.filter(cat => cat !== catToDelete));
      setTaxonomyFeedback({ type: 'success', message: `Category removed.` });
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
    if (confirm('Delete this asset from inventory?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
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
        
        <nav className="flex bg-slate-200/50 p-1.5 rounded-2xl backdrop-blur-sm">
          {['overview', 'products', 'taxonomy'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
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
              { label: 'Settlement Total', value: '₦1,245,592', delta: '+18.4%', icon: '💰' },
              { label: 'Market Sessions', value: '1,402', delta: '+42', icon: '👤' },
              { label: 'Avg. Cart Value', value: '₦21,050', delta: '+5.2%', icon: '📈' },
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

          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-[450px]">
            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
               Logistics Velocity
               <span className="bg-slate-100 text-[10px] px-3 py-1 rounded-full text-slate-500 font-black uppercase tracking-widest">Real-time Analytics</span>
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
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-lg font-black mb-8">Asset Stream</h3>
            <div className="space-y-6">
              {[
                { user: 'Admin', action: 'Taxonomy Optimized', time: 'Just now', color: 'bg-indigo-500' },
                { user: 'Bani Rail', action: 'Settlement Confirmed', time: '5m ago', color: 'bg-emerald-500' },
                { user: 'System', action: 'Gemini description sync', time: '12m ago', color: 'bg-blue-500' },
                { user: 'Store', action: 'Low Stock Alert (Beef)', time: '40m ago', color: 'bg-red-500' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl ${activity.color} flex-shrink-0 flex items-center justify-center font-black text-white text-[10px] shadow-lg`}>
                    {activity.user[0]}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-none mb-1">{activity.user}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{activity.action}</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-black uppercase tracking-widest">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Visualization</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group ${imagePreview ? 'border-emerald-500' : 'border-slate-200 hover:border-emerald-400 bg-slate-50'}`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-[10px] font-black uppercase tracking-widest">Upload Asset</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Produce Identifier</label>
                    <input type="text" value={newProduct.name} onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Local Smoked Fish" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Taxonomy Node</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium appearance-none">
                      {categories.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Settlement Unit Price (₦)</label>
                    <input type="number" value={newProduct.price || ''} onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-black" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock Allocation</label>
                    <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold" />
                  </div>
                </div>

                <button 
                  onClick={handleAddProduct}
                  disabled={isGenerating || !newProduct.name}
                  className="w-full h-16 md:h-20 bg-emerald-600 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:bg-slate-200 flex items-center justify-center gap-4"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Gemini Architecting...
                    </>
                  ) : 'Commit to Market Inventory'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Active Inventory Ledger</h3>
              <input type="text" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} placeholder="Filter ledger..." className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-xs font-bold outline-none focus:bg-white w-48 transition-all" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement Price</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img src={product.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          <div>
                            <p className="font-black text-slate-900 text-sm">{product.name}</p>
                            <span className="text-[9px] font-black text-emerald-600 uppercase">{product.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center text-sm font-black text-slate-900">
                          ₦<input type="number" value={product.price} onChange={(e) => updateProductInline(product.id, 'price', parseFloat(e.target.value))} className="bg-transparent border-none w-24 outline-none px-1 focus:bg-white rounded" />
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <input type="number" value={product.stock} onChange={(e) => updateProductInline(product.id, 'stock', parseInt(e.target.value))} className="bg-transparent border-none w-16 outline-none font-bold text-slate-500 text-sm" />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
        <div className="space-y-8 max-w-4xl animate-in slide-in-from-left duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
             {taxonomyFeedback && (
               <div className={`absolute top-0 left-0 w-full p-3 text-center text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-top duration-300 ${taxonomyFeedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                 {taxonomyFeedback.message}
               </div>
             )}

             <div className="flex items-center gap-4 mb-10 mt-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Taxonomy Protocol</h3>
                <p className="text-xs text-slate-500">Scale your market hierarchy. Define unique produce sections.</p>
              </div>
            </div>

            <div className="flex gap-4 mb-10">
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} placeholder="New Category ID..." className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold placeholder:font-medium transition-all focus:bg-white" />
              <button onClick={handleAddCategory} className="bg-indigo-600 text-white px-10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95">Deploy</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat).length;
                return (
                  <div key={cat} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                    <div>
                      <p className="font-black text-slate-900 uppercase text-xs tracking-tight">{cat}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{count} Assets Linked</p>
                    </div>
                    <button onClick={() => deleteCategory(cat)} className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-slate-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
