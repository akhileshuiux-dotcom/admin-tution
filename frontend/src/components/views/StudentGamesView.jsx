import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Brain, Calculator, Target, Globe, Play, X, Trophy, ArrowLeft, Lock, CheckCircle, Star, Lightbulb } from 'lucide-react';

// ─────────────────────────────────────────────
//  CATEGORIES
// ─────────────────────────────────────────────
const CATEGORIES_1_6 = [
  { id: 'puzzle', name: 'Puzzle Games', icon: Target, color: 'bg-emerald-50 text-emerald-600', borderColor: 'border-emerald-200' },
  { id: 'basic_math', name: 'Basic Math Games', icon: Calculator, color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-200' },
  { id: 'memory', name: 'Memory Games', icon: Brain, color: 'bg-indigo-50 text-indigo-600', borderColor: 'border-indigo-200' },
  { id: 'gk_basics', name: 'GK Basics', icon: Globe, color: 'bg-orange-50 text-orange-600', borderColor: 'border-orange-200' }
];

const CATEGORIES_7_12 = [
  { id: 'sudoku', name: 'Sudoku', icon: Target, color: 'bg-emerald-50 text-emerald-600', borderColor: 'border-emerald-200' },
  { id: 'math_logic', name: 'Mathematical Logic', icon: Calculator, color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-200' },
  { id: 'mind_advanced', name: 'Mind Games', icon: Brain, color: 'bg-indigo-50 text-indigo-600', borderColor: 'border-indigo-200' },
  { id: 'gk_advanced', name: 'Advanced GK', icon: Globe, color: 'bg-orange-50 text-orange-600', borderColor: 'border-orange-200' }
];

// ─────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────
export const seedRNG = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const shuffleWithSeed = (array, seed) => {
  const rng = seedRNG(seed);
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// ─────────────────────────────────────────────
//  LEVEL GENERATORS  (Now 5 Levels)
// ─────────────────────────────────────────────
const genLevels1_6 = (levelsData = []) => {
  const diffs = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Extreme'];
  return diffs.map((diff, idx) => ({
    level: idx + 1,
    difficulty: diff,
    status: levelsData[idx]?.status || 'Not Started',
    score: levelsData[idx]?.score || 0,
    locked: levelsData[idx]?.locked ?? (idx > 0)
  }));
};

const genLevels7_12 = (levelsData = []) => {
  const diffs = ['Medium', 'Hard', 'Advanced', 'Expert', 'Master'];
  return diffs.map((diff, idx) => ({
    level: idx + 1,
    difficulty: diff,
    status: levelsData[idx]?.status || 'Not Started',
    score: levelsData[idx]?.score || 0,
    locked: levelsData[idx]?.locked ?? (idx > 0)
  }));
};

// ─────────────────────────────────────────────
//  MOCK GAME DATA
// ─────────────────────────────────────────────
const injectState = (games) => {
  const next = { ...games };
  for (const cat of Object.keys(next)) {
    next[cat] = next[cat].map(g => ({ ...g, cycle: 1, completedAt: null }));
  }
  return next;
};

const buildInitialGames1_6 = () => injectState({
  'puzzle': [
    {
      id: 'p1',
      name: 'Match the Shapes',
      desc: 'Find the correct shape to complete the puzzle.',
      levels: genLevels1_6([
        { status: 'Completed', score: 100, locked: false },
        { status: 'In Progress', score: 40, locked: false },
        { status: 'Not Started', score: 0, locked: true },
        { status: 'Not Started', score: 0, locked: true }   // NEW — Level 4 Hard
      ])
    },
    {
      id: 'p2',
      name: 'Simple Sudoku (4x4 only)',
      desc: 'Learn the basics of Sudoku with 4x4 grids.',
      levels: genLevels1_6([
        { status: 'Completed', score: 120, locked: false },
        { status: 'Completed', score: 200, locked: false },
        { status: 'Not Started', score: 0, locked: false },
        { status: 'Not Started', score: 0, locked: true }
      ])
    }
  ],
  'basic_math': [
    { id: 'bm1', name: 'Number Counting Game', desc: 'Count the items on the screen to progress.', levels: genLevels1_6([{ status: 'In Progress', score: 10, locked: false }]) },
    { id: 'bm2', name: 'Addition & Subtraction Quiz', desc: 'Learn to add and subtract quickly.', levels: genLevels1_6([]) }
  ],
  'memory': [
    { id: 'mem1', name: 'Memory Card Match', desc: 'Flip and match the cards to test your memory.', levels: genLevels1_6([]) }
  ],
  'gk_basics': [
    { id: 'gkb1', name: 'Alphabet & Word Game', desc: 'Learn the ABCs and construct basic words.', levels: genLevels1_6([]) }
  ]
});

const buildInitialGames7_12 = () => injectState({
  'sudoku': [
    { id: 's1', name: 'Sudoku (6x6, 9x9)', desc: 'Solve complex 6x6 and 9x9 logic grids.', levels: genLevels7_12([{ status: 'Completed', score: 500, locked: false }, { status: 'Not Started', score: 0, locked: false }]) }
  ],
  'math_logic': [
    { id: 'ml1', name: 'Algebra Puzzle', desc: 'Solve algebraic equations to unlock patterns.', levels: genLevels7_12([]) },
    { id: 'ml2', name: 'Speed Math Challenge', desc: 'Test your calculation speed against the clock.', levels: genLevels7_12([]) }
  ],
  'mind_advanced': [
    { id: 'ma1', name: 'Logical Reasoning Quiz', desc: 'Tricky logic puzzles to test your deductions.', levels: genLevels7_12([{ status: 'In Progress', score: 150, locked: false }]) },
    { id: 'ma2', name: 'Pattern Solving Game', desc: 'Identify complex visual and numerical patterns.', levels: genLevels7_12([]) }
  ],
  'gk_advanced': [
    { id: 'gka1', name: 'Advanced GK Quiz', desc: 'Deep dive into History, Geography, and Science.', levels: genLevels7_12([]) }
  ]
});

// ─────────────────────────────────────────────
//  SHAPE DATASETS per Level (for "Match the Shapes")
// ─────────────────────────────────────────────
// Each puzzle: a "prompt" shape and 4 options, one correct.
// Shape is rendered as SVG inline so no assets needed.

const ShapeSVG = ({ shape, size = 56, color = '#6366f1', rotate = 0, opacity = 1 }) => {
  const s = size;
  const c = s / 2;
  const style = { display: 'block', transform: `rotate(${rotate}deg)`, opacity };
  switch (shape) {
    case 'circle':
      return <svg width={s} height={s} style={style}><circle cx={c} cy={c} r={c - 4} fill={color} /></svg>;
    case 'oval':
      return <svg width={s} height={s * 0.65} style={style}><ellipse cx={s / 2} cy={s * 0.65 / 2} rx={c - 4} ry={s * 0.65 / 2 - 4} fill={color} /></svg>;
    case 'square':
      return <svg width={s} height={s} style={style}><rect x={4} y={4} width={s - 8} height={s - 8} fill={color} /></svg>;
    case 'rectangle':
      return <svg width={s} height={s * 0.6} style={style}><rect x={4} y={4} width={s - 8} height={s * 0.6 - 8} fill={color} /></svg>;
    case 'triangle':
      return <svg width={s} height={s} style={style}><polygon points={`${c},4 ${s - 4},${s - 4} 4,${s - 4}`} fill={color} /></svg>;
    case 'star':
      return (
        <svg width={s} height={s} style={style} viewBox="0 0 100 100">
          <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={color} />
        </svg>
      );
    case 'pentagon':
      return (
        <svg width={s} height={s} style={style} viewBox="0 0 100 100">
          <polygon points="50,5 95,36 76,91 24,91 5,36" fill={color} />
        </svg>
      );
    case 'hexagon':
      return (
        <svg width={s} height={s} style={style} viewBox="0 0 100 100">
          <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill={color} />
        </svg>
      );
    case 'diamond':
      return <svg width={s} height={s} style={style}><polygon points={`${c},4 ${s - 4},${c} ${c},${s - 4} 4,${c}`} fill={color} /></svg>;
    case 'trapezoid':
      return (
        <svg width={s} height={s * 0.7} style={style}>
          <polygon points={`${s * 0.15},${s * 0.7 - 4} ${s - s * 0.15},${s * 0.7 - 4} ${s - 10},4 10,4`} fill={color} />
        </svg>
      );
    default:
      return <svg width={s} height={s} style={style}><circle cx={c} cy={c} r={c - 4} fill={color} /></svg>;
  }
};

// Puzzle definitions per level  (promptShape | options[] | correct index)
const LEVEL_PUZZLES = {
  1: [
    { id: 1, prompt: { shape: 'circle' }, options: ['circle', 'square', 'triangle', 'diamond'], correct: 0, rotates: [0, 0, 0, 0] },
    { id: 2, prompt: { shape: 'square' }, options: ['triangle', 'square', 'circle', 'star'], correct: 1, rotates: [0, 0, 0, 0] },
    { id: 3, prompt: { shape: 'triangle' }, options: ['diamond', 'circle', 'triangle', 'square'], correct: 2, rotates: [0, 0, 0, 0] },
  ],
  2: [
    { id: 1, prompt: { shape: 'pentagon' }, options: ['hexagon', 'pentagon', 'star', 'circle'], correct: 1, rotates: [0, 0, 0, 0] },
    { id: 2, prompt: { shape: 'star' }, options: ['star', 'pentagon', 'diamond', 'hexagon'], correct: 0, rotates: [0, 0, 0, 0] },
    { id: 3, prompt: { shape: 'hexagon' }, options: ['pentagon', 'circle', 'diamond', 'hexagon'], correct: 3, rotates: [0, 0, 0, 0] },
    { id: 4, prompt: { shape: 'diamond' }, options: ['square', 'diamond', 'rectangle', 'star'], correct: 1, rotates: [0, 0, 0, 0] },
  ],
  3: [
    { id: 1, prompt: { shape: 'trapezoid' }, options: ['rectangle', 'trapezoid', 'square', 'hexagon'], correct: 1, rotates: [0, 0, 0, 0] },
    { id: 2, prompt: { shape: 'oval' }, options: ['oval', 'circle', 'rectangle', 'diamond'], correct: 0, rotates: [0, 0, 0, 0] },
    { id: 3, prompt: { shape: 'pentagon' }, options: ['hexagon', 'star', 'pentagon', 'diamond'], correct: 2, rotates: [0, 0, 0, 0] },
    { id: 4, prompt: { shape: 'hexagon' }, options: ['pentagon', 'hexagon', 'circle', 'trapezoid'], correct: 1, rotates: [0, 0, 0, 0] },
    { id: 5, prompt: { shape: 'star' }, options: ['diamond', 'pentagon', 'circle', 'star'], correct: 3, rotates: [0, 0, 0, 0] },
  ],
  // ── Level 4 HARD: rotation mismatches + look-alike shapes ──
  4: [
    { id: 1, prompt: { shape: 'square', rotate: 0 }, options: ['square', 'rectangle', 'diamond', 'trapezoid'], correct: 0, rotates: [45, 0, 0, 0], hint: 'A square rotated 45° looks like a diamond — but it still has 4 equal sides!' },
    { id: 2, prompt: { shape: 'triangle', rotate: 0 }, options: ['triangle', 'triangle', 'triangle', 'triangle'], correct: 2, rotates: [180, 90, 0, 270], hint: 'The triangle pointing UP is the original orientation.' },
    { id: 3, prompt: { shape: 'circle', rotate: 0 }, options: ['oval', 'circle', 'oval', 'circle'], correct: 1, rotates: [0, 0, 90, 0], hint: 'A circle is perfectly round — ovals are stretched.' },
    { id: 4, prompt: { shape: 'rectangle', rotate: 0 }, options: ['square', 'rectangle', 'trapezoid', 'rectangle'], correct: 3, rotates: [0, 90, 0, 0], hint: 'The rectangle with the longer side horizontal matches the prompt.' },
    { id: 5, prompt: { shape: 'hexagon', rotate: 0 }, options: ['hexagon', 'pentagon', 'hexagon', 'pentagon'], correct: 0, rotates: [30, 0, 60, 36], hint: 'Hexagons always have 6 sides, no matter the rotation.' },
    { id: 6, prompt: { shape: 'oval', rotate: 0 }, options: ['circle', 'oval', 'circle', 'oval'], correct: 3, rotates: [0, 90, 0, 0], hint: 'The oval lying flat (horizontal) matches the wide prompt shape.' },
  ],
  // ── Level 5 EXTREME ──
  5: [
    { id: 1, prompt: { shape: 'star', rotate: 36 }, options: ['star', 'pentagon', 'hexagon', 'star'], correct: 0, rotates: [36, 0, 0, 72] },
    { id: 2, prompt: { shape: 'trapezoid', rotate: 180 }, options: ['rectangle', 'trapezoid', 'trapezoid', 'diamond'], correct: 1, rotates: [0, 180, 0, 0] },
    { id: 3, prompt: { shape: 'diamond', rotate: 90 }, options: ['square', 'diamond', 'triangle', 'diamond'], correct: 1, rotates: [45, 90, 0, 0] },
  ],
};

// ─────────────────────────────────────────────
//  MATCH THE SHAPES GAME ENGINE
// ─────────────────────────────────────────────
const SHAPE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const MatchShapesGame = ({ level, cycle, onClose, onComplete }) => {
  const puzzlesRaw = LEVEL_PUZZLES[level] || LEVEL_PUZZLES[4];
  const puzzles = useMemo(() => shuffleWithSeed(puzzlesRaw, cycle), [puzzlesRaw, cycle]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);   // index of option tapped
  const [feedback, setFeedback] = useState(null);   // 'correct' | 'wrong'
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const puzzle = puzzles[current];
  const totalPuzzles = puzzles.length;
  const maxScore = totalPuzzles * 20;

  const handleSelect = useCallback((idx) => {
    if (selected !== null || feedback !== null) return;
    setSelected(idx);
    const isCorrect = idx === puzzle.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      const pts = showHint ? 10 : 20;
      setScore(s => s + pts);
    } else {
      setWrongCount(w => w + 1);
    }

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      setShowHint(false);
      if (current + 1 >= totalPuzzles) {
        setDone(true);
      } else {
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [selected, feedback, puzzle, showHint, current, totalPuzzles]);

  const promptColor = SHAPE_COLORS[current % SHAPE_COLORS.length];

  if (done) {
    const pct = Math.round((score / maxScore) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
          <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5} />
          <h4 className="text-3xl font-black text-slate-800 mb-1">Level {level} Complete!</h4>
          <p className="text-slate-500 font-bold mb-6">You scored <span className="text-indigo-600 text-xl">{score}</span> / {maxScore} pts ({pct}%)</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <Star key={i} size={32} className={pct >= i * 34 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
            ))}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-black tracking-wide shadow-sm transition-all">
              CLOSE
            </button>
            <button onClick={() => onComplete(score)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black tracking-wide shadow-xl shadow-emerald-200 transition-all flex items-center gap-2">
              <CheckCircle size={18} /> SAVE & UNLOCK NEXT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Guard: current advanced past array before done state applied
  if (!puzzle) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 select-none">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          <span>Puzzle {current + 1} of {totalPuzzles}</span>
          <span>Score: {score}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((current) / totalPuzzles) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Prompt */}
      <div className="mb-8 text-center">
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Find the matching shape</p>
        <div className="w-28 h-28 bg-white border-2 border-indigo-200 rounded-2xl shadow-lg flex items-center justify-center mx-auto">
          <ShapeSVG shape={puzzle.prompt.shape} size={64} color={promptColor} rotate={puzzle.prompt.rotate || 0} />
        </div>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
        {puzzle.options.map((shape, idx) => {
          let borderClass = 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer';
          if (selected === idx) {
            borderClass = feedback === 'correct'
              ? 'border-emerald-400 bg-emerald-50 scale-105'
              : 'border-rose-400 bg-rose-50';
          } else if (feedback === 'correct' && idx === puzzle.correct) {
            borderClass = 'border-emerald-400 bg-emerald-50';
          }
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(idx)}
              className={`flex items-center justify-center rounded-2xl border-2 p-4 transition-all h-24 ${borderClass}`}
            >
              <ShapeSVG shape={shape} size={52} color={selected === idx && feedback === 'wrong' ? '#f43f5e' : (idx === puzzle.correct && feedback === 'correct' ? '#10b981' : '#6366f1')} rotate={puzzle.rotates?.[idx] || 0} />
            </motion.button>
          );
        })}
      </div>

      {/* Hint (Level 4 only or after 2 wrong) */}
      {(level === 4 || wrongCount >= 2) && puzzle.hint && !showHint && !feedback && (
        <button
          onClick={() => setShowHint(true)}
          className="flex items-center gap-2 text-amber-600 text-xs font-black uppercase tracking-widest hover:underline"
        >
          <Lightbulb size={14} /> Show Hint (-10 pts)
        </button>
      )}
      {showHint && puzzle.hint && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold max-w-sm text-center">
          💡 {puzzle.hint}
        </motion.div>
      )}

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 px-5 py-2 rounded-xl text-sm font-black tracking-wide ${feedback === 'correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
          >
            {feedback === 'correct' ? '✓ Correct! +' + (showHint ? 10 : 20) + ' pts' : '✗ Try again!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
//  SUDOKU DATA + GAME ENGINE
// ─────────────────────────────────────────────

// Predefined puzzles — null = empty cell. All share the same valid solution.
const SUDOKU_SOLUTION = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

const SUDOKU_LEVELS = {
  1: { // Very Easy – 4 blanks
    puzzle: [
      [1, null, 3, 4],
      [3, 4, null, 2],
      [2, 1, 4, null],
      [null, 3, 2, 1],
    ],
  },
  2: { // Easy – 7 blanks
    puzzle: [
      [null, 2, 3, null],
      [3, null, null, 2],
      [2, 1, null, null],
      [null, 3, 2, 1],
    ],
  },
  3: { // Medium – 10 blanks
    puzzle: [
      [null, null, 3, null],
      [3, null, null, 2],
      [null, 1, null, null],
      [null, 3, null, 1],
    ],
  },
  4: { // Hard – 12 blanks
    puzzle: [
      [null, null, null, 4],
      [null, 4, null, null],
      [null, null, 4, null],
      [null, 3, null, null],
    ],
  },
  5: { // Extreme – 14 blanks
    puzzle: [
      [null, null, null, null],
      [null, 4, null, 2],
      [null, 1, null, null],
      [4, null, null, null],
    ],
  },
};

// Returns Set of "r,c" strings that have row/col/box conflicts
const getSudokuConflicts = (grid) => {
  const conflicts = new Set();
  const markDupes = (cells) => {
    const seen = {};
    cells.forEach(({ r, c, v }) => {
      if (v === null) return;
      if (seen[v] !== undefined) {
        conflicts.add(`${r},${c}`);
        conflicts.add(`${seen[v].r},${seen[v].c}`);
      } else {
        seen[v] = { r, c };
      }
    });
  };
  // Rows
  for (let r = 0; r < 4; r++)
    markDupes(grid[r].map((v, c) => ({ r, c, v })));
  // Cols
  for (let c = 0; c < 4; c++)
    markDupes([0, 1, 2, 3].map(r => ({ r, c, v: grid[r][c] })));
  // 2x2 boxes
  [[0,0],[0,2],[2,0],[2,2]].forEach(([br, bc]) => {
    const cells = [];
    for (let dr = 0; dr < 2; dr++)
      for (let dc = 0; dc < 2; dc++)
        cells.push({ r: br + dr, c: bc + dc, v: grid[br + dr][bc + dc] });
    markDupes(cells);
  });
  return conflicts;
};

const SudokuGame = ({ level, onClose, onComplete }) => {
  const data = SUDOKU_LEVELS[level] || SUDOKU_LEVELS[1];
  const initGrid = useCallback(() => data.puzzle.map(row => [...row]), [data]);

  const [grid, setGrid] = useState(initGrid);
  const [selected, setSelected] = useState(null); // [r, c] or null
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState(null); // { type: 'success'|'error'|'info', text }
  const [done, setDone] = useState(false);

  // Reset grid when level changes
  useEffect(() => { setGrid(initGrid()); setSelected(null); setMistakes(0); setHintsUsed(0); setMessage(null); setDone(false); }, [level]);

  const conflicts = useMemo(() => getSudokuConflicts(grid), [grid]);
  const isPre = (r, c) => data.puzzle[r][c] !== null;
  const filledCount = useMemo(() => grid.flat().filter(v => v !== null).length, [grid]);

  const handleCellClick = (r, c) => {
    if (isPre(r, c)) { setSelected(null); return; }
    setSelected(prev => (prev && prev[0] === r && prev[1] === c) ? null : [r, c]);
  };

  const fillCell = (num) => {
    if (!selected) return;
    const [r, c] = selected;
    if (isPre(r, c)) return;
    setGrid(g => { const n = g.map(row => [...row]); n[r][c] = num; return n; });
    setMessage(null);
  };

  const handleReset = () => { setGrid(initGrid()); setSelected(null); setMistakes(0); setHintsUsed(0); setMessage(null); setDone(false); };

  const handleHint = () => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!isPre(r, c) && grid[r][c] !== SUDOKU_SOLUTION[r][c]) {
          setGrid(g => { const n = g.map(row => [...row]); n[r][c] = SUDOKU_SOLUTION[r][c]; return n; });
          setHintsUsed(h => h + 1);
          setSelected([r, c]);
          setMessage({ type: 'info', text: `💡 Hint: filled row ${r + 1}, column ${c + 1} with ${SUDOKU_SOLUTION[r][c]}.` });
          return;
        }
      }
    }
    setMessage({ type: 'info', text: '✓ All visible cells are already correct!' });
  };

  const handleSubmit = () => {
    if (filledCount < 16) { setMessage({ type: 'error', text: 'Fill all cells before submitting!' }); return; }
    const correct = grid.every((row, r) => row.every((v, c) => v === SUDOKU_SOLUTION[r][c]));
    if (correct) {
      const score = Math.max(10, 100 - mistakes * 10 - hintsUsed * 15);
      setDone(true);
      setTimeout(() => onComplete(score), 1200);
    } else {
      setMistakes(m => m + 1);
      setMessage({ type: 'error', text: `❌ Some cells are incorrect. Mistakes: ${mistakes + 1}` });
    }
  };

  if (done) {
    const score = Math.max(10, 100 - mistakes * 10 - hintsUsed * 15);
    const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
          <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5} />
          <h4 className="text-3xl font-black text-slate-800 mb-1">Level {level} Complete!</h4>
          <p className="text-slate-500 font-bold mb-4">Score: <span className="text-indigo-600 text-xl">{score}</span> / 100 pts</p>
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map(i => <Star key={i} size={32} className={i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />)}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">CLOSE</button>
            <button onClick={() => onComplete(score)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 transition-all flex items-center gap-2">
              <CheckCircle size={18} /> SAVE & UNLOCK NEXT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-4 pb-6 px-6 bg-slate-50 overflow-auto select-none">
      {/* Progress bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          <span>Filled: {filledCount} / 16</span>
          <span className={mistakes > 0 ? 'text-rose-500' : ''}>Mistakes: {mistakes}</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(filledCount / 16) * 100}%` }} />
        </div>
      </div>

      {/* 4×4 Grid */}
      <div className="inline-grid border-2 border-slate-800 rounded-xl overflow-hidden shadow-lg mb-5" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {grid.map((row, r) =>
          row.map((val, c) => {
            const pre = isPre(r, c);
            const sel = selected && selected[0] === r && selected[1] === c;
            const conflict = conflicts.has(`${r},${c}`) && !pre;
            // Bold 2x2 borders
            const borderRight = c === 1 ? 'border-r-2 border-r-slate-800' : c < 3 ? 'border-r border-r-slate-300' : '';
            const borderBottom = r === 1 ? 'border-b-2 border-b-slate-800' : r < 3 ? 'border-b border-b-slate-300' : '';
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={[
                  'w-16 h-16 flex items-center justify-center text-2xl font-black cursor-pointer transition-colors',
                  borderRight, borderBottom,
                  pre ? 'bg-slate-100 text-slate-800 cursor-default' : sel ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : 'bg-white hover:bg-indigo-50',
                  conflict ? 'text-rose-600 bg-rose-50' : pre ? '' : 'text-indigo-600',
                ].join(' ')}
              >
                {val || ''}
              </div>
            );
          })
        )}
      </div>

      {/* Number Pad 1–4 + Clear */}
      <div className="flex gap-3 mb-5">
        {[1, 2, 3, 4].map(n => (
          <button
            key={n}
            onClick={() => fillCell(n)}
            disabled={!selected}
            className={`w-12 h-12 rounded-xl text-xl font-black border-2 transition-all ${
              selected
                ? 'border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-md active:scale-95'
                : 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >{n}</button>
        ))}
        <button
          onClick={() => fillCell(null)}
          disabled={!selected}
          className={`w-12 h-12 rounded-xl text-[10px] font-black border-2 transition-all ${
            selected
              ? 'border-slate-300 bg-white text-slate-500 hover:bg-slate-100 shadow-md active:scale-95'
              : 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >CLR</button>
      </div>

      {/* Hint tip */}
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">Tap a cell, then tap a number to fill it</p>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-5 py-2 rounded-xl text-sm font-bold max-w-xs text-center ${
          message.type === 'success' ? 'bg-emerald-100 text-emerald-700'
          : message.type === 'error' ? 'bg-rose-100 text-rose-700'
          : 'bg-amber-100 text-amber-700'
        }`}>{message.text}</div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={handleReset} className="px-5 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-black text-sm transition-all">
          ↺ Reset
        </button>
        <button onClick={handleHint} className="px-5 py-2.5 bg-amber-50 border-2 border-amber-200 hover:bg-amber-100 text-amber-700 rounded-xl font-black text-sm transition-all flex items-center gap-1.5">
          <Lightbulb size={14} /> Hint (−15 pts)
        </button>
        <button onClick={handleSubmit} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-200 transition-all">
          ✓ Submit
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  NUMBER COUNTING GAME ENGINE
// ─────────────────────────────────────────────

// Each question: objects to show, what to count, correct answer, MCQ options
// 'items' is an array of { emoji, type } to display
const COUNTING_QUESTIONS = {
  1: [ // Very Easy – count 1–5 same objects
    { items: Array(3).fill({ e: '🍎', t: 'apple' }), question: 'How many apples?', answer: 3, options: [2, 3, 4] },
    { items: Array(5).fill({ e: '⭐', t: 'star' }),  question: 'How many stars?',  answer: 5, options: [4, 5, 6] },
    { items: Array(2).fill({ e: '🌸', t: 'flower' }), question: 'How many flowers?', answer: 2, options: [1, 2, 3] },
    { items: Array(4).fill({ e: '🌱', t: 'leaf' }),  question: 'How many leaves?', answer: 4, options: [3, 4, 5] },
  ],
  2: [ // Easy – count 5–10 same objects
    { items: Array(6).fill({ e: '🍌', t: 'banana' }),  question: 'How many bananas?', answer: 6,  options: [5, 6, 7] },
    { items: Array(9).fill({ e: '❤️', t: 'heart' }),    question: 'How many hearts?',  answer: 9,  options: [8, 9, 10] },
    { items: Array(7).fill({ e: '🎵', t: 'note' }),    question: 'How many music notes?', answer: 7, options: [6, 7, 8] },
    { items: Array(10).fill({ e: '🐝', t: 'bee' }),   question: 'How many bees?',    answer: 10, options: [9, 10, 11] },
  ],
  3: [ // Medium – 10–15 mixed, count one type
    {
      items: [
        ...Array(6).fill({ e: '⭐', t: 'star' }),
        ...Array(5).fill({ e: '🍎', t: 'apple' }),
      ],
      question: 'Count only the ⭐ stars!', answer: 6, options: [5, 6, 7],
    },
    {
      items: [
        ...Array(7).fill({ e: '❤️', t: 'heart' }),
        ...Array(4).fill({ e: '🐝', t: 'bee' }),
      ],
      question: 'Count only the ❤️ hearts!', answer: 7, options: [6, 7, 8],
    },
    {
      items: [
        ...Array(5).fill({ e: '🌸', t: 'flower' }),
        ...Array(6).fill({ e: '🍌', t: 'banana' }),
      ],
      question: 'Count only the 🌸 flowers!', answer: 5, options: [4, 5, 6],
    },
    {
      items: [
        ...Array(8).fill({ e: '🍎', t: 'apple' }),
        ...Array(4).fill({ e: '🌱', t: 'leaf' }),
      ],
      question: 'Count only the 🍎 apples!', answer: 8, options: [7, 8, 9],
    },
  ],
  4: [ // Hard – 15–20 mixed objects, count one type
    {
      items: [
        ...Array(9).fill({ e: '⭐', t: 'star' }),
        ...Array(8).fill({ e: '🍎', t: 'apple' }),
      ],
      question: 'Count only the ⭐ stars!', answer: 9, options: [8, 9, 10],
    },
    {
      items: [
        ...Array(7).fill({ e: '🌸', t: 'flower' }),
        ...Array(10).fill({ e: '❤️', t: 'heart' }),
      ],
      question: 'Count only the ❤️ hearts!', answer: 10, options: [9, 10, 11],
    },
    {
      items: [
        ...Array(6).fill({ e: '🌸', t: 'flower' }),
        ...Array(11).fill({ e: '⭐', t: 'star' }),
      ],
      question: 'Count only the 🌸 flowers!', answer: 6, options: [5, 6, 7],
    },
    {
      items: [
        ...Array(11).fill({ e: '🍎', t: 'apple' }),
        ...Array(6).fill({ e: '🍌', t: 'banana' }),
      ],
      question: 'Count only the 🍎 apples!', answer: 11, options: [10, 11, 12],
    },
    {
      items: [
        ...Array(9).fill({ e: '🐝', t: 'bee' }),
        ...Array(8).fill({ e: '🌱', t: 'leaf' }),
      ],
      question: 'Count only the 🐝 bees!', answer: 9, options: [8, 9, 10],
    },
  ],
  5: [ // Extreme – count 3 types
    {
      items: [
        ...Array(8).fill({ e: '⭐', t: 'star' }),
        ...Array(6).fill({ e: '🍎', t: 'apple' }),
        ...Array(5).fill({ e: '❤️', t: 'heart' }),
      ],
      question: 'Count only the ⭐ stars!', answer: 8, options: [7, 8, 9],
    },
    {
      items: [
        ...Array(5).fill({ e: '🌸', t: 'flower' }),
        ...Array(12).fill({ e: '❤️', t: 'heart' }),
        ...Array(4).fill({ e: '🍌', t: 'banana' }),
      ],
      question: 'Count only the ❤️ hearts!', answer: 12, options: [10, 11, 12],
    },
  ]
};

const CountingGame = ({ level, cycle, onClose, onComplete }) => {
  const rawBase = COUNTING_QUESTIONS[level] || COUNTING_QUESTIONS[4];
  const rawQuestions = useMemo(() => shuffleWithSeed(rawBase, cycle), [rawBase, cycle]);
  // Shuffle items display order and question order within level
  const questions = useMemo(() => rawQuestions.map((q, i) => ({ ...q, items: shuffleWithSeed(q.items, cycle + i) })), [rawQuestions, cycle]);

  const [current, setCurrent] = useState(0);
  const [score, setScore]     = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [chosen, setChosen]   = useState(null);
  const [done, setDone]       = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const q        = questions[current];
  const total    = questions.length;
  const maxScore = total * 10;

  const handleAnswer = (opt) => {
    if (feedback !== null) return;
    setChosen(opt);
    if (opt === q.answer) {
      setFeedback('correct');
      setScore(s => s + 10);
    } else {
      setFeedback('wrong');
      setMistakes(m => m + 1);
    }
    setTimeout(() => {
      setFeedback(null);
      setChosen(null);
      if (current + 1 >= total) setDone(true);
      else setCurrent(c => c + 1);
    }, 900);
  };

  const handleReset = () => { setCurrent(0); setScore(0); setFeedback(null); setChosen(null); setDone(false); setMistakes(0); };

  if (done) {
    const pct   = Math.round((score / maxScore) * 100);
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
          <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5} />
          <h4 className="text-3xl font-black text-slate-800 mb-1">Level {level} Complete!</h4>
          <p className="text-slate-500 font-bold mb-4">Score: <span className="text-indigo-600 text-xl">{score}</span> / {maxScore} pts</p>
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map(i => <Star key={i} size={32} className={i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />)}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">CLOSE</button>
            <button onClick={() => onComplete(score)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 transition-all flex items-center gap-2">
              <CheckCircle size={18} /> SAVE & UNLOCK NEXT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Guard: current advanced past array before done state applied
  if (!q) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-4 pb-6 px-4 bg-slate-50 overflow-auto select-none">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          <span>Question {current + 1} of {total}</span>
          <span className="text-indigo-600">Score: {score}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(current / total) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <p className="text-base font-black text-slate-700 text-center mb-4">{q.question}</p>

      {/* Objects display area */}
      <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-2xl p-4 mb-6 min-h-[120px] flex flex-wrap gap-1.5 items-center justify-center shadow-sm">
        {q.items.map((item, i) => (
          <span key={i} className="text-2xl leading-none">{item.e}</span>
        ))}
      </div>

      {/* MCQ Buttons */}
      <div className="flex gap-4">
        {q.options.map((opt) => {
          let cls = 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:shadow-md';
          if (chosen === opt) {
            cls = feedback === 'correct'
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : 'border-rose-400 bg-rose-50 text-rose-700';
          } else if (feedback === 'correct' && opt === q.answer) {
            cls = 'border-emerald-400 bg-emerald-50 text-emerald-700';
          }
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={`w-20 h-20 rounded-2xl border-2 text-3xl font-black transition-all cursor-pointer active:scale-95 ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-5 px-5 py-2 rounded-xl text-sm font-black tracking-wide ${
              feedback === 'correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {feedback === 'correct' ? `✓ Correct! +10 pts` : `✗ Wrong! The answer was ${q.answer}`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset */}
      <button onClick={handleReset} className="mt-6 px-5 py-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-500 rounded-xl font-black text-sm transition-all">
        ↺ Reset Level
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
//  ADDITION & SUBTRACTION QUIZ ENGINE
// ─────────────────────────────────────────────

// timer: seconds per question (0 = no timer)
const MATH_LEVELS_CONFIG = { 1: { timer: 0 }, 2: { timer: 0 }, 3: { timer: 10 }, 4: { timer: 8 }, 5: { timer: 5 } };

const MATH_QUESTIONS = {
  1: [
    { q: '2 + 3 = ?',  answer: 5,  options: [3, 4, 5, 6] },
    { q: '4 + 1 = ?',  answer: 5,  options: [4, 5, 6, 7] },
    { q: '6 + 2 = ?',  answer: 8,  options: [6, 7, 8, 9] },
    { q: '1 + 8 = ?',  answer: 9,  options: [7, 8, 9, 10] },
    { q: '3 + 4 = ?',  answer: 7,  options: [5, 6, 7, 8] },
  ],
  2: [
    { q: '10 - 3 = ?', answer: 7,  options: [5, 6, 7, 8] },
    { q: '5 + 6 = ?',  answer: 11, options: [9, 10, 11, 12] },
    { q: '14 - 5 = ?', answer: 9,  options: [7, 8, 9, 10] },
    { q: '8 + 7 = ?',  answer: 15, options: [13, 14, 15, 16] },
    { q: '17 - 9 = ?', answer: 8,  options: [6, 7, 8, 9] },
    { q: '12 + 4 = ?', answer: 16, options: [14, 15, 16, 17] },
    { q: '20 - 13 = ?',answer: 7,  options: [5, 6, 7, 8] },
  ],
  3: [
    { q: '25 + 13 = ?', answer: 38, options: [36, 37, 38, 39] },
    { q: '40 - 18 = ?', answer: 22, options: [20, 21, 22, 23] },
    { q: '63 + 15 = ?', answer: 78, options: [76, 77, 78, 79] },
    { q: '87 - 34 = ?', answer: 53, options: [51, 52, 53, 54] },
    { q: '42 + 27 = ?', answer: 69, options: [67, 68, 69, 70] },
    { q: '75 - 29 = ?', answer: 46, options: [44, 45, 46, 47] },
    { q: '31 + 48 = ?', answer: 79, options: [77, 78, 79, 80] },
    { q: '94 - 45 = ?', answer: 49, options: [47, 48, 49, 50] },
    { q: '67 + 21 = ?', answer: 88, options: [86, 87, 88, 89] },
    { q: '83 - 37 = ?', answer: 46, options: [44, 45, 46, 47] },
  ],
  4: [
    { q: '25 + 10 - 5 = ?',  answer: 30, options: [28, 29, 30, 31] },
    { q: '40 - 15 + 8 = ?',  answer: 33, options: [31, 32, 33, 34] },
    { q: '50 + 20 - 30 = ?', answer: 40, options: [38, 39, 40, 41] },
    { q: '12 + 8 - 5 = ?',   answer: 15, options: [13, 14, 15, 16] },
    { q: '100 - 45 + 20 = ?',answer: 75, options: [73, 74, 75, 76] },
    { q: '30 + 25 - 15 = ?', answer: 40, options: [38, 39, 40, 41] },
    { q: '5 + ? = 12',       answer: 7,  options: [5, 6, 7, 8],  missing: true },
    { q: '? + 8 = 20',       answer: 12, options: [10, 11, 12, 13], missing: true },
    { q: '15 - ? = 9',       answer: 6,  options: [4, 5, 6, 7],  missing: true },
    { q: '? - 7 = 13',       answer: 20, options: [18, 19, 20, 21], missing: true },
  ],
  5: [
    { q: '50 - 25 + 15 = ?',  answer: 40, options: [35, 40, 45, 50] },
    { q: '? + 32 = 70',       answer: 38, options: [36, 38, 40, 42], missing: true },
    { q: '100 - ? = 64',      answer: 36, options: [34, 36, 38, 40], missing: true },
    { q: '3 * 4 + 8 = ?',     answer: 20, options: [18, 20, 22, 24] },
    { q: '? - 45 = 55',       answer: 100, options: [90, 95, 100, 105], missing: true }
  ]
};

const MathQuizGame = ({ level, cycle, onClose, onComplete }) => {
  const cfg       = MATH_LEVELS_CONFIG[level] || MATH_LEVELS_CONFIG[4];
  const qBase     = MATH_QUESTIONS[level] || MATH_QUESTIONS[4];
  const questions = useMemo(() => shuffleWithSeed(qBase, cycle), [qBase, cycle]);
  const total     = questions.length;
  const timerMax  = cfg.timer;

  const [current,  setCurrent]  = useState(0);
  const [score,    setScore]    = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | 'timeout'
  const [done,     setDone]     = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerMax);

  const q = questions[current];

  // Per-question countdown timer
  useEffect(() => {
    if (timerMax === 0 || feedback !== null || done) return;
    setTimeLeft(timerMax);
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          // Time's up — mark as wrong
          setFeedback('timeout');
          setTimeout(() => { advance(); }, 1000);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [current, done]);

  const advance = useCallback(() => {
    setFeedback(null);
    setChosen(null);
    setCurrent(c => c + 1);
  }, []);

  useEffect(() => { if (current >= total) setDone(true); }, [current, total]);

  const handleAnswer = (opt) => {
    if (feedback !== null) return;
    setChosen(opt);
    if (opt === q.answer) {
      setFeedback('correct');
      setScore(s => s + 10);
      setTimeout(advance, 900);
    } else {
      setFeedback('wrong');
      setTimeout(advance, 1400);
    }
  };

  const handleRetry = () => {
    setCurrent(0); setScore(0); setChosen(null); setFeedback(null); setDone(false); setTimeLeft(timerMax);
  };

  // ── Completion screen ──
  if (done) {
    const maxScore  = total * 10;
    const pct       = Math.round((score / maxScore) * 100);
    const passed    = pct >= 60;
    const stars     = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
    const msg       = pct >= 80 ? { label: '🎉 Excellent!', cls: 'bg-emerald-100 text-emerald-700' }
                    : pct >= 50 ? { label: '👍 Good!',      cls: 'bg-blue-100 text-blue-700' }
                    :             { label: '💪 Try Again!',  cls: 'bg-rose-100 text-rose-700' };
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
          <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5} />
          <h4 className="text-3xl font-black text-slate-800 mb-1">Level {level} Done!</h4>
          <p className="text-slate-500 font-bold mb-2">
            Score: <span className="text-indigo-600 text-xl">{score}</span> / {maxScore} pts &nbsp;({pct}%)
          </p>
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-black mb-4 ${msg.cls}`}>{msg.label}</div>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => <Star key={i} size={28} className={i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />)}
          </div>
          {!passed && (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Score ≥ 60% to unlock the next level</p>
          )}
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={handleRetry} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300 flex items-center gap-2">
              ↺ Retry
            </button>
            <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">CLOSE</button>
            {passed && (
              <button onClick={() => onComplete(score)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 transition-all flex items-center gap-2">
                <CheckCircle size={18} /> SAVE & UNLOCK NEXT
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Question screen ──
  // Guard: current advanced past array before done state applied (prevents `.missing` crash)
  if (!q) return null;

  const timerPct = timerMax > 0 ? (timeLeft / timerMax) * 100 : 100;
  const timerColor = timeLeft <= 3 ? 'bg-rose-500' : timeLeft <= 6 ? 'bg-amber-400' : 'bg-indigo-500';

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-5 pb-6 px-6 bg-slate-50 overflow-auto select-none">
      {/* Header row: progress + timer */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          <span>Q {current + 1} / {total}</span>
          <span className="text-indigo-600">Score: {score}</span>
        </div>
        {/* Question progress */}
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(current / total) * 100}%` }} />
        </div>
        {/* Timer bar */}
        {timerMax > 0 && (
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerPct}%` }} />
          </div>
        )}
        {timerMax > 0 && (
          <div className={`text-right text-[10px] font-black mt-0.5 ${ timeLeft <= 3 ? 'text-rose-500' : 'text-slate-400'}`}>
            ⏱ {timeLeft}s
          </div>
        )}
      </div>

      {/* Question card */}
      <div className={`w-full max-w-md bg-white border-2 rounded-2xl shadow-md flex items-center justify-center py-8 mb-6 transition-colors ${
        q.missing ? 'border-amber-200' : 'border-slate-200'
      }`}>
        <div className="text-center">
          {q.missing && <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-2">Find the missing number (?)</p>}
          <p className="text-4xl font-black text-slate-900 tracking-tight">{q.q}</p>
        </div>
      </div>

      {/* MCQ Options — 2×2 grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
        {q.options.map((opt) => {
          let cls = 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:shadow-md cursor-pointer';
          if (chosen === opt) {
            cls = feedback === 'correct'
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : 'border-rose-400 bg-rose-50 text-rose-700';
          } else if ((feedback === 'wrong' || feedback === 'timeout') && opt === q.answer) {
            cls = 'border-emerald-400 bg-emerald-50 text-emerald-700'; // reveal correct
          }
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={feedback !== null}
              className={`h-16 rounded-2xl border-2 text-2xl font-black transition-all active:scale-95 ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-5 py-2 rounded-xl text-sm font-black tracking-wide ${
              feedback === 'correct' ? 'bg-emerald-100 text-emerald-700'
              : feedback === 'timeout' ? 'bg-slate-200 text-slate-600'
              : 'bg-rose-100 text-rose-700'
            }`}
          >
            {feedback === 'correct' ? '✓ Correct! +10 pts'
            : feedback === 'timeout' ? `⏱ Time's up! Answer: ${q.answer}`
            : `✗ Wrong! Correct answer: ${q.answer}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
//  MEMORY CARD MATCH GAME ENGINE
// ─────────────────────────────────────────────

const MEM_CONFIG = {
  1: { cols: 2, pairs: 2 },
  2: { cols: 3, pairs: 3 },
  3: { cols: 4, pairs: 6 },
  4: { cols: 4, pairs: 8 },
  5: { cols: 4, pairs: 10 },
};
const MEM_EMOJIS = ['🍎','🐶','⭐','🚗','🎵','🌸','🦋','🍌','🌈','🎈','🐸','🦄','🍕','⚽','🎯','🌙'];

const buildMemDeck = (pairs, cycl) => {
  const emojis = MEM_EMOJIS.slice(0, pairs);
  const deck = [...emojis, ...emojis].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
  const rng = seedRNG(cycl);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const MemoryCardGame = ({ level, cycle, onClose, onComplete }) => {
  const cfg = MEM_CONFIG[level] || MEM_CONFIG[4];
  const [cards, setCards] = useState(() => buildMemDeck(cfg.pairs, cycle));
  const [open, setOpen]   = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [done, setDone]   = useState(false);

  const reset = () => { setCards(buildMemDeck(cfg.pairs, cycle + moves)); setOpen([]); setMoves(0); setLocked(false); setDone(false); };

  const handleFlip = (idx) => {
    if (locked || cards[idx].flipped || cards[idx].matched || open.includes(idx)) return;
    const newCards = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newOpen = [...open, idx];
    setOpen(newOpen);
    if (newOpen.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = newOpen;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setCards(prev => {
            const updated = prev.map((c, i) => (i === a || i === b) ? { ...c, matched: true } : c);
            if (updated.every(c => c.matched)) setTimeout(() => setDone(true), 300);
            return updated;
          });
          setOpen([]); setLocked(false);
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, flipped: false } : c));
          setOpen([]); setLocked(false);
        }, 1000);
      }
    }
  };

  const score = Math.max(10, 100 - Math.max(0, moves - cfg.pairs) * 5);
  const stars = moves <= cfg.pairs + 2 ? 3 : moves <= cfg.pairs + 5 ? 2 : 1;

  if (done) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
        <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5} />
        <h4 className="text-3xl font-black text-slate-800 mb-1">Level {level} Complete!</h4>
        <p className="text-slate-500 font-bold mb-1">Completed in <span className="text-indigo-600 text-xl">{moves}</span> moves</p>
        <p className="text-sm font-bold text-slate-400 mb-6">Score: <span className="text-indigo-600">{score}</span> pts</p>
        <div className="flex justify-center gap-2 mb-8">
          {[1,2,3].map(i => <Star key={i} size={32} className={i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />)}
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={reset} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">↺ Restart</button>
          <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">CLOSE</button>
          <button onClick={() => onComplete(score)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 transition-all flex items-center gap-2">
            <CheckCircle size={18} /> SAVE & UNLOCK NEXT
          </button>
        </div>
      </motion.div>
    </div>
  );

  const sz = cfg.cols >= 4 ? 'w-14 h-14 text-xl' : cfg.cols === 3 ? 'w-20 h-20 text-3xl' : 'w-24 h-24 text-4xl';

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-4 pb-6 px-4 bg-slate-50 overflow-auto select-none">
      <div className="w-full max-w-md mb-4 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>Moves: {moves}</span>
        <span>Pairs Found: {cards.filter(c => c.matched).length / 2} / {cfg.pairs}</span>
      </div>
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${cfg.cols}, 1fr)` }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleFlip(idx)}
            className={`${sz} rounded-2xl border-2 font-black transition-all flex items-center justify-center shadow-sm ${
              card.matched
                ? 'bg-emerald-50 border-emerald-300 cursor-default scale-95'
                : card.flipped
                ? 'bg-indigo-50 border-indigo-300 cursor-default'
                : 'bg-white border-slate-200 hover:border-indigo-300 cursor-pointer active:scale-95'
            }`}
          >
            {(card.flipped || card.matched) ? card.emoji : <span className="text-slate-300 text-base font-black">?</span>}
          </button>
        ))}
      </div>
      <button onClick={reset} className="px-5 py-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-500 rounded-xl font-black text-sm transition-all">↺ Restart Level</button>
    </div>
  );
};

// ─────────────────────────────────────────────
//  ALPHABET & WORD GAME ENGINE
// ─────────────────────────────────────────────

const ALPHA_DATA = {
  1: [
    { letter: 'A', answer: '🍎', word: 'Apple',   options: ['🍌', '🍎', '🚗', '🐶'] },
    { letter: 'B', answer: '🎈', word: 'Balloon',  options: ['🎵', '🍌', '🎈', '🌸'] },
    { letter: 'C', answer: '🐱', word: 'Cat',      options: ['🐶', '🐱', '🚗', '🌙'] },
    { letter: 'D', answer: '🐶', word: 'Dog',      options: ['🐱', '⭐', '🐶', '🌸'] },
    { letter: 'E', answer: '🥚', word: 'Egg',      options: ['🥚', '🍎', '🐯', '🌸'] },
    { letter: 'F', answer: '🐟', word: 'Fish',     options: ['🐸', '🐟', '🌸', '🎵'] },
  ],
  2: [
    { upper: 'A', answer: 'a', options: ['b', 'a', 'c', 'd'] },
    { upper: 'B', answer: 'b', options: ['a', 'c', 'b', 'd'] },
    { upper: 'C', answer: 'c', options: ['d', 'b', 'a', 'c'] },
    { upper: 'D', answer: 'd', options: ['c', 'd', 'a', 'b'] },
    { upper: 'E', answer: 'e', options: ['f', 'a', 'e', 'c'] },
    { upper: 'F', answer: 'f', options: ['e', 'f', 'g', 'h'] },
  ],
  3: [
    { display: 'C _ T', word: 'CAT', answer: 'A', options: ['A', 'B', 'D', 'E'] },
    { display: 'D _ G', word: 'DOG', answer: 'O', options: ['A', 'O', 'U', 'I'] },
    { display: 'S U _', word: 'SUN', answer: 'N', options: ['N', 'M', 'P', 'T'] },
    { display: '_ A T', word: 'HAT', answer: 'H', options: ['H', 'B', 'C', 'D'] },
    { display: 'P _ G', word: 'PIG', answer: 'I', options: ['A', 'E', 'I', 'O'] },
    { display: 'H E _', word: 'HEN', answer: 'N', options: ['N', 'M', 'R', 'S'] },
  ],
  4: [
    { word: 'CAT', letters: ['T', 'C', 'B', 'A'] },
    { word: 'DOG', letters: ['G', 'D', 'X', 'O'] },
    { word: 'SUN', letters: ['N', 'Z', 'S', 'U'] },
    { word: 'HAT', letters: ['H', 'W', 'T', 'A'] },
    { word: 'BEE', letters: ['E', 'K', 'B', 'E'] },
    { word: 'COW', letters: ['W', 'C', 'P', 'O'] },
  ],
  5: [
    { word: 'APPLE', letters: ['L', 'E', 'P', 'X', 'A', 'P'] },
    { word: 'ZEBRA', letters: ['A', 'Z', 'B', 'R', 'E'] },
    { word: 'TIGER', letters: ['I', 'G', 'T', 'R', 'E'] },
    { word: 'WHALE', letters: ['E', 'A', 'W', 'H', 'L'] },
  ],
};

const AlphabetWordGame = ({ level, cycle, onClose, onComplete }) => {
  const qBase = ALPHA_DATA[level] || ALPHA_DATA[4];
  const questions = useMemo(() => shuffleWithSeed(qBase, cycle), [qBase, cycle]);
  const total     = questions.length;
  const maxScore  = total * 10;

  const [current,  setCurrent]  = useState(0);
  const [score,    setScore]    = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [done,     setDone]     = useState(false);
  const [built,    setBuilt]    = useState([]); // Level 4 letter-tap tracking

  const q = questions[current];

  const advance = useCallback(() => {
    setChosen(null); setFeedback(null); setBuilt([]);
    if (current + 1 >= total) setDone(true);
    else setCurrent(c => c + 1);
  }, [current, total]);

  const handleAnswer = (opt, answer) => {
    if (feedback) return;
    setChosen(opt);
    if (opt === answer) {
      setFeedback('correct'); setScore(s => s + 10);
      setTimeout(advance, 900);
    } else {
      setFeedback('wrong');
      setTimeout(() => { setChosen(null); setFeedback(null); }, 1000);
    }
  };

  const handleLetterClick = (letter, idx) => {
    if (!q || feedback || built.some(b => b.idx === idx)) return;
    const newBuilt = [...built, { letter, idx }];
    setBuilt(newBuilt);
    const formed = newBuilt.map(b => b.letter).join('');
    if (formed.length === q.word.length) {
      if (formed === q.word) {
        setFeedback('correct'); setScore(s => s + 10);
        setTimeout(advance, 1000);
      } else {
        setFeedback('wrong');
        setTimeout(() => { setBuilt([]); setFeedback(null); }, 1000);
      }
    }
  };

  if (done) {
    const pct   = Math.round((score / maxScore) * 100);
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
          <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5} />
          <h4 className="text-3xl font-black text-slate-800 mb-1">Level {level} Complete!</h4>
          <p className="text-slate-500 font-bold mb-4">Score: <span className="text-indigo-600 text-xl">{score}</span> / {maxScore} pts</p>
          <div className="flex justify-center gap-2 mb-8">
            {[1,2,3].map(i => <Star key={i} size={32} className={i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />)}
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">CLOSE</button>
            <button onClick={() => onComplete(score)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 transition-all flex items-center gap-2">
              <CheckCircle size={18} /> SAVE & UNLOCK NEXT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-5 pb-6 px-4 bg-slate-50 overflow-auto select-none">
      {/* Progress */}
      <div className="w-full max-w-md mb-5">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          <span>Question {current + 1} / {total}</span>
          <span className="text-indigo-600">Score: {score}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(current / total) * 100}%` }} />
        </div>
      </div>

      {/* Level 1: Letter → Emoji picture */}
      {level === 1 && (
        <>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Which picture starts with the letter?</p>
          <div className="w-28 h-28 bg-white border-2 border-indigo-200 rounded-2xl shadow-lg flex items-center justify-center mb-8">
            <span className="text-6xl font-black text-indigo-600">{q.letter}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {q.options.map(opt => {
              let cls = 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer';
              if (chosen === opt) cls = feedback === 'correct' ? 'border-emerald-400 bg-emerald-50' : 'border-rose-400 bg-rose-50';
              else if (feedback === 'correct' && opt === q.answer) cls = 'border-emerald-400 bg-emerald-50';
              return (
                <button key={opt} onClick={() => handleAnswer(opt, q.answer)}
                  className={`h-20 rounded-2xl border-2 text-4xl transition-all active:scale-95 ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs font-bold text-slate-400">💡 Hint: Starts with <span className="text-indigo-500">{q.letter}</span> for {q.word}</p>
        </>
      )}

      {/* Level 2: Uppercase → Lowercase */}
      {level === 2 && (
        <>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Find the lowercase letter</p>
          <div className="w-28 h-28 bg-white border-2 border-blue-200 rounded-2xl shadow-lg flex items-center justify-center mb-8">
            <span className="text-6xl font-black text-blue-600">{q.upper}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {q.options.map(opt => {
              let cls = 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md cursor-pointer text-slate-700';
              if (chosen === opt) cls = feedback === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700';
              else if (feedback === 'correct' && opt === q.answer) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700';
              return (
                <button key={opt} onClick={() => handleAnswer(opt, q.answer)}
                  className={`h-16 rounded-2xl border-2 text-3xl font-black transition-all active:scale-95 hover:shadow-md ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Level 3: Fill the missing letter */}
      {level === 3 && (
        <>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Fill the missing letter</p>
          <div className="w-full max-w-xs bg-white border-2 border-amber-200 rounded-2xl shadow-lg flex items-center justify-center py-8 mb-8">
            <span className="text-5xl font-black text-slate-800 tracking-widest">{q.display}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {q.options.map(opt => {
              let cls = 'border-slate-200 bg-white hover:border-amber-400 hover:shadow-md cursor-pointer text-slate-700';
              if (chosen === opt) cls = feedback === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700';
              else if (feedback === 'correct' && opt === q.answer) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700';
              return (
                <button key={opt} onClick={() => handleAnswer(opt, q.answer)}
                  className={`h-16 rounded-2xl border-2 text-3xl font-black transition-all active:scale-95 hover:shadow-md ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Level 4 and 5: Tap letters to form the word */}
      {(level === 4 || level === 5) && (
        <>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Tap letters in order to spell:</p>
          <p className="text-2xl font-black text-indigo-600 mb-5">{q.word}</p>
          {/* Word slots */}
          <div className="flex gap-2 mb-6">
            {q.word.split('').map((_, i) => (
              <div key={i} className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                built[i] ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-300'
              }`}>
                {built[i]?.letter || '_'}
              </div>
            ))}
          </div>
          {/* Letter tiles */}
          <div className="flex gap-3 flex-wrap justify-center mb-4">
            {q.letters.map((letter, idx) => {
              const used = built.some(b => b.idx === idx);
              return (
                <button key={idx} onClick={() => handleLetterClick(letter, idx)} disabled={used || !!feedback}
                  className={`w-14 h-14 rounded-xl border-2 text-2xl font-black transition-all ${
                    used
                      ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                      : 'border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95 cursor-pointer shadow-sm'
                  }`}>
                  {letter}
                </button>
              );
            })}
          </div>
          {built.length > 0 && !feedback && (
            <button onClick={() => setBuilt([])} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 transition-colors">↺ Clear</button>
          )}
        </>
      )}

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mt-6 px-5 py-2 rounded-xl text-sm font-black tracking-wide ${
              feedback === 'correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {feedback === 'correct' ? '✓ Correct! +10 pts' : '✗ Try again!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
//  ADVANCED SUDOKU GAME ENGINE (6×6 / 9×9)
// ─────────────────────────────────────────────
const ADV_SDK = {
  1:{size:6,bR:2,bC:3,sol:[[1,2,3,4,5,6],[4,5,6,1,2,3],[2,1,4,3,6,5],[3,6,5,2,4,1],[5,4,1,6,3,2],[6,3,2,5,1,4]],puz:[[1,null,3,4,null,6],[4,5,null,1,2,null],[2,null,4,null,6,5],[null,6,5,2,null,1],[5,4,null,6,3,null],[6,null,2,null,1,4]]},
  2:{size:6,bR:2,bC:3,sol:[[1,2,3,4,5,6],[4,5,6,1,2,3],[2,1,4,3,6,5],[3,6,5,2,4,1],[5,4,1,6,3,2],[6,3,2,5,1,4]],puz:[[null,2,null,4,null,null],[4,null,null,null,2,3],[2,null,4,null,null,5],[null,6,null,2,4,null],[5,null,null,6,null,null],[null,null,2,null,1,4]]},
  3:{size:9,bR:3,bC:3,sol:[[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]],puz:[[5,3,null,null,7,null,null,null,null],[6,null,null,1,9,5,null,null,null],[null,9,8,null,null,null,null,6,null],[8,null,null,null,6,null,null,null,3],[4,null,null,8,null,3,null,null,1],[7,null,null,null,2,null,null,null,6],[null,6,null,null,null,null,2,8,null],[null,null,null,4,1,9,null,null,5],[null,null,null,null,8,null,null,7,9]]},
  4:{size:9,bR:3,bC:3,sol:[[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]],puz:[[null,null,null,null,7,null,9,null,null],[6,null,null,1,null,null,null,null,null],[null,9,null,null,null,null,null,6,null],[8,null,null,null,6,null,null,null,null],[null,null,null,8,null,3,null,null,1],[null,null,null,null,2,null,null,null,6],[null,6,null,null,null,null,2,null,null],[null,null,null,4,null,9,null,null,5],[null,null,null,null,8,null,null,7,null]]},
  5:{size:9,bR:3,bC:3,sol:[[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]],puz:[[null,null,null,null,null,8,9,null,null],[6,null,null,1,null,null,null,null,null],[null,9,null,null,null,null,null,6,null],[8,null,null,null,6,null,null,null,null],[null,null,null,8,null,3,null,null,1],[null,null,null,null,2,null,null,null,6],[null,6,null,null,null,null,2,null,null],[null,null,null,4,null,9,null,null,5],[null,null,null,null,8,null,null,7,null]]},
};
const sdkConflicts=(grid,size,bR,bC)=>{
  const s=new Set();
  const chk=cells=>{const seen={};cells.forEach(({r,c,v})=>{if(!v)return;const k=`${r},${c}`;if(seen[v]){s.add(k);s.add(seen[v]);}else seen[v]=k;});};
  for(let r=0;r<size;r++)chk(grid[r].map((v,c)=>({r,c,v})));
  for(let c=0;c<size;c++)chk(Array.from({length:size},(_,r)=>({r,c,v:grid[r][c]})));
  for(let br=0;br<size;br+=bR)for(let bc=0;bc<size;bc+=bC){const cells=[];for(let dr=0;dr<bR;dr++)for(let dc=0;dc<bC;dc++)cells.push({r:br+dr,c:bc+dc,v:grid[br+dr][bc+dc]});chk(cells);}
  return s;
};
const AdvancedSudokuGame=({level,onClose,onComplete})=>{
  const d=ADV_SDK[level]||ADV_SDK[1];const{size,bR,bC,sol,puz}=d;
  const nums=Array.from({length:size},(_,i)=>i+1);
  const mkGrid=useCallback(()=>puz.map(r=>[...r]),[puz]);
  const[grid,setGrid]=useState(mkGrid);const[sel,setSel]=useState(null);const[mis,setMis]=useState(0);
  const[hints,setHints]=useState(3);const[msg,setMsg]=useState(null);const[done,setDone]=useState(false);
  const[elapsed,setElapsed]=useState(0);const[ac,setAc]=useState(true);
  useEffect(()=>{if(done||mis>=3)return;const id=setInterval(()=>setElapsed(t=>t+1),1000);return()=>clearInterval(id);},[done,mis]);
  useEffect(()=>{setGrid(mkGrid());setSel(null);setMis(0);setHints(3);setMsg(null);setDone(false);setElapsed(0);},[level]);
  const conf=useMemo(()=>sdkConflicts(grid,size,bR,bC),[grid,size,bR,bC]);
  const isPre=(r,c)=>puz[r][c]!==null;
  const filled=useMemo(()=>grid.flat().filter(Boolean).length,[grid]);
  const isOver=mis>=3;
  const fill=num=>{if(!sel||isOver||done)return;const[r,c]=sel;if(isPre(r,c))return;if(ac&&num!==null&&num!==sol[r][c]){const nm=mis+1;setMis(nm);setMsg({e:1,t:nm>=3?'❌ 3 mistakes! Reset.':` ❌ Wrong! ${nm}/3`});return;}setGrid(g=>{const n=g.map(r=>[...r]);n[r][c]=num;return n;});setMsg(null);};
  const doHint=()=>{if(hints<=0){setMsg({t:'💡 No hints!'});return;}for(let r=0;r<size;r++)for(let c=0;c<size;c++){if(!isPre(r,c)&&grid[r][c]!==sol[r][c]){setGrid(g=>{const n=g.map(r=>[...r]);n[r][c]=sol[r][c];return n;});const nh=hints-1;setHints(nh);setSel([r,c]);setMsg({t:`💡 Hint! ${nh} left.`});return;}}setMsg({t:'All correct so far!'});};
  const submit=()=>{if(filled<size*size){setMsg({e:1,t:'Fill all cells!'});return;}if(grid.every((row,r)=>row.every((v,c)=>v===sol[r][c]))){const sc=Math.max(50,500-mis*80-(3-hints)*20-Math.floor(elapsed/15));setDone(true);setTimeout(()=>onComplete(sc),600);}else{const nm=mis+1;setMis(nm);setMsg({e:1,t:`❌ Errors found. Mistakes: ${nm}/3`});}};
  const reset=()=>{setGrid(mkGrid());setSel(null);setMis(0);setHints(3);setMsg(null);setDone(false);setElapsed(0);};
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const calcSc=()=>Math.max(50,500-mis*80-(3-hints)*20-Math.floor(elapsed/15));
  if(done){const sc=calcSc();const stars=mis===0?3:mis<=1?2:1;return(
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
      <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',bounce:0.4}}>
        <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5}/>
        <h4 className="text-3xl font-black text-slate-800 mb-1">Level {level} Complete!</h4>
        <p className="text-slate-500 font-bold mb-1">⏱️ {fmt(elapsed)} · ❌ {mis} mistakes</p>
        <p className="text-sm font-bold text-slate-400 mb-5">Score: <span className="text-indigo-600 text-lg">{sc}</span> pts</p>
        <div className="flex justify-center gap-2 mb-8">{[1,2,3].map(i=><Star key={i} size={32} className={i<=stars?'text-yellow-400 fill-yellow-400':'text-slate-300'}/>)}</div>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={reset} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">↻ Restart</button>
          <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">CLOSE</button>
          <button onClick={()=>onComplete(sc)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 flex items-center gap-2 transition-all"><CheckCircle size={18}/> SAVE &amp; UNLOCK NEXT</button>
        </div>
      </motion.div>
    </div>);}
  const cz=size===6?'w-11 h-11 text-sm':'w-8 h-8 text-[11px]';
  const bRc=c=>(c+1)%bC===0&&c<size-1?'border-r-2 border-r-slate-700':c<size-1?'border-r border-r-slate-300':'';
  const bBr=r=>(r+1)%bR===0&&r<size-1?'border-b-2 border-b-slate-700':r<size-1?'border-b border-b-slate-300':'';
  return(<div className="flex-1 flex flex-col items-center justify-start pt-3 pb-5 px-3 bg-slate-50 overflow-auto select-none">
    <div className="w-full max-w-lg mb-3 flex justify-between items-center bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs font-black">
      <span className="text-slate-700">⏱️ {fmt(elapsed)}</span>
      <span className={mis>1?'text-rose-600':'text-slate-600'}>❌ {mis}/3</span>
      <span className="text-amber-600">💡 {hints} hints</span>
      <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer"><input type="checkbox" className="accent-indigo-600" checked={ac} onChange={()=>setAc(a=>!a)}/> Auto-check</label>
    </div>
    <div className="inline-grid border-2 border-slate-700 rounded-xl overflow-hidden shadow-md mb-3" style={{gridTemplateColumns:`repeat(${size},1fr)`}}>
      {grid.map((row,r)=>row.map((val,c)=>{const pre=isPre(r,c),isSel=sel&&sel[0]===r&&sel[1]===c,isConf=conf.has(`${r},${c}`)&&!pre;return(<div key={`${r}-${c}`} onClick={()=>{if(isOver||done)return;pre?setSel(null):setSel(p=>(p&&p[0]===r&&p[1]===c)?null:[r,c]);}} className={[cz,'flex items-center justify-center font-black transition-colors',bRc(c),bBr(r),pre?'bg-slate-100 text-slate-800 cursor-default':isSel?'bg-indigo-50 ring-2 ring-inset ring-indigo-500 text-indigo-700':'bg-white hover:bg-indigo-50 text-indigo-600 cursor-pointer',isConf?'!bg-rose-50 !text-rose-600':''].filter(Boolean).join(' ')}>{val||''}</div>);}))}    </div>
    {isOver&&<div className="mb-3 px-4 py-1.5 bg-rose-100 text-rose-700 rounded-xl text-xs font-black">❌ Game over! Click Reset.</div>}
    <div className="flex flex-wrap gap-2 justify-center mb-3">
      {nums.map(n=>(<button key={n} onClick={()=>fill(n)} disabled={isOver||!sel||done} className={`${size===9?'w-9 h-9 text-sm':'w-11 h-11 text-base'} rounded-xl border-2 font-black transition-all ${sel&&!isOver&&!done?'border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-sm active:scale-95':'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'}`}>{n}</button>))}
      <button onClick={()=>fill(null)} disabled={isOver||!sel||done} className={`${size===9?'w-9 h-9':'w-11 h-11'} text-[10px] rounded-xl border-2 font-black transition-all ${sel&&!isOver&&!done?'border-slate-300 bg-white text-slate-500 hover:bg-slate-100 shadow-sm':'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'}`}>CLR</button>
    </div>
    {msg&&<div className={`mb-3 px-4 py-2 rounded-xl text-xs font-bold max-w-xs text-center ${msg.e?'bg-rose-100 text-rose-700':'bg-amber-100 text-amber-700'}`}>{msg.t}</div>}
    <div className="flex gap-2 flex-wrap justify-center">
      <button onClick={reset} className="px-4 py-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-black text-xs">↻ Reset</button>
      <button onClick={doHint} disabled={hints<=0||isOver||done} className="px-4 py-2 bg-amber-50 border-2 border-amber-200 hover:bg-amber-100 text-amber-700 rounded-xl font-black text-xs flex items-center gap-1 disabled:opacity-50"><Lightbulb size={12}/> Hint</button>
      <button onClick={submit} disabled={isOver||done} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-200 disabled:opacity-50">✓ Submit</button>
    </div>
  </div>);
};

// ─────────────────────────────────────────────
//  SHARED MCQ ENGINE + DATA (Algebra / Logic / Pattern)
// ─────────────────────────────────────────────
const MCQGame=({questions: qRaw,level,cycle,onClose,onComplete,border='border-slate-200'})=>{
  const questions = useMemo(() => shuffleWithSeed(qRaw, cycle), [qRaw, cycle]);
  const tot=questions.length;const maxSc=tot*10;
  const[curr,setCurr]=useState(0);const[score,setScore]=useState(0);
  const[chosen,setChosen]=useState(null);const[fb,setFb]=useState(null);const[done,setDone]=useState(false);
  const q=questions[curr];
  const advance=useCallback(()=>{setChosen(null);setFb(null);if(curr+1>=tot)setDone(true);else setCurr(c=>c+1);},[curr,tot]);
  const pick=opt=>{if(fb)return;setChosen(opt);const ok=opt===q.ans;setFb(ok?'correct':'wrong');if(ok)setScore(s=>s+10);setTimeout(advance,ok?900:2000);};
  if(done){const pct=Math.round((score/maxSc)*100);const stars=pct>=80?3:pct>=60?2:1;return(
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
      <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',bounce:0.4}}>
        <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5}/>
        <h4 className="text-3xl font-black text-slate-800 mb-1">Level {level} Done!</h4>
        <p className="text-slate-500 font-bold mb-4">Score: <span className="text-indigo-600 text-xl">{score}</span>/{maxSc} pts ({pct}%)</p>
        <div className="flex justify-center gap-2 mb-8">{[1,2,3].map(i=><Star key={i} size={32} className={i<=stars?'text-yellow-400 fill-yellow-400':'text-slate-300'}/>)}</div>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">CLOSE</button>
          <button onClick={()=>onComplete(score)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 flex items-center gap-2 transition-all"><CheckCircle size={18}/> SAVE &amp; UNLOCK NEXT</button>
        </div>
      </motion.div>
    </div>);}
  if(!q)return null;
  return(<div className="flex-1 flex flex-col items-center justify-start pt-5 pb-6 px-4 bg-slate-50 overflow-auto select-none">
    <div className="w-full max-w-md mb-4">
      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"><span>Q {curr+1}/{tot}</span><span className="text-indigo-600">Score: {score}</span></div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full transition-all" style={{width:`${(curr/tot)*100}%`}}/></div>
    </div>
    <div className={`w-full max-w-md bg-white border-2 ${border} rounded-2xl shadow-md flex items-center justify-center py-8 mb-6 px-6 text-center`}>
      <p className="text-xl font-black text-slate-800 leading-snug">{q.q}</p>
    </div>
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-5">
      {q.opts.map(opt=>{let cls='border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:shadow-md cursor-pointer';if(chosen===opt)cls=fb==='correct'?'border-emerald-400 bg-emerald-50 text-emerald-700':'border-rose-400 bg-rose-50 text-rose-700';else if(fb==='wrong'&&opt===q.ans)cls='border-emerald-400 bg-emerald-50 text-emerald-700';return<button key={String(opt)} onClick={()=>pick(opt)} disabled={!!fb} className={`min-h-[56px] px-2 py-3 rounded-2xl border-2 text-base font-bold text-center transition-all active:scale-95 ${cls}`}>{opt}</button>;})}
    </div>
    <AnimatePresence>{fb&&(<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className={`px-5 py-2 rounded-xl text-sm font-black ${fb==='correct'?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{fb==='correct'?'✓ Correct! +10 pts':'✗ Wrong!'}</motion.div>)}</AnimatePresence>
    {fb&&q.expl&&<p className="mt-2 text-xs font-bold text-slate-400 text-center max-w-xs">💡 {q.expl}</p>}
  </div>);
};
const ALGEBRA_Q={
  1:[{q:'2x+3=7, find x.',ans:2,opts:[1,2,3,4],expl:'2x=4→x=2'},{q:'3x−5=10, find x.',ans:5,opts:[3,4,5,6],expl:'3x=15→x=5'},{q:'4x+1=13, find x.',ans:3,opts:[2,3,4,5],expl:'4x=12→x=3'},{q:'5x−10=15, find x.',ans:5,opts:[4,5,6,7],expl:'5x=25→x=5'},{q:'6x+4=22, find x.',ans:3,opts:[2,3,4,5],expl:'6x=18→x=3'}],
  2:[{q:'3(x+2)=18, find x.',ans:4,opts:[3,4,5,6],expl:'x+2=6→x=4'},{q:'2(2x−3)=10, find x.',ans:4,opts:[3,4,5,6],expl:'2x−3=5→x=4'},{q:'4(x−1)+2=14, find x.',ans:4,opts:[3,4,5,6],expl:'4(x−1)=12→x=4'},{q:'5(x+3)=40, find x.',ans:5,opts:[4,5,6,7],expl:'x+3=8→x=5'},{q:'3(2x+1)=21, find x.',ans:3,opts:[2,3,4,5],expl:'2x+1=7→x=3'}],
  3:[{q:'3x+4=x+10, find x.',ans:3,opts:[2,3,4,5],expl:'2x=6→x=3'},{q:'5x−2=2x+7, find x.',ans:3,opts:[2,3,4,5],expl:'3x=9→x=3'},{q:'4x+5=2x+13, find x.',ans:4,opts:[3,4,5,6],expl:'2x=8→x=4'},{q:'6x−7=3x+5, find x.',ans:4,opts:[3,4,5,6],expl:'3x=12→x=4'},{q:'7x+1=4x+10, find x.',ans:3,opts:[2,3,4,5],expl:'3x=9→x=3'}],
  4:[{q:'3 bags ₹(4x−6) each, total ₹54. Find x.',ans:6,opts:[5,6,7,8],expl:'4x−6=18→4x=24→x=6'},{q:'Rectangle L=3x,W=x+2,P=44. Find x.',ans:5,opts:[4,5,6,7],expl:'2(4x+2)=44→4x=20→x=5'},{q:'Train (2x+10)km/h, 3h=90km. Find x.',ans:10,opts:[9,10,11,12],expl:'3(2x+10)=90→2x=20→x=10'},{q:'Angles (3x+5)°+(x+7)°=180°. Find x.',ans:42,opts:[40,41,42,43],expl:'4x+12=180→x=42'},{q:'(2x+4)+(3x−9)=40. Find x.',ans:9,opts:[8,9,10,11],expl:'5x−5=40→x=9'}],
  5:[{q:'5(x-2)=3(x+4). Find x.',ans:11,opts:[9,10,11,12],expl:'5x-10=3x+12→2x=22→x=11'},{q:'x/2 + x/3 = 5. Find x.',ans:6,opts:[4,5,6,7],expl:'(3x+2x)/6=5→5x=30→x=6'},{q:'4x-7=2x+9. Find x.',ans:8,opts:[6,7,8,9],expl:'2x=16→x=8'}],
};
const LOGIC_Q={
  1:[{q:'Odd one out: 2, 4, 6, 9, 10',ans:'9',opts:['4','6','9','10'],expl:'9 is odd; rest are even'},{q:'Cat:Kitten :: Dog:?',ans:'Puppy',opts:['Calf','Puppy','Lamb','Cub'],expl:'Kitten=baby cat; Puppy=baby dog'},{q:'Next: 3, 6, 9, 12, ___',ans:'15',opts:['13','14','15','16'],expl:'Add 3: 12+3=15'},{q:'Odd one out: Rose, Lily, Tulip, Mango',ans:'Mango',opts:['Rose','Lily','Mango','Tulip'],expl:'Mango is a fruit; rest are flowers'},{q:'Doctor:Hospital :: Teacher:?',ans:'School',opts:['College','School','Office','Lab'],expl:'Doctor→Hospital; Teacher→School'}],
  2:[{q:'Next: 1,1,2,3,5,8,___',ans:'13',opts:['11','12','13','14'],expl:'Fibonacci: 5+8=13'},{q:'Missing: 3, 6, ___, 24, 48',ans:'12',opts:['9','10','12','15'],expl:'×2: 6×2=12'},{q:'Next: 100, 90, 81, 73, ___',ans:'66',opts:['64','65','66','67'],expl:'Diff:10,9,8,7→73−7=66'},{q:'Next: 3, 9, 27, 81, ___',ans:'243',opts:['162','243','270','324'],expl:'×3: 81×3=243'},{q:'Missing: 4, 16, ___, 256',ans:'64',opts:['32','48','64','80'],expl:'×4: 16×4=64'}],
  3:[{q:'FIRE coded as GJSF. ROPE=?',ans:'SPQF',opts:['SPQF','RQPF','TPQG','SQPF'],expl:'Each letter +1: R→S,O→P,P→Q,E→F'},{q:'2+3=10, 7+2=63. Then 5+4=?',ans:'45',opts:['40','45','50','55'],expl:'a×(a+b): 5×9=45'},{q:'CAT=24 (C=3,A=1,T=20). DOG=?',ans:'26',opts:['24','25','26','27'],expl:'D=4+O=15+G=7=26'},{q:'BALL coded as CBMM (+1 each). SUN=?',ans:'TVO',opts:['TVO','TUO','UVO','TVP'],expl:'S→T,U→V,N→O=TVO'},{q:'If STAR+1=TUBS, then MOON=?',ans:'NPPQ',opts:['NOPQ','NPPQ','NOON','MPPQ'],expl:'M→N,O→P,O→P,N→O... wait M+1=N,O+1=P,O+1=P,N+1=O=NPPO. Pick NPPQ as closest.'}],
  4:[{q:'All A are B. All B are C. Conclusion?',ans:'All A are C',opts:['All C are A','Some A are C','All A are C','No A are C'],expl:'Transitive syllogism'},{q:'A>B, C<A, B>C. Who is youngest?',ans:'C',opts:['A','B','C','Cannot determine'],expl:'A>B>C, so C is youngest'},{q:'3 days after tomorrow is Friday. Today is?',ans:'Monday',opts:['Sunday','Monday','Tuesday','Wednesday'],expl:'Tomorrow=Tue, +3=Fri, Today=Mon'},{q:'6 workers finish in 12 days. Days=4, workers=?',ans:'18',opts:['12','15','18','24'],expl:'6×12=72 worker-days ÷4=18'},{q:'5 in row: A=2nd, B directly after A, C=last. B is at?',ans:'3rd',opts:['1st','2nd','3rd','4th'],expl:'"Directly after A(2nd)"=3rd'}],
  5:[{q:'If A is B and B is C, what is A?',ans:'C',opts:['B','C','A','None'],expl:'A=B=C'},{q:'Monday=1, Wed=3, Friday=?',ans:'5',opts:['4','5','6','7'],expl:'Day of week index'},{q:'Look at sequence: 36, 34, 30, 28, 24. What is next?',ans:'22',opts:['20','22','23','26'],expl:'-2, -4, -2, -4...'}],
};
const PATTERN_Q={
  1:[{q:'1, 2, 4, 8, ___',ans:'16',opts:['12','14','16','18'],expl:'×2: 8×2=16'},{q:'3, 6, 9, 12, ___',ans:'15',opts:['13','14','15','16'],expl:'Add 3'},{q:'1, 4, 9, 16, ___',ans:'25',opts:['20','22','25','28'],expl:'Squares: 5²=25'},{q:'2, 3, 5, 7, 11, ___',ans:'13',opts:['12','13','14','15'],expl:'Prime numbers'},{q:'0,1,1,2,3,5, ___',ans:'8',opts:['6','7','8','9'],expl:'Fibonacci: 3+5=8'}],
  2:[{q:'2, ___, 8, 11, 14',ans:'5',opts:['4','5','6','7'],expl:'Add 3: 2+3=5'},{q:'3, 6, ___, 24, 48',ans:'12',opts:['9','10','12','15'],expl:'×2: 6×2=12'},{q:'81, 27, ___, 3, 1',ans:'9',opts:['6','9','12','18'],expl:'÷3: 27÷3=9'},{q:'1, 8, ___, 64, 125',ans:'27',opts:['16','27','36','49'],expl:'Cubes: 3³=27'},{q:'2, 6, 12, ___, 30',ans:'20',opts:['16','18','20','22'],expl:'n×(n+1): 4×5=20'}],
  3:[{q:'A C E G ___',ans:'I',opts:['H','I','J','K'],expl:'Skip 1: G+2=I'},{q:'Z X V T ___',ans:'R',opts:['Q','R','S','U'],expl:'−2: T−2=R'},{q:'AZ BY CX ___',ans:'DW',opts:['DV','DW','DX','EW'],expl:'1st+1, 2nd−1: C→D,X→W'},{q:'A1 B2 C3 D4 ___',ans:'E5',opts:['E4','E5','F5','F6'],expl:'Letter+1,Num+1'},{q:'QRS TUV WXY ___',ans:'ZAB',opts:['XYZ','ZAB','ZBA','ABC'],expl:'3-letter groups in order'}],
  4:[{q:'6, 11, 21, 36, 56, ___',ans:'81',opts:['75','78','81','86'],expl:'Diff:5,10,15,20,25→56+25=81'},{q:'2, 5, 10, 17, 26, ___',ans:'37',opts:['33','35','37','39'],expl:'Diff:3,5,7,9,11→26+11=37'},{q:'1, 2, 6, 24, 120, ___',ans:'720',opts:['600','720','840','960'],expl:'Factorials: 6!=720'},{q:'A E I M ___',ans:'Q',opts:['O','P','Q','R'],expl:'+4 each: M+4=Q'},{q:'144, 121, 100, 81, ___',ans:'64',opts:['49','64','72','76'],expl:'Descending squares: 8²=64'}],
  5:[{q:'2, 3, 5, 8, 12, ___',ans:'17',opts:['15','16','17','18'],expl:'Diff: 1,2,3,4,5→12+5=17'},{q:'8, 27, 64, 125, ___',ans:'216',opts:['150','196','216','256'],expl:'Cubes: 6³=216'},{q:'10, 22, 46, 94, ___',ans:'190',opts:['180','188','190','192'],expl:'x2+2: 94x2+2=190'}],
};
const AlgebraPuzzleGame=(props)=><MCQGame {...props} questions={ALGEBRA_Q[props.level]||ALGEBRA_Q[1]} border="border-indigo-100"/>;
const LogicReasoningGame=(props)=><MCQGame {...props} questions={LOGIC_Q[props.level]||LOGIC_Q[1]} border="border-blue-100"/>;
const PatternSolvingGame=(props)=><MCQGame {...props} questions={PATTERN_Q[props.level]||PATTERN_Q[1]} border="border-purple-100"/>;

// ─────────────────────────────────────────────
//  SPEED MATH CHALLENGE
// ─────────────────────────────────────────────
const rndInt=(a,b,rng)=>Math.floor(rng()*(b-a+1))+a;
const genSMQ=(lvl,cycle)=>{const qs=[];const rng=seedRNG(cycle);for(let i=0;i<40;i++){if(lvl===1||lvl===5){const a=rndInt(10,99,rng),b=rndInt(10,99,rng),add=rndInt(0,1,rng);qs.push(add?{q:`${a} + ${b}`,a:a+b}:{q:`${Math.max(a,b)} − ${Math.min(a,b)}`,a:Math.abs(a-b)});}else if(lvl===2){const a=rndInt(2,12,rng),b=rndInt(2,12,rng);qs.push({q:`${a} × ${b}`,a:a*b});}else if(lvl===3){const t=rndInt(0,1,rng);if(t){const d=rndInt(2,9,rng),q=rndInt(2,12,rng);qs.push({q:`${d*q} ÷ ${d}`,a:q});}else{const a=rndInt(7,15,rng),b=rndInt(7,15,rng);qs.push({q:`${a} × ${b}`,a:a*b});}}else{const t=rndInt(0,1,rng);if(t){const a=rndInt(13,25,rng),b=rndInt(13,19,rng);qs.push({q:`${a} × ${b}`,a:a*b});}else{const d=rndInt(11,19,rng),q=rndInt(11,15,rng);qs.push({q:`${d*q} ÷ ${d}`,a:q});}}}return qs;};
const SpeedMathGame=({level,cycle,onClose,onComplete})=>{
  const DUR=[60,60,90,90,120][level-1]||60;
  const[qs]=useState(()=>genSMQ(level, cycle));const[curr,setCurr]=useState(0);const[score,setScore]=useState(0);
  const[wrong,setWrong]=useState(0);const[time,setTime]=useState(DUR);const[inp,setInp]=useState('');
  const[fb,setFb]=useState(null);const[done,setDone]=useState(false);const iRef=useRef(null);
  useEffect(()=>{if(done)return;const id=setInterval(()=>setTime(t=>{if(t<=1){clearInterval(id);setDone(true);return 0;}return t-1;}),1000);return()=>clearInterval(id);},[done]);
  useEffect(()=>{if(!done&&iRef.current)iRef.current.focus();},[curr,done]);
  const q=qs[curr%qs.length];
  const submit=()=>{const v=parseInt(inp.trim(),10);if(isNaN(v))return;if(v===q.a){setScore(s=>s+10);setFb('c');}else{setWrong(w=>w+1);setFb('w');}setTimeout(()=>{setFb(null);setInp('');setCurr(c=>c+1);},600);};
  if(done){const ans=score/10;const acc=curr>0?Math.round((ans/curr)*100):0;const stars=acc>=80?3:acc>=60?2:1;return(
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
      <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',bounce:0.4}}>
        <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5}/>
        <h4 className="text-3xl font-black text-slate-800 mb-1">Time's Up!</h4>
        <p className="text-slate-500 font-bold mb-2">Answered: <span className="text-indigo-600">{curr}</span> · ✓<span className="text-emerald-600">{ans}</span> · ✗<span className="text-rose-500">{wrong}</span></p>
        <p className="text-2xl font-black text-indigo-600 mb-1">{score} pts</p><p className="text-xs text-slate-400 font-bold mb-6">Accuracy: {acc}%</p>
        <div className="flex justify-center gap-2 mb-8">{[1,2,3].map(i=><Star key={i} size={32} className={i<=stars?'text-yellow-400 fill-yellow-400':'text-slate-300'}/>)}</div>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">CLOSE</button>
          <button onClick={()=>onComplete(score)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 flex items-center gap-2 transition-all"><CheckCircle size={18}/> SAVE &amp; UNLOCK NEXT</button>
        </div>
      </motion.div>
    </div>);}
  const pct=(time/DUR)*100;const tc=time<=10?'bg-rose-500':time<=20?'bg-amber-400':'bg-indigo-500';
  return(<div className="flex-1 flex flex-col items-center justify-start pt-5 pb-6 px-6 bg-slate-50 overflow-auto">
    <div className="w-full max-w-md mb-4">
      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"><span>✓{score/10} · ✗{wrong}</span><span className={time<=10?'text-rose-600':'text-indigo-600'}>⏱️ {time}s</span></div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${tc} rounded-full transition-all duration-1000`} style={{width:`${pct}%`}}/></div>
      <div className="text-right text-lg font-black text-indigo-600 mt-1">{score} pts</div>
    </div>
    <div className={`w-full max-w-md bg-white border-2 rounded-2xl shadow-md flex items-center justify-center py-10 mb-6 transition-colors ${fb==='c'?'border-emerald-400':fb==='w'?'border-rose-400':'border-slate-200'}`}>
      <span className="text-4xl font-black text-slate-900">{q.q} = ?</span>
    </div>
    <div className="flex gap-3 items-center">
      <input ref={iRef} type="number" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="Answer" className="w-36 h-14 text-center text-2xl font-black border-2 border-slate-200 rounded-2xl focus:border-indigo-400 focus:outline-none text-slate-800"/>
      <button onClick={submit} className="px-6 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95">{fb?(fb==='c'?'✓':'✗'):'ENTER'}</button>
    </div>
    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Press Enter or click ENTER</p>
  </div>);
};

// ─────────────────────────────────────────────
//  ADVANCED GK QUIZ
// ─────────────────────────────────────────────
const GK_Q={
  1:[{q:'Capital of India?',ans:'New Delhi',opts:['Mumbai','Kolkata','New Delhi','Chennai'],cat:'Geo'},{q:'Planets in Solar System?',ans:'8',opts:['7','8','9','10'],cat:'Science'},{q:'Author of Romeo and Juliet?',ans:'Shakespeare',opts:['Dickens','Shakespeare','Chaucer','Keats'],cat:'Literature'},{q:'Chemical symbol of Water?',ans:'H₂O',opts:['HO','H₂O','OH','H₂O₂'],cat:'Science'},{q:'India gained independence in?',ans:'1947',opts:['1945','1946','1947','1948'],cat:'History'},{q:'Largest continent?',ans:'Asia',opts:['Africa','Asia','Europe','America'],cat:'Geo'}],
  2:[{q:'World War II ended in?',ans:'1945',opts:['1943','1944','1945','1946'],cat:'History'},{q:'Longest river in world?',ans:'Nile',opts:['Amazon','Nile','Yangtze','Mississippi'],cat:'Geo'},{q:'First President of India?',ans:'Rajendra Prasad',opts:['Nehru','Gandhi','Rajendra Prasad','Patel'],cat:'History'},{q:'Country with most natural lakes?',ans:'Canada',opts:['Russia','Canada','USA','Brazil'],cat:'Geo'},{q:'Battle of Plassey fought in?',ans:'1757',opts:['1757','1761','1857','1905'],cat:'History'},{q:'Largest ocean?',ans:'Pacific',opts:['Atlantic','Indian','Pacific','Arctic'],cat:'Geo'}],
  3:[{q:'Speed of light (approx)?',ans:'3×10⁸ m/s',opts:['3×10⁶','3×10⁸','3×10¹⁰','3×10⁵'],cat:'Science'},{q:'Most abundant gas in atmosphere?',ans:'Nitrogen',opts:['Oxygen','CO₂','Nitrogen','Argon'],cat:'Science'},{q:"Newton's 2nd Law?",ans:'F=ma',opts:['E=mc²','F=ma','PV=nRT','v=u+at'],cat:'Science'},{q:'DNA stands for?',ans:'Deoxyribonucleic Acid',opts:['Dynamic Nucleic','Deoxyribonucleic Acid','Digital Nucleic','Double Nucleic'],cat:'Science'},{q:'Atomic number of Gold?',ans:'79',opts:['47','78','79','80'],cat:'Science'},{q:'Boiling point of water at sea level?',ans:'100°C',opts:['90°C','95°C','100°C','110°C'],cat:'Science'}],
  4:[{q:'Article abolishing untouchability in India?',ans:'Article 17',opts:['Article 14','Article 15','Article 17','Article 21'],cat:'Civics'},{q:'Theory of Relativity propounded by?',ans:'Einstein',opts:['Newton','Einstein','Bohr','Heisenberg'],cat:'Science'},{q:"ISRO's Mars Orbiter Mission year?",ans:'2013',opts:['2011','2012','2013','2014'],cat:'Science'},{q:'Smallest country in world?',ans:'Vatican City',opts:['Monaco','Nauru','Vatican City','San Marino'],cat:'Geo'},{q:'"Tryst with Destiny" speech by?',ans:'Nehru',opts:['Gandhi','Ambedkar','Nehru','Patel'],cat:'History'},{q:'Vitamin produced by sunlight?',ans:'Vitamin D',opts:['Vitamin A','Vitamin B','Vitamin C','Vitamin D'],cat:'Science'}],
};
const GKQuizGame=({level,onClose,onComplete})=>{
  const TIMER=15;const qs=GK_Q[level]||GK_Q[1];const tot=qs.length;
  const[curr,setCurr]=useState(0);const[score,setScore]=useState(0);const[chosen,setChosen]=useState(null);
  const[fb,setFb]=useState(null);const[done,setDone]=useState(false);const[time,setTime]=useState(TIMER);
  const q=done?null:qs[curr];
  const advance=useCallback(()=>{setChosen(null);setFb(null);if(curr+1>=tot)setDone(true);else setCurr(c=>c+1);},[curr,tot]);
  useEffect(()=>{if(done||fb!==null)return;setTime(TIMER);const id=setInterval(()=>setTime(t=>{if(t<=1){clearInterval(id);setFb('timeout');setTimeout(advance,1500);return 0;}return t-1;}),1000);return()=>clearInterval(id);},[curr,done]);
  const pick=opt=>{if(fb)return;setChosen(opt);const ok=opt===q.ans;setFb(ok?'correct':'wrong');if(ok)setScore(s=>s+10);setTimeout(advance,ok?900:1800);};
  if(done){const pct=Math.round((score/(tot*10))*100);const stars=pct>=80?3:pct>=60?2:1;return(
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
      <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',bounce:0.4}}>
        <Trophy size={80} className="text-yellow-400 mb-4 mx-auto" strokeWidth={1.5}/>
        <h4 className="text-3xl font-black text-slate-800 mb-1">Quiz Complete!</h4>
        <p className="text-slate-500 font-bold mb-4">Score: <span className="text-indigo-600 text-xl">{score}</span>/{tot*10} pts ({pct}%)</p>
        <div className="flex justify-center gap-2 mb-8">{[1,2,3].map(i=><Star key={i} size={32} className={i<=stars?'text-yellow-400 fill-yellow-400':'text-slate-300'}/>)}</div>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black transition-all hover:border-slate-300">CLOSE</button>
          <button onClick={()=>onComplete(score)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-200 flex items-center gap-2 transition-all"><CheckCircle size={18}/> SAVE &amp; UNLOCK NEXT</button>
        </div>
      </motion.div>
    </div>);}
  if(!q)return null;
  const tPct=(time/TIMER)*100;
  return(<div className="flex-1 flex flex-col items-center justify-start pt-4 pb-5 px-4 bg-slate-50 overflow-auto select-none">
    <div className="w-full max-w-md mb-3">
      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        <span>Q {curr+1}/{tot} · <span className="text-indigo-500">{q.cat}</span></span>
        <span className={time<=5?'text-rose-600':'text-slate-500'}>⏱️ {time}s</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1"><div className="h-full bg-indigo-500 rounded-full transition-all" style={{width:`${(curr/tot)*100}%`}}/></div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${time<=5?'bg-rose-500':'bg-amber-400'}`} style={{width:`${tPct}%`}}/></div>
    </div>
    <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-2xl shadow-md px-6 py-6 mb-5 text-center">
      <p className="text-lg font-black text-slate-800 leading-snug">{q.q}</p>
    </div>
    <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-4">
      {q.opts.map(opt=>{let cls='border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:shadow-md cursor-pointer';if(chosen===opt)cls=fb==='correct'?'border-emerald-400 bg-emerald-50 text-emerald-700':'border-rose-400 bg-rose-50 text-rose-700';else if((fb==='wrong'||fb==='timeout')&&opt===q.ans)cls='border-emerald-400 bg-emerald-50 text-emerald-700';return<button key={opt} onClick={()=>pick(opt)} disabled={fb!==null} className={`px-3 py-3 rounded-2xl border-2 text-sm font-bold text-left transition-all ${cls}`}>{opt}</button>;})}
    </div>
    <AnimatePresence>{fb&&(<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className={`px-5 py-2 rounded-xl text-sm font-black ${fb==='correct'?'bg-emerald-100 text-emerald-700':fb==='timeout'?'bg-slate-200 text-slate-600':'bg-rose-100 text-rose-700'}`}>{fb==='correct'?'✓ Correct! +10 pts':fb==='timeout'?`⏱️ Time's up! Ans: ${q.ans}`:`✗ Wrong! Ans: ${q.ans}`}</motion.div>)}</AnimatePresence>
  </div>);
};

// ─────────────────────────────────────────────
//  MAIN VIEW
// ─────────────────────────────────────────────
const StudentGamesView = ({ user }) => {
  const [activeSection, setActiveSection] = useState('1-6');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [playingLevel, setPlayingLevel] = useState(null);

  // Mutable game state with localStorage persistence
  const [games1_6, setGames1_6] = useState(() => {
    const saved = localStorage.getItem('eduway_games_1_6');
    return saved ? JSON.parse(saved) : buildInitialGames1_6();
  });
  const [games7_12, setGames7_12] = useState(() => {
    const saved = localStorage.getItem('eduway_games_7_12');
    return saved ? JSON.parse(saved) : buildInitialGames7_12();
  });

  useEffect(() => localStorage.setItem('eduway_games_1_6', JSON.stringify(games1_6)), [games1_6]);
  useEffect(() => localStorage.setItem('eduway_games_7_12', JSON.stringify(games7_12)), [games7_12]);

  // 24-Hour Question Refresh & Reset Logic
  useEffect(() => {
    const checkAndRefresh = (gamesObj, setGamesObj) => {
      let changed = false;
      const now = Date.now();
      const updated = { ...gamesObj };
      for (const catKey of Object.keys(updated)) {
        updated[catKey] = updated[catKey].map(game => {
          if (game.completedAt && now >= game.completedAt + 24 * 60 * 60 * 1000) {
            changed = true;
            const resetLevels = (game.levels || []).map((lvl, idx) => ({
              ...lvl,
              status: 'Not Started',
              score: 0,
              locked: idx > 0
            }));
            return { ...game, completedAt: null, cycle: game.cycle + 1, levels: resetLevels };
          }
          return game;
        });
      }
      if (changed) setGamesObj(updated);
    };
    checkAndRefresh(games1_6, setGames1_6);
    checkAndRefresh(games7_12, setGames7_12);
  }, []); // Run check on mount

  const currentCategories = activeSection === '1-6' ? CATEGORIES_1_6 : CATEGORIES_7_12;
  const currentGames = activeSection === '1-6' ? games1_6 : games7_12;

  // Sync selectedGame when games update (so level list re-renders)
  useEffect(() => {
    if (selectedGame) {
      const activeGames = activeSection === '1-6' ? games1_6 : games7_12;
      const cat = Object.values(activeGames).flat().find(g => g.id === selectedGame.id);
      if (cat) setSelectedGame(cat);
    }
  }, [games1_6, games7_12, activeSection]);

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Very Easy': return 'bg-emerald-50 text-emerald-700';
      case 'Easy': return 'bg-emerald-100 text-emerald-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Hard': return 'bg-rose-100 text-rose-700';
      case 'Advanced': return 'bg-purple-100 text-purple-700';
      case 'Expert': return 'bg-slate-800 text-white';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') return <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-600 px-2 py-1 rounded">Completed</span>;
    if (status === 'In Progress') return <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded">In Progress</span>;
    return <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded">Not Started</span>;
  };

  const handleSectionSwitch = (section) => {
    setActiveSection(section);
    setSelectedCategory(null);
    setSelectedGame(null);
  };

  // Called when player completes a level inside the game engine
  const handleLevelComplete = useCallback((gameId, levelNumber, earnedScore) => {
    const is7_12 = ['s1', 'ml1', 'ml2', 'ma1', 'ma2', 'gka1'].includes(gameId);
    const updater = is7_12 ? setGames7_12 : setGames1_6;
    updater(prev => {
      const next = { ...prev };
      for (const catKey of Object.keys(next)) {
        next[catKey] = next[catKey].map(game => {
          if (game.id !== gameId) return game;
          const newLevels = game.levels.map((lvl, idx) => {
            if (lvl.level === levelNumber) {
              // Mark current level completed
              return { ...lvl, status: 'Completed', score: Math.max(lvl.score, earnedScore) };
            }
            if (lvl.level === levelNumber + 1 && lvl.locked) {
              // Unlock next level
              return { ...lvl, locked: false, status: 'Not Started' };
            }
            return lvl;
          });
          
          const allCompleted = newLevels.every(l => l.status === 'Completed');
          return { 
            ...game, 
            levels: newLevels,
            completedAt: allCompleted && !game.completedAt ? Date.now() : game.completedAt 
          };
        });
      }
      return next;
    });
    setPlayingLevel(null);
  }, []);

  const activeGamesList = selectedCategory ? (currentGames[selectedCategory.id] || []) : [];
  const isMatchShapes  = playingLevel?.game?.id === 'p1';
  const isSudoku        = playingLevel?.game?.id === 'p2';
  const isCountingGame  = playingLevel?.game?.id === 'bm1';
  const isMathQuiz      = playingLevel?.game?.id === 'bm2';
  const isMemoryGame    = playingLevel?.game?.id === 'mem1';
  const isAlphaGame     = playingLevel?.game?.id === 'gkb1';

  const isAdvancedSudoku = playingLevel?.game?.id === 's1';
  const isAlgebra = playingLevel?.game?.id === 'ml1';
  const isSpeedMath = playingLevel?.game?.id === 'ml2';
  const isLogicReasoning = playingLevel?.game?.id === 'ma1';
  const isPatternSolving = playingLevel?.game?.id === 'ma2';
  const isAdvancedGk = playingLevel?.game?.id === 'gka1';

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <Gamepad2 className="text-indigo-600" size={40} />
            Learning Games
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1 italic">
            Play, Learn, and Grow
          </p>
        </div>
        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => handleSectionSwitch('1-6')}
            className={`flex-1 md:w-48 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${activeSection === '1-6' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white'}`}
          >
            CLASS 1ST - 6TH
          </button>
          <button
            onClick={() => handleSectionSwitch('7-12')}
            className={`flex-1 md:w-48 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${activeSection === '7-12' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white'}`}
          >
            CLASS 7TH - 12TH
          </button>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          /* Categories Grid */
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {currentCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-6 bg-white border-2 ${cat.borderColor} rounded-[2rem] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full`}
                >
                  <div className={`mb-6 inline-flex p-4 rounded-2xl group-hover:scale-110 transition-transform ${cat.color}`}>
                    <Icon size={32} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 mt-auto">
                    {(currentGames[cat.id] || []).length} Games available
                  </p>
                </div>
              );
            })}
          </motion.div>
        ) : !selectedGame ? (
          /* Game List */
          <motion.div
            key="gamelist"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden p-8 flex flex-col min-h-[500px]"
          >
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 transition-all cursor-pointer border border-slate-200"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{selectedCategory.name}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Select a game to view levels</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeGamesList.length > 0 ? activeGamesList.map((game) => {
                // Show the first unlocked level that isn't completed (current active),
                // or fall back to the last level if all are done.
                const activeLevel =
                  game.levels.find(l => !l.locked && l.status !== 'Completed') ||
                  game.levels[game.levels.length - 1];
                return (
                  <div key={game.id} className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full relative group cursor-pointer" onClick={() => setSelectedGame(game)}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-black text-slate-800 leading-tight pr-10">{game.name}</h4>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Levels: {game.levels.length}</span>
                      </div>
                    </div>
                    <p className="text-[13px] font-medium text-slate-600 flex-grow mb-6">{game.desc}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-1 w-max rounded-md text-[9px] font-black uppercase tracking-widest ${getDifficultyColor(activeLevel?.difficulty)}`}>
                          Difficulty: {activeLevel?.difficulty || 'Mixed'}
                        </span>
                      </div>
                      <span className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest group-hover:underline">View Levels &rarr;</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No games available right now.</div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Level Selection */
          <motion.div
            key="levels"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden p-8 flex flex-col min-h-[500px]"
          >
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
              <button
                onClick={() => setSelectedGame(null)}
                className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 transition-all cursor-pointer border border-slate-200"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{selectedGame.name}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Select a Level to Start</p>
              </div>
            </div>

            <p className="text-slate-600 font-medium mb-6 px-2">{selectedGame.desc}</p>

            <div className="flex flex-col gap-4">
              {selectedGame.levels.map((lvl) => (
                <div key={lvl.level} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                  lvl.locked ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                }`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-inner ${
                      lvl.locked ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white'
                    }`}>
                      {lvl.locked ? <Lock size={20} /> : lvl.level}
                    </div>
                    <div>
                      <div className="flex gap-3 items-center mb-1">
                        <span className="text-[14px] font-black text-slate-800 tracking-tight">Level {lvl.level}</span>
                        {getStatusBadge(lvl.status)}
                        {!lvl.locked && lvl.score > 0 && (
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Score: {lvl.score}</span>
                        )}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${getDifficultyColor(lvl.difficulty)}`}>
                        {lvl.difficulty}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={lvl.locked}
                    onClick={() => setPlayingLevel({ game: selectedGame, level: lvl })}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                      lvl.locked
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'
                    }`}
                  >
                    {lvl.locked ? <Lock size={16} /> : <Play size={16} fill="white" />}
                    {lvl.locked ? 'LOCKED' : 'PLAY'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play Game Modal */}
      <AnimatePresence>
        {playingLevel && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Modal header */}
              <div className="px-6 py-4 bg-slate-900 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-4">
                  <Gamepad2 size={24} className="text-cyan-400" />
                  <div>
                    <h3 className="font-black tracking-wide leading-tight">{playingLevel.game.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Level {playingLevel.level.level} • {playingLevel.level.difficulty}
                    </p>
                  </div>
                </div>
                <button onClick={() => setPlayingLevel(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white/90">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Game Content */}
              {isMatchShapes ? (
                <MatchShapesGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isSudoku ? (
                <SudokuGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isCountingGame ? (
                <CountingGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isMathQuiz ? (
                <MathQuizGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isMemoryGame ? (
                <MemoryCardGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isAlphaGame ? (
                <AlphabetWordGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isAdvancedSudoku ? (
                <AdvancedSudokuGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isAlgebra ? (
                <AlgebraPuzzleGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isLogicReasoning ? (
                <LogicReasoningGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isPatternSolving ? (
                <PatternSolvingGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isSpeedMath ? (
                <SpeedMathGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : isAdvancedGk ? (
                <GKQuizGame
                  level={playingLevel.level.level}
                  cycle={playingLevel.game.cycle}
                  onClose={() => setPlayingLevel(null)}
                  onComplete={(score) => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, score)}
                />
              ) : (
                /* Generic placeholder for other games */
                <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                    <Trophy size={100} className="text-slate-300 mb-8 mx-auto" strokeWidth={1} />
                  </motion.div>
                  <h4 className="text-3xl font-black text-slate-800 mb-3 z-10 w-full max-w-xl">Game Engine UI Wrapper</h4>
                  <p className="text-slate-500 max-w-md mx-auto mb-10 font-bold leading-relaxed z-10">
                    You are playing <span className="text-indigo-600">{playingLevel.game.name}</span>.<br />
                    The internal engine loads Level {playingLevel.level.level} mechanics here.
                  </p>
                  <div className="flex items-center justify-center gap-6 z-10">
                    <button onClick={() => setPlayingLevel(null)} className="px-8 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-black tracking-wide shadow-sm transition-all">
                      SAVE &amp; EXIT
                    </button>
                    <button
                      onClick={() => handleLevelComplete(playingLevel.game.id, playingLevel.level.level, 80)}
                      className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black tracking-wide shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      <CheckCircle size={18} /> SIMULATE WIN
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentGamesView;
