import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Star, Sparkles, Rocket, Ghost, Heart } from 'lucide-react';

const PrimaryTheme = ({ user, children, onLogout, onNavigate, currentView }) => {
  return (
    <div className="min-h-screen bg-[#FFFBEB] text-amber-900 transition-colors duration-500 overflow-x-hidden font-plus-jakarta">
      {/* ── Playful Background Elements ─────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
            animate={{ y: [0, -40, 0], rotate: [0, 20, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[5%] left-[5%] text-rose-500/10"
        >
            <Heart size={200} fill="currentColor" />
        </motion.div>
        <motion.div 
            animate={{ x: [0, 50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-[20%] right-[10%] text-amber-500/10"
        >
            <Star size={300} fill="currentColor" />
        </motion.div>
        <motion.div 
            animate={{ y: [0, 100, 0], x: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-[30%] right-[5%] text-sky-500/10"
        >
            <Cloud size={250} fill="currentColor" />
        </motion.div>
      </div>

      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <header className="px-10 py-10 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
            className="w-20 h-20 bg-gradient-to-br from-rose-400 via-orange-400 to-amber-400 rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(244,63,94,0.3)] border-b-8 border-rose-600/30 ring-8 ring-white"
          >
            <span className="text-4xl font-black text-white drop-shadow-xl">A</span>
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tight text-amber-950 leading-none">Aether Kids</h1>
            <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-amber-200/50 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest">Magic Academy</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <motion.div 
            whileHover={{ y: -5, scale: 1.05 }}
            className="bg-white px-8 py-4 rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] border-b-8 border-slate-100 flex items-center gap-4 transition-all"
          >
            <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Star className="w-6 h-6 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest leading-none">Stars Won</span>
              <span className="text-3xl font-black text-amber-900 leading-tight">{user?.points || 1240}</span>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 rounded-[1.8rem] bg-white border-b-8 border-slate-100 shadow-xl flex items-center justify-center relative overflow-hidden ring-4 ring-white"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-transparent" />
            <span className="text-4xl relative z-10">🐼</span>
          </motion.div>
        </div>
      </header>

      {/* ── Content Canvas ─────────────────────────────────────────────────── */}
      <main className="container mx-auto px-10 pb-40 relative z-10 max-w-6xl">
        
        {/* Welcome Message Hero */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-3xl rounded-[4rem] p-12 shadow-[0_30px_80px_-20px_rgba(251,191,36,0.2)] border border-white border-b-[12px] border-amber-100/50 mb-20 relative overflow-hidden group"
        >
            <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-50px] right-[-50px] opacity-10"
            >
                <Sparkles size={200} className="text-amber-500" />
            </motion.div>
            
            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                <motion.div 
                   animate={{ y: [0, -15, 0] }}
                   transition={{ duration: 5, repeat: Infinity }}
                   className="w-40 h-40 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-full ring-[12px] ring-white shadow-2xl flex items-center justify-center text-7xl relative"
                >
                    <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black border-[6px] border-white shadow-lg">
                        9
                    </div>
                    🦁
                </motion.div>
                <div className="text-center lg:text-left">
                    <h2 className="text-6xl font-black text-amber-950 tracking-tight leading-none mb-4">Hello, {user?.first_name}!</h2>
                    <p className="text-3xl font-bold text-amber-700/60 tracking-tight flex items-center justify-center lg:justify-start gap-4">
                        Ready for a new adventure? <Rocket className="w-8 h-8 text-rose-400 animate-bounce" />
                    </p>
                </div>
            </div>
        </motion.div>
        
        {/* Children View Content */}
        <div className="animate-fade-in-up">
            {children}
        </div>
      </main>

      {/* ── Footer Navigation Help ────────────────────────────────────────── */}
      <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
          <motion.div 
             whileHover={{ y: -5 }}
             className="bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-6 border-b-8 border-black"
          >
             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                 <Ghost className="w-6 h-6 text-sky-300" />
             </div>
             <p className="text-[14px] font-black uppercase tracking-widest">Assistant Ghosty is online</p>
          </motion.div>
          
          <button 
            onClick={onLogout}
            className="bg-rose-500 text-white px-6 py-2 rounded-full font-bold text-xs shadow-lg hover:bg-rose-600 transition-colors"
          >
            Log out
          </button>
      </footer>
    </div>
  );
};

export default PrimaryTheme;
