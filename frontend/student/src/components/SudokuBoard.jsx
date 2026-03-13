import React from 'react';
import { motion } from 'framer-motion';

const SudokuBoard = () => {
    // 4x4 preview grid for Anti-Gravity aesthetic
    const grid = [
        [1, 2, '', 4],
        ['', 4, 3, ''],
        ['', 1, 4, ''],
        [4, '', 2, 1],
    ];

    return (
        <div className="relative group">
            <motion.div 
                className="glass p-6 rounded-3xl border-slate-200 shadow-sm relative overflow-hidden"
            >
                <h3 className="text-xl font-bold mb-4 text-indigo-900">Holographic Sudoku</h3>
                <div className="grid grid-cols-4 gap-2">
                    {grid.flatMap((row, r) => 
                        row.map((cell, c) => (
                            <motion.div
                                key={`${r}-${c}`}
                                className={`w-12 h-12 flex items-center justify-center rounded-xl border ${cell ? 'bg-indigo-100 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-100'}`}
                                whileHover={{ scale: 1.05, backgroundColor: cell ? '#e0e7ff' : '#f1f5f9' }}
                            >
                                {cell}
                            </motion.div>
                        ))
                    )}
                </div>
                <div className="mt-6 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Level: Calculus Nova</span>
                    <button className="px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                        Play Now
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SudokuBoard;
