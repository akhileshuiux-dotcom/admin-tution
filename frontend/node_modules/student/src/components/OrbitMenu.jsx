import React from 'react';
import { motion } from 'framer-motion';
import { Home, Rocket, Gamepad2, User, LogOut } from 'lucide-react';

const OrbitMenu = ({ activeView, onViewChange, onLogout }) => {
    const items = [
        { id: 'dashboard', icon: <Home className="w-6 h-6" />, label: 'Dashboard' },
        { id: 'classes', icon: <Rocket className="w-6 h-6" />, label: 'Classes' },
        { id: 'sudoku', icon: <Gamepad2 className="w-6 h-6" />, label: 'Sudoku' },
        { id: 'profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
        { id: 'logout', icon: <LogOut className="w-6 h-6 text-rose-400" />, label: 'Logout' },
    ];

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            <motion.div 
                className="glass px-8 py-4 rounded-full flex gap-10 items-center border-slate-200 shadow-lg transition-all duration-300"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
            >
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        onClick={() => item.id === 'logout' ? onLogout() : onViewChange(item.id)}
                        className={`group relative flex flex-col items-center cursor-pointer transition-colors ${
                            activeView === item.id ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'
                        }`}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {item.icon}
                        <span className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-3 py-1 rounded-lg text-white text-xs whitespace-nowrap pointer-events-none shadow-md">
                            {item.label}
                        </span>
                        {activeView === item.id && (
                            <motion.div 
                                layoutId="active"
                                className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full"
                            />
                        )}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default OrbitMenu;
