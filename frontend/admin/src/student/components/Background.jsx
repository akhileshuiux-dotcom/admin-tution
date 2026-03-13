import React from 'react';
import { motion } from 'framer-motion';

const Background = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#fafafa]">
            {/* Dynamic Ambient Glows */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[120px]" 
            />
            <motion.div 
                animate={{ 
                    scale: [1, 1.3, 1],
                    x: [0, -50, 0],
                    y: [0, -40, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-50/40 rounded-full blur-[140px]" 
            />
            <motion.div 
                animate={{ 
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute top-[30%] left-[40%] w-64 h-64 bg-purple-50/30 rounded-full blur-[100px]" 
            />
            
            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
    );
};

export default Background;
