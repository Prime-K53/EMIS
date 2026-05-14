
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, BrainCircuit } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { chatWithSystem } from '../geminiService';
import { Learner } from '../types';
import { motion } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const Assistant: React.FC = () => {
  const learners = useLiveQuery(() => db.learners.toArray()) || [] as Learner[];
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '1',
      role: 'assistant',
      content: "Authorized Session Established. I am your EMIS Intelligence Layer. I have active indexing over the national school registry and learner databases. How may I assist with your regulatory operations today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const response = await chatWithSystem(input, learners);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response || "Protocol Error: Connection to EMIS Core knowledge base was interrupted.",
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-140px)] flex flex-col erp-card !p-0 overflow-hidden shadow-sm"
    >
      <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden shrink-0">
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-default rounded flex items-center justify-center shadow-lg border border-white/10">
            <BrainCircuit size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold tracking-tight leading-none">EMIS Neural Assistant</h3>
            <div className="flex items-center space-x-2 mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none opacity-80">AI Protocol v3.4 Active</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/10 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5`}>
              <div className={`shrink-0 w-7 h-7 rounded flex items-center justify-center shadow-sm transition-all ${
                msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-primary-default'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
              </div>
              <div className={`p-3.5 rounded-lg text-[13px] leading-relaxed border shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none border-slate-800' 
                  : 'bg-white text-slate-800 rounded-tl-none border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]'
              }`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="max-w-[85%] flex flex-row items-start gap-2.5">
              <div className="shrink-0 w-7 h-7 rounded bg-white border border-slate-200 text-primary-default flex items-center justify-center shadow-sm">
                <Sparkles size={14} className="animate-pulse" />
              </div>
              <div className="p-3 bg-white text-slate-800 rounded-lg rounded-tl-none border border-slate-200 shadow-sm flex space-x-1.5 items-center">
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        <div className="relative group max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query system intelligence or regulatory guidelines..."
            className="erp-input w-full pl-5 pr-12 h-10 !bg-slate-50/50 focus:!bg-white text-[13px]"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center hover:bg-slate-800 transition-all disabled:opacity-20 shadow-sm overflow-hidden"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] font-medium text-center text-slate-400 mt-3 opacity-70">
            System responses are generated via secure inference and may require manual validation.
        </p>
      </div>
    </motion.div>
  );
};

export default Assistant;
