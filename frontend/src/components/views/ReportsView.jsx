import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, BarChart2, Target } from 'lucide-react';

const subjects = [
  { name: 'Mathematics', score: 88, prev: 75, color: 'bg-blue-500', max: 100 },
  { name: 'English', score: 92, prev: 85, color: 'bg-emerald-500', max: 100 },
  { name: 'Biology', score: 76, prev: 72, color: 'bg-violet-500', max: 100 },
  { name: 'Social Studies', score: 84, prev: 80, color: 'bg-orange-500', max: 100 },
  { name: 'Physics', score: 70, prev: 65, color: 'bg-pink-500', max: 100 },
];

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className={`rounded-2xl p-5 flex items-center gap-4 ${color}`}>
    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Icon className="w-5 h-5 text-white" /></div>
    <div>
      <p className="text-white/70 text-[11px] font-normal uppercase tracking-widest">{label}</p>
      <p className="text-white font-semibold text-[22px] leading-tight">{value}</p>
      {sub && <p className="text-white/60 text-[11px] font-medium">{sub}</p>}
    </div>
  </div>
);

const SpiderChart = ({ subjects }) => {
  const size = 220;
  const cx = size / 2, cy = size / 2, r = 80;
  const n = subjects.length;
  const getPoint = (i, val) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    const rv = r * val / 100;
    return { x: cx + rv * Math.cos(angle), y: cy + rv * Math.sin(angle) };
  };
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const colors = ['#3b82f6','#10b981','#8b5cf6','#f97316','#ec4899'];

  return (
    <svg width={size} height={size} className="overflow-visible">
      {gridLevels.map(lvl => (
        <polygon key={lvl} points={subjects.map((_, i) => { const p = getPoint(i, lvl * 100); return `${p.x},${p.y}`; }).join(' ')}
          fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {subjects.map((_, i) => { const p = getPoint(i, 100); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />; })}
      <polygon
        points={subjects.map((s, i) => { const p = getPoint(i, s.score); return `${p.x},${p.y}`; }).join(' ')}
        fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="2"
      />
      {subjects.map((s, i) => { const p = getPoint(i, s.score); return <circle key={i} cx={p.x} cy={p.y} r="4" fill={colors[i]} />; })}
    </svg>
  );
};

const ReportsView = () => (
  <div className="flex flex-col gap-8 w-full">
    <div>
      <h2 className="text-[22px] font-semibold text-slate-900">Reports & Results</h2>
      <p className="text-sm text-slate-400 font-medium mt-0.5">Academic Year 2024–25 · Term 2</p>
    </div>
    <div className="grid grid-cols-4 gap-4">
      <StatCard icon={Award} label="Overall Grade" value="A+" color="bg-gradient-to-br from-blue-500 to-blue-600" />
      <StatCard icon={Target} label="Average Score" value="82%" sub="+7% from Term 1" color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
      <StatCard icon={TrendingUp} label="Rank in Class" value="#4" sub="Out of 32 students" color="bg-gradient-to-br from-violet-500 to-violet-600" />
      <StatCard icon={BarChart2} label="Attendance" value="94%" sub="47 of 50 days" color="bg-gradient-to-br from-orange-500 to-orange-600" />
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-[16px] font-semibold text-slate-900">Subject Performance</h3>
        <div className="flex flex-col gap-3">
          {subjects.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-slate-500 w-24 truncate">{s.name}</span>
              <div className="flex-grow h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.score}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                  className={`h-full ${s.color} rounded-full`}
                />
              </div>
              <span className="text-[12px] font-semibold text-slate-900 w-8 text-right">{s.score}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-[16px] font-semibold text-slate-900">Strengths Radar</h3>
        <div className="flex items-center justify-center">
          <SpiderChart subjects={subjects} />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {subjects.map((s, i) => (
            <span key={s.name} className="text-[10px] font-normal flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: ['#3b82f6','#10b981','#8b5cf6','#f97316','#ec4899'][i] }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ReportsView;
