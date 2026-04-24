import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, AlertTriangle } from 'lucide-react';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20"
          >
            <div className="p-10 flex flex-col items-center text-center gap-8">
              <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/10">
                <LogOut size={40} />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Sign Out</h3>
                <p className="text-slate-500 text-sm font-bold leading-relaxed px-4">
                  Are you sure you want to terminate your administrative session? You will need to re-authenticate to access the nexus.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  Stay Connected
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
                >
                  Secure Logout
                </button>
              </div>

              <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 rounded-2xl border border-amber-100 mt-2">
                 <AlertTriangle size={14} className="text-amber-600" />
                 <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Unsaved changes will be lost</span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmationModal;
