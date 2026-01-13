
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
  const [newProduct, setNewProduct] = useState({ name: '', category: categories[0] || 'Uncategorized', price: 0, stock: 50 });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [taxonomyFeedback, setTaxonomyFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setNewProduct({ name: '', category: categories[0] || 'Uncategorized', price: 0, stock: 50 });
      setImagePreview(null);
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
              {isSyncing && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">● Logistics Syncing</span>}
            </div>
          </div>
        </div>
        
        <nav className="flex bg-slate-200/50 p-1.5 rounded-2xl backdrop-blur-sm overflow-x-auto">
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
              { label: 'Pending Logistics', value: orders.filter(o => o.status !== 'delivered').length, delta: 'Active', icon: '🚚' },
              { label: 'Market Sessions', value: '1,402', delta: '+42', icon: '👤' },
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
            <h3 className="text-lg font-black mb-8 flex items-center gap-3">Market Performance Velocity</h3>
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

      {activeTab === 'products' && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
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
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Produce Identifier</label>
                    <input type="text" value={newProduct.name} onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Taxonomy Node</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium appearance-none">
                      {categories.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleAddProduct}
                  disabled={isGenerating || !newProduct.name}
                  className="w-full h-16 md:h-20 bg-emerald-600 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:bg-slate-200"
                >
                  {isGenerating ? 'Gemini Architecting...' : 'Commit to Market Inventory'}
                </button>
              </div>
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
