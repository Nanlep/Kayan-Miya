
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';

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
  }, [initialId, orders]);

  const handleSearch = () => {
    const trimmed = searchId.trim().toUpperCase();
    const match = orders.find(o => o.id === trimmed);
    setFoundOrder(match || null);
    setHasSearched(true);
  };

  const getStatusStep = (status: OrderStatus) => {
    switch(status) {
      case 'pending': return 1;
      case 'dispatched': return 2;
      case 'shipped': return 3;
      case 'arrived': return 4;
      case 'delivered': return 5;
      default: return 1;
    }
  };

  const milestones = [
    { label: 'Confirmed', icon: '🛒', step: 1, sub: 'Order Processed' },
    { label: 'Dispatched', icon: '📦', step: 2, sub: 'Left Warehouse' },
    { label: 'In Transit', icon: '🚚', step: 3, sub: 'Moving to Hub' },
    { label: 'Arrived', icon: '📍', step: 4, sub: 'At Local Depot' },
    { label: 'Delivered', icon: '🏠', step: 5, sub: 'Handover Complete' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20 px-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight text-emerald-800">Delivery Verification</h1>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
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
            className="bg-emerald-600 text-white px-10 h-14 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
          >
            Locate Package
          </button>
        </div>
      </div>

      {hasSearched && foundOrder ? (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="bg-white p-6 md:p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Protocol Active</span>
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">Order #{foundOrder.id}</h2>
                  <p className="text-slate-500 font-medium">Logistics handshake initiated on {new Date(foundOrder.date).toLocaleDateString()}</p>
               </div>
               <div className="bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100 text-center min-w-[180px]">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Estimated Arrival</p>
                  <p className="text-xl font-black text-slate-900">Within 24 Hours</p>
               </div>
            </div>

            {/* Granular Milestone Tracker */}
            <div className="relative mb-20 px-4">
               <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 -translate-y-1/2" />
               <div 
                 className="absolute top-6 left-0 h-1 bg-emerald-600 -translate-y-1/2 transition-all duration-1000" 
                 style={{ width: `${((getStatusStep(foundOrder.status) - 1) / 4) * 100}%` }} 
               />
               
               <div className="relative flex justify-between">
                  {milestones.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl z-10 transition-all duration-500 ${
                        getStatusStep(foundOrder.status) >= s.step 
                          ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-110' 
                          : 'bg-white border-2 border-slate-100 text-slate-300'
                      }`}>
                        {getStatusStep(foundOrder.status) === s.step ? (
                          <span className="animate-pulse">{s.icon}</span>
                        ) : s.icon}
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] font-black uppercase tracking-tight ${getStatusStep(foundOrder.status) >= s.step ? 'text-slate-900' : 'text-slate-300'}`}>
                          {s.label}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase hidden sm:block">{s.sub}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                  <h3 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-900 rounded-full" />
                    Live Logistics Ledger
                  </h3>
                  <div className="space-y-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Current Node</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase animate-pulse">Live</span>
                      </div>
                      <p className="font-black text-slate-900">{foundOrder.logistics?.lastLocation || 'Kayan Miya Fulfillment Center'}</p>
                    </div>
                    {foundOrder.logistics?.dispatchedAt && (
                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 opacity-60">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Dispatched Date</span>
                        <p className="font-bold text-slate-700 text-xs">{new Date(foundOrder.logistics.dispatchedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-40">Recipient Data</h4>
                    <div className="space-y-4">
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-tighter opacity-50 mb-1">Customer Name</p>
                          <p className="font-bold text-sm">{foundOrder.customerName}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-tighter opacity-50 mb-1">Settlement Method</p>
                          <p className="font-bold text-sm text-emerald-400">{foundOrder.paymentMethod === 'bani' ? 'Bani.africa Rail' : 'Global Card'}</p>
                       </div>
                       <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                          <p className="text-xl font-black">₦{foundOrder.total.toLocaleString()}</p>
                          <span className="text-[9px] font-black uppercase opacity-40">Total Value Verified</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-200">
           <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">Registry Mismatch</h3>
           <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">The identifier provided does not exist in our market logistics database. Please contact support if this is an error.</p>
           <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Try Again</button>
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-[3rem] opacity-50 bg-white/50">
           <svg className="w-16 h-16 text-slate-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
           </svg>
           <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Awaiting Active Market ID Verification</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
