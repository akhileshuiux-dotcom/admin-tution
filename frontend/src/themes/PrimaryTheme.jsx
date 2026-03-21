import React from 'react';
import { motion } from 'framer-motion';

const PrimaryTheme = ({ user, children }) => {
  return (
    <div className="min-h-screen bg-[#fffdf0] font-plus-jakarta text-amber-900 transition-colors duration-500 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
            animate={{ 
                y: [0, -40, 0], 
                rotate: [0, 20, -20, 0],
                scale: [1, 1.1, 0.9, 1] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-5%] left-[10%] w-64 h-64 bg-pink-300/30 rounded-full blur-3xl" 
        />
        <motion.div 
            animate={{ 
                y: [0, 50, 0], 
                rotate: [0, -15, 15, 0],
                scale: [1, 0.9, 1.1, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-yellow-300/30 rounded-full blur-[100px]" 
        />
        <motion.div 
            animate={{ 
                x: [0, 30, -30, 0],
                scale: [0.8, 1, 0.8]
            }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-[40%] right-[-5%] w-48 h-48 bg-cyan-300/20 rounded-full blur-[80px]" 
        />
      </div>

      <header className="px-8 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-5">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: [-5, 5, -5] }}
            className="w-16 h-16 bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 rounded-3xl flex items-center justify-center shadow-[0_15px_30px_rgba(244,63,94,0.3)] border-b-8 border-pink-600/20"
          >
            <span className="text-4xl font-black text-white drop-shadow-md">A</span>
          </motion.div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-3xl font-black tracking-tight text-amber-900 leading-none">Aether Kids</h1>
            <span className="text-xs font-black text-amber-600/60 uppercase tracking-widest pl-1">Magic Academy</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white px-6 py-3 rounded-[2rem] shadow-xl border-b-8 border-amber-100/50 flex items-center gap-3"
          >
            <span className="text-3xl drop-shadow-sm">✨</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-amber-600/40 uppercase tracking-tighter leading-none">My Stars</span>
              <span className="text-2xl font-black text-amber-700 leading-tight">{user.points || 0}</span>
            </div>
          </motion.div>
          
          <div className="w-14 h-14 rounded-3xl bg-white border-b-4 border-slate-200 shadow-lg flex items-center justify-center text-3xl hover:scale-105 transition-transform cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
            🦊
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 pb-32 relative z-10 max-w-5xl">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/40 backdrop-blur-3xl rounded-[3.5rem] p-10 shadow-[0_25px_60px_-15px_rgba(251,191,36,0.15)] border-t border-white/50 border-b-8 border-amber-100/30 mb-16 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <span className="text-8xl">🚀</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-10">
                <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-400 rounded-full border-8 border-white shadow-2xl flex items-center justify-center text-6xl relative"
                >
                    <div className="absolute -bottom-2 -right-2 bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-black border-4 border-white">
                        1
                    </div>
                    🦁
                </motion.div>
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-5xl font-black text-amber-900 tracking-tight leading-none">Hi, {user.first_name}!</h2>
                    <p className="text-2xl font-black text-amber-700/60 tracking-tight">Time for another super mission! 🌟</p>
                </div>
            </div>
        </motion.div>
        
        {children}
      </main>
    </div>
  );
};

export default PrimaryTheme;
