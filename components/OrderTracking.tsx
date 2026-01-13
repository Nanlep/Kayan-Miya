
import React, { useState, useEffect } from 'react';
import { Order } from '../types';

interface OrderTrackingProps {
  orders: Order[];
  initialId: string;
  onBack: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orders, initialId, onBack }) => {
  const [searchId, setSearchId] = useState(initialId);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialId) {
      handleSearch();
    }
  }, [initialId]);

  const handleSearch = () => {
    const trimmed = searchId.trim().toUpperCase();
    const match = orders.find(o => o.id === trimmed);
    setFoundOrder(match || null);
    setHasSearched(true);
  };

  const getStatusStep = (status: string) => {
    switch(status) {
      case 'pending': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight text-emerald-800">Delivery Verification</h1>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Enter Market Order ID</label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g., BNI-X4P2A1"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-black text-slate-900 uppercase placeholder:normal-case placeholder:font-medium"
          />
          <button 
            onClick={handleSearch}
            className="bg-emerald-600 text-white px-10 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
          >
            Locate Package
          </button>
        </div>
      </div>

      {hasSearched && foundOrder ? (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Protocol Active</span>
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">Order #{foundOrder.id}</h2>
                  <p className="text-slate-500 font-medium">Acquired on {new Date(foundOrder.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
               </div>
               <div className="flex flex-col items-end">
                  <span className={`px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest ${
                    foundOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                    foundOrder.status === 'shipped' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {foundOrder.status}
                  </span>
               </div>
            </div>

            {/* Visual Timeline */}
            <div className="relative mb-16">
               <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2" />
               <div className={`absolute top-1/2 left-0 h-1 bg-emerald-600 -translate-y-1/2 transition-all duration-1000`} style={{ width: `${(getStatusStep(foundOrder.status) - 1) * 50}%` }} />
               
               <div className="relative flex justify-between">
                  {[
                    { label: 'Confirmed', icon: '🛒', step: 1 },
                    { label: 'In Transit', icon: '🚚', step: 2 },
                    { label: 'Delivered', icon: '🏠', step: 3 }
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl z-10 transition-all duration-500 ${
                        getStatusStep(foundOrder.status) >= s.step ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-110' : 'bg-white border-2 border-slate-100 text-slate-300'
                      }`}>
                        {s.icon}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusStep(foundOrder.status) >= s.step ? 'text-slate-900' : 'text-slate-300'}`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                  <h3 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-900 rounded-full" />
                    Package Inventory
                  </h3>
                  <div className="space-y-4">
                    {foundOrder.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                            <div>
                               <p className="text-sm font-black text-slate-900">{item.name}</p>
                               <p className="text-[10px] font-bold text-slate-400">Qty: {item.quantity}</p>
                            </div>
                         </div>
                         <span className="font-bold text-slate-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="space-y-8">
                  <div>
                    <h3 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 bg-slate-900 rounded-full" />
                      Logistics Data
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</span>
                          <span className="text-sm font-bold text-slate-900">{foundOrder.customerName}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement</span>
                          <span className="text-sm font-bold text-emerald-600">{foundOrder.paymentMethod === 'bani' ? 'Bani.africa Rail' : 'Global Card'}</span>
                       </div>
                       <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Value</span>
                          <span className="text-xl font-black text-slate-900">₦{foundOrder.total.toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                       <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                    </div>
                    <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                      This order is protected by our Market Logistics Guarantee. If your produce does not arrive within the 24hr window, contact Market Chef immediately.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-200 animate-in fade-in duration-500">
           <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">Order Not Identified</h3>
           <p className="text-slate-500 mb-8 max-w-sm mx-auto">We couldn't find an order matching that ID in our market registry. Please verify the identifier and try again.</p>
           <button 
             onClick={() => window.location.reload()} 
             className="text-emerald-600 font-black uppercase text-xs tracking-widest hover:text-emerald-700 flex items-center gap-2 mx-auto"
           >
              Try Different Identifier
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
           </button>
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-[3rem] opacity-50">
           <svg className="w-16 h-16 text-slate-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
           </svg>
           <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Awaiting Market Identifier Input</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
