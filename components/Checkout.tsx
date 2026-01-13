
import React, { useState } from 'react';
import { CartItem, Order } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  onComplete: (order: Order) => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, total, onComplete, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bani'>('card');
  const [isProcessingBani, setIsProcessingBani] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    card: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'bani') {
      setIsProcessingBani(true);
      // Simulate Bani.africa Widget initialization
      setTimeout(() => {
        const order: Order = {
          id: `BNI-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          items: cart,
          total,
          status: 'pending',
          date: new Date().toISOString(),
          customerName: formData.name || 'Bani Customer',
          paymentMethod: 'bani'
        };
        onComplete(order);
      }, 2500);
    } else {
      const order: Order = {
        id: `CRD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        items: cart,
        total,
        status: 'pending',
        date: new Date().toISOString(),
        customerName: formData.name,
        paymentMethod: 'card'
      };
      onComplete(order);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finalize Acquisition</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">1</span>
                Identity & Logistics
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Legal Name</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-emerald-500/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-emerald-500/10" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile Number</label>
                  <input required type="tel" placeholder="+234..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-emerald-500/10" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Address</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-emerald-500/10" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">2</span>
                Payment Protocol
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('bani')}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 relative overflow-hidden group ${paymentMethod === 'bani' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-black text-slate-900">Bani.africa</div>
                    {paymentMethod === 'bani' && <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mobile Money, Bank Transfer & USSD</p>
                  <div className="flex gap-2 mt-auto">
                    <div className="w-8 h-5 bg-white rounded-sm border border-slate-100 flex items-center justify-center text-[8px] font-black text-emerald-600">Opay</div>
                    <div className="w-8 h-5 bg-white rounded-sm border border-slate-100 flex items-center justify-center text-[8px] font-black text-emerald-600">PalmP</div>
                    <div className="w-8 h-5 bg-white rounded-sm border border-slate-100 flex items-center justify-center text-[8px] font-black text-emerald-600">Bank</div>
                  </div>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 relative overflow-hidden group ${paymentMethod === 'card' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-black text-slate-900">Global Card</div>
                    {paymentMethod === 'card' && <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visa, Mastercard, Verve</p>
                  <div className="flex gap-2 mt-auto">
                    <div className="w-8 h-5 bg-slate-200 rounded-sm" />
                    <div className="w-8 h-5 bg-slate-300 rounded-sm" />
                  </div>
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Secure Card Data</label>
                    <input required type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-slate-900/5" value={formData.card} onChange={e => setFormData({...formData, card: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expiry Date</label>
                      <input required type="text" placeholder="MM / YY" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-slate-900/5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Security Code</label>
                      <input required type="text" placeholder="CVV" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-slate-900/5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem] text-center animate-in fade-in duration-300">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                   </div>
                   <h4 className="font-black text-emerald-900 mb-2">Bani.africa Dynamic Checkout</h4>
                   <p className="text-sm text-emerald-700 leading-relaxed">
                     A secure payment session will be initialized on the next step. You can pay via Mobile Money, Bank Transfer, or USSD.
                   </p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isProcessingBani}
              className={`w-full h-[80px] rounded-[2rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-4 ${
                paymentMethod === 'bani' 
                ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' 
                : 'bg-slate-900 text-white shadow-slate-200 hover:bg-emerald-600'
              } disabled:bg-slate-300 disabled:shadow-none`}
            >
              {isProcessingBani ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Initializing Bani Rail...
                </>
              ) : (
                <>
                  Commit Transaction - ₦{total.toLocaleString()}
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-900 text-lg mb-6">Inventory Summary</h3>
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 line-clamp-1">{item.quantity}x {item.name}</span>
                  </div>
                  <span className="font-black text-slate-900 text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Logistics</span>
                <span className="text-emerald-600">Complimentary</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-slate-900 pt-4">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
              Enterprise-grade encryption active. Your session is protected by Kayan Miya's high-fidelity security protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
