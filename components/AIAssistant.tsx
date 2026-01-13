
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { geminiService } from '../services/geminiService';

interface AIAssistantProps {
  products: Product[];
  onProductSelect: (p: Product) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ products, onProductSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, suggestions?: Product[] }[]>([
    { role: 'ai', text: "Barkanku! I'm the Kayan Miya Market Chef. Looking for fresh Jos tomatoes, aged beef, or stone-free rice? I can help you find exactly what your kitchen needs today." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const [answer, suggestions] = await Promise.all([
        geminiService.answerSupportQuestion(userText, "Kayan Miya is local Nigeria's premier fresh food market. We focus on Jos tomatoes, premium beef, stone-free rice, and local poultry. We offer 24-hour delivery across the region."),
        geminiService.suggestProducts(userText, products)
      ]);

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: answer,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Ina neman gafara (I'm sorry), I'm having a connection issue. Please try asking again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-300">
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm">Market Chef</h3>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Live Market Data
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none'
                }`}>
                  {m.text}
                  {m.suggestions && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended Ingredients</p>
                      {m.suggestions.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => onProductSelect(p)}
                          className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                        >
                          <img src={p.image} className="w-8 h-8 rounded object-cover" alt="" />
                          <div>
                            <p className="text-xs font-bold line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-emerald-600 font-bold">₦{p.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="What are you cooking today?"
                className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      >
        {isOpen ? (
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
        )}
      </button>
    </div>
  );
};

export default AIAssistant;
