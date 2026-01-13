
import React, { useState, useEffect } from 'react';
import { CartItem, Order } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  onComplete: (order: Order) => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, total, onComplete, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bani'>('bani');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBaniWidget, setShowBaniWidget] = useState(false);
  const [baniStep, setBaniStep] = useState<'method' | 'processing' | 'virtual_account' | 'verifying'>('method');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Mock virtual account data
  const virtualAccount = {
    bank: 'Sterling Bank (Bani/Kayan Miya)',
    accountNumber: '7829402118',
    expiryMinutes: 10
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (paymentMethod === 'bani') {
      // Initialize Bani Rail
      setTimeout(() => {
        setIsProcessing(false);
        setShowBaniWidget(true);
        setBaniStep('processing');
        
        // Progress to Virtual Account after "connecting"
        setTimeout(() => setBaniStep('virtual_account'), 1500);
      }, 1000);
    } else {
      // Simulate Card Processing
      setTimeout(() => {
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
      }, 2000);
    }
  };

  const handleVerifyBani = () => {
    setBaniStep('verifying');
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
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">1</span>
                Logistics & Identity
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
                  <input required type="tel" placeholder="+234..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-emerald-500/10" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
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
                Payment Rails
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
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pay via Bank Transfer or USSD</p>
                  <div className="flex gap-2 mt-auto">
                    <img src="https://bani.africa/favicon.ico" className="w-4 h-4 rounded-full grayscale opacity-50" alt="" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase">Local Rails Active</span>
                  </div>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 relative overflow-hidden group ${paymentMethod === 'card' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-black text-slate-900">Card Rail</div>
                    {paymentMethod === 'card' && <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visa, Mastercard, Verve</p>
                  <div className="flex gap-2 mt-auto">
                    <div className="w-6 h-4 bg-slate-200 rounded-sm" />
                    <div className="w-6 h-4 bg-slate-300 rounded-sm" />
                  </div>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Card Information</label>
                    <input required type="text" placeholder="0000 0000 0000 0000" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <input required type="text" placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium" />
                    <input required type="text" placeholder="CVV" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium" />
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className={`w-full h-[80px] rounded-[2rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-4 ${
                paymentMethod === 'bani' 
                ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' 
                : 'bg-slate-900 text-white shadow-slate-200 hover:bg-emerald-600'
              } disabled:bg-slate-300 disabled:shadow-none`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Initializing Rail...
                </>
              ) : (
                <>
                  {paymentMethod === 'bani' ? 'Pay with Bani.africa' : 'Complete Purchase'}
                  <span className="text-white/50">|</span>
                  ₦{total.toLocaleString()}
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
                    <span className="text-sm font-bold text-slate-700">{item.quantity}x {item.name}</span>
                  </div>
                  <span className="font-black text-slate-900 text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex justify-between text-2xl font-black text-slate-900">
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

      {/* Bani.africa Widget Overlay */}
      {showBaniWidget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Widget Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
                   <img src="https://bani.africa/favicon.ico" className="w-5 h-5 invert brightness-0" alt="" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Bani.africa Checkout</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure Local Rail</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBaniWidget(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Widget Content */}
            <div className="p-8">
              {baniStep === 'processing' && (
                <div className="text-center py-12 space-y-6">
                   <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
                   <div>
                     <h3 className="text-xl font-black text-slate-900">Connecting to Rail...</h3>
                     <p className="text-slate-500 text-sm">Securing a local virtual account for your transaction.</p>
                   </div>
                </div>
              )}

              {baniStep === 'virtual_account' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Transfer Exactly</p>
                      <h2 className="text-3xl font-black text-slate-900">₦{total.toLocaleString()}</h2>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank</p>
                            <p className="font-bold text-slate-900">{virtualAccount.bank}</p>
                         </div>
                         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                         </div>
                      </div>

                      <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</p>
                            <p className="text-2xl font-black text-slate-900 tracking-wider">{virtualAccount.accountNumber}</p>
                         </div>
                         <button 
                           onClick={() => navigator.clipboard.writeText(virtualAccount.accountNumber)}
                           className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                         >
                            Copy
                         </button>
                      </div>
                   </div>

                   <div className="text-center space-y-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Expires in <span className="text-blue-600">09:52</span> minutes<br/>
                        Automated verification active.
                      </p>
                      <button 
                        onClick={handleVerifyBani}
                        className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-100"
                      >
                        I have made the transfer
                      </button>
                   </div>
                </div>
              )}

              {baniStep === 'verifying' && (
                <div className="text-center py-12 space-y-6">
                   <div className="relative inline-block">
                      <div className="w-20 h-20 border-4 border-blue-100 border-t-emerald-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <svg className="w-8 h-8 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                      </div>
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">Verifying Settlement...</h3>
                     <p className="text-slate-500 text-sm">Our rail is polling the CBN network for your credit.</p>
                   </div>
                </div>
              )}
            </div>

            {/* Widget Footer */}
            <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
               <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Powered by Bani.africa Settlement Engine</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
