
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

  const [copied, setCopied] = useState(false);

  // Mock virtual account data
  const virtualAccount = {
    bank: 'Sterling Bank (Bani/Kayan Miya)',
    accountNumber: '7829402118',
    expiryMinutes: 10
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(virtualAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (paymentMethod === 'bani') {
      // Simulate Rail Initialization
      setTimeout(() => {
        setIsProcessing(false);
        setShowBaniWidget(true);
        setBaniStep('processing');
        setTimeout(() => setBaniStep('virtual_account'), 1500);
      }, 1000);
    } else {
      // Card Path
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
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20 px-4">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Acquisition Protocol</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <section>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">1</span>
                Logistics Data
              </h3>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Recipient Name</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-emerald-500/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Email</label>
                  <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-emerald-500/10" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile (WhatsApp Enabled)</label>
                  <input required type="tel" placeholder="+234" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-emerald-500/10" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Shipping Address</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium focus:ring-4 focus:ring-emerald-500/10" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">2</span>
                Settlement Channel
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
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bank Transfer & USSD Rail</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Verified Local Settlement</span>
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
                  <div className="flex gap-1.5 mt-auto">
                    <div className="w-6 h-4 bg-slate-200 rounded-sm" />
                    <div className="w-6 h-4 bg-slate-300 rounded-sm" />
                  </div>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Card Secure Data</label>
                    <input required type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium" />
                    <input required type="text" placeholder="CVV" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-medium" />
                  </div>
                </div>
              )}
            </section>

            <button 
              type="submit" 
              disabled={isProcessing}
              className={`w-full h-16 md:h-20 rounded-[2rem] font-black text-lg md:text-xl transition-all shadow-2xl flex items-center justify-center gap-4 ${
                paymentMethod === 'bani' 
                ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' 
                : 'bg-slate-900 text-white shadow-slate-200 hover:bg-emerald-600'
              } disabled:bg-slate-300 disabled:shadow-none active:scale-95`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Securing Rail...
                </>
              ) : (
                <>
                  {paymentMethod === 'bani' ? 'Initialize Bani.africa Transfer' : 'Commit Acquisition'}
                  <span className="text-white/30 font-light">|</span>
                  ₦{total.toLocaleString()}
                </>
              )}
            </button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-24">
            <h3 className="font-black text-slate-900 text-lg mb-6">Inventory Summary</h3>
            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-600 truncate mr-4">{item.quantity}x {item.name}</span>
                  <span className="font-black text-slate-900 shrink-0">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-bold text-slate-900">₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Logistics</span>
                <span className="text-xs font-black text-emerald-600 uppercase">Complimentary</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-slate-900">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-blue-500">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
            <p className="text-[10px] text-blue-800 leading-relaxed font-bold uppercase tracking-tight">
              Kayan Miya uses enterprise encryption. No sensitive card or bank data is stored on local servers.
            </p>
          </div>
        </aside>
      </div>

      {/* Bani.africa Widget Overlay */}
      {showBaniWidget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            {/* Widget Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                   <img src="https://bani.africa/favicon.ico" className="w-5 h-5 invert brightness-0" alt="Bani" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Bani.africa Checkout</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Active Settlement Node</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowBaniWidget(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors group"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Widget Content */}
            <div className="p-6 md:p-8">
              {baniStep === 'processing' && (
                <div className="text-center py-12 space-y-6">
                   <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
                   <div>
                     <h3 className="text-xl font-black text-slate-900">Initializing Payment Rail</h3>
                     <p className="text-slate-500 text-sm max-w-[200px] mx-auto">Please do not refresh your browser while we sync with the banking network.</p>
                   </div>
                </div>
              )}

              {baniStep === 'virtual_account' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="bg-blue-50/80 p-6 rounded-3xl border border-blue-100 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                        <img src="https://bani.africa/favicon.ico" className="w-12 h-12" alt="" />
                      </div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Settlement Required</p>
                      <h2 className="text-3xl font-black text-slate-900">₦{total.toLocaleString()}</h2>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receiving Bank</p>
                            <p className="font-black text-slate-900 text-sm">{virtualAccount.bank}</p>
                         </div>
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                         </div>
                      </div>

                      <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Temporary Account</p>
                            <p className="text-2xl font-black text-slate-900 tracking-wider font-mono">{virtualAccount.accountNumber}</p>
                         </div>
                         <button 
                           onClick={handleCopy}
                           className={`transition-all px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                             copied ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                           }`}
                         >
                            {copied ? 'Copied!' : 'Copy'}
                         </button>
                      </div>
                   </div>

                   <div className="text-center space-y-6">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                          Awaiting Transfer Verification
                        </p>
                      </div>
                      
                      <button 
                        onClick={handleVerifyBani}
                        className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-100 active:scale-95"
                      >
                        Confirm Transaction Execution
                      </button>
                   </div>
                </div>
              )}

              {baniStep === 'verifying' && (
                <div className="text-center py-12 space-y-8">
                   <div className="relative inline-block">
                      <div className="w-24 h-24 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                            <img src="https://bani.africa/favicon.ico" className="w-8 h-8 opacity-40" alt="" />
                         </div>
                      </div>
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-900">Verifying Settlement</h3>
                     <p className="text-slate-500 text-sm mt-2">Checking bank networks for your transfer of ₦{total.toLocaleString()}.</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 inline-flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Polling Bank Network</span>
                   </div>
                </div>
              )}
            </div>

            {/* Widget Footer */}
            <div className="p-5 bg-slate-50 text-center border-t border-slate-100 flex items-center justify-center gap-2">
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Infrastructure by Bani.africa</span>
               <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center border border-slate-200">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
