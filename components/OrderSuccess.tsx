
import React from 'react';
import { Order } from '../types';

interface OrderSuccessProps {
  order: Order;
  onDismiss: () => void;
  onTrack: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ order, onDismiss, onTrack }) => {
  return (
    <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="max-w-xl w-full text-center space-y-8 animate-in zoom-in-95 duration-700 delay-100">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 scale-125">
            <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white animate-bounce">
             <span className="text-xs font-bold">!</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Nasara!</h1>
          <p className="text-slate-500 text-lg">Thank you, {order.customerName}. Order #{order.id} is now processing.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-left">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction Verified</span>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${order.paymentMethod === 'bani' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
              via {order.paymentMethod === 'bani' ? 'Bani.africa Rail' : 'Global Card Rail'}
            </span>
          </div>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-4 custom-scrollbar">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <img src={item.image} className="w-10 h-10 rounded-lg object-cover border border-white shadow-sm" alt="" />
                   <span className="font-bold text-slate-800 text-sm">{item.quantity}x {item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end">
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Path</p>
               <p className="font-bold text-emerald-600">{order.paymentMethod === 'bani' ? 'Mobile Money / Transfer' : 'Credit / Debit Card'}</p>
             </div>
             <p className="text-2xl font-black text-slate-900">₦{order.total.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onTrack}
            className="flex-1 bg-emerald-600 text-white h-16 rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
          >
            Track Delivery
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button 
            onClick={onDismiss}
            className="flex-1 bg-slate-900 text-white h-16 rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
