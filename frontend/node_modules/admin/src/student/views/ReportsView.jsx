import { motion } from 'framer-motion';
import { TrendingUp, Award, BarChart2, Target, Calendar, Sparkles, ChevronRight, ArrowUpRight } from 'lucide-react';

const subjects = [
  { name: 'Mathematics', score: 88, prev: 75, color: 'from-blue-500 to-indigo-600', max: 100 },
  { name: 'English', score: 92, prev: 85, color: 'from-emerald-400 to-teal-600', max: 100 },
  { name: 'Biology', score: 76, prev: 72, color: 'from-violet-500 to-purple-600', max: 100 },
  { name: 'Social Studies', score: 84, prev: 80, color: 'from-orange-400 to-amber-600', max: 100 },
  { name: 'Physics', score: 70, prev: 65, color: 'from-rose-500 to-pink-600', max: 100 },
];

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`group relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl ${color} text-white`}
  >
    <div className="absolute top-[-10%] right-[-5%] w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-white/60 text-[11px] font-black uppercase tracking-widest mb-1.5">{label}</p>
      <p className="font-plus-jakarta font-black text-4xl leading-none">{value}</p>
      {sub && <p className="text-white/40 text-[12px] font-bold mt-2 uppercase tracking-widest">{sub}</p>}
    </div>
  </motion.div>
);

const SpiderChart = ({ subjects }) => {
  const size = 260;
  const cx = size / 2, cy = size / 2, r = 100;
  const n = subjects.length;
  const getPoint = (i, val) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    const rv = r * val / 100;
    return { x: cx + rv * Math.cos(angle), y: cy + rv * Math.sin(angle) };
  };
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  const activeColors = ['#3b82f6','#10b981','#8b5cf6','#f97316','#ec4899'];

  return (
    <div className="relative">
        <svg width={size} height={size} className="overflow-visible drop-shadow-2xl">
        {gridLevels.map(lvl => (
            <polygon key={lvl} points={subjects.map((_, i) => { const p = getPoint(i, lvl * 100); return `${p.x},${p.y}`; }).join(' ')}
            fill="none" stroke="rgba(203, 213, 225, 0.3)" strokeWidth="1" strokeDasharray={lvl === 1 ? '0' : '4 4'} />
        ))}
        {subjects.map((_, i) => { const p = getPoint(i, 100); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(203, 213, 225, 0.3)" strokeWidth="1" />; })}
        
        <motion.polygon
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            points={subjects.map((s, i) => { const p = getPoint(i, s.score); return `${p.x},${p.y}`; }).join(' ')}
            className="fill-blue-500/10 stroke-blue-500"
            strokeWidth="3"
            strokeLinejoin="round"
        />
        
        {subjects.map((s, i) => { const p = getPoint(i, s.score); return (
            <g key={i}>
                <circle cx={p.x} cy={p.y} r="6" className="fill-white stroke-blue-500" strokeWidth="2" />
                <circle cx={p.x} cy={p.y} r="3" fill={activeColors[i]} />
            </g>
        )})}
        </svg>
    </div>
  );
};

const ReportsView = () => (
  <div className="flex flex-col gap-10 w-full pb-20">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta">Performance Hub</h2>
          <p className="text-[15px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Academic Year 2024–25 · Term 2 Results</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/50 shadow-sm">
           <button className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-3xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-black transition-all">
                Download PDF Report <ChevronRight className="w-4 h-4" />
           </button>
        </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard icon={Award} label="Overall Grade" value="A+" sub="Top 5% of Class" color="bg-gradient-to-br from-blue-600 to-indigo-700" delay={0.1} />
      <StatCard icon={Target} label="Average Score" value="82.4%" sub="+7.2% Improvement" color="bg-gradient-to-br from-emerald-500 to-teal-600" delay={0.2} />
      <StatCard icon={TrendingUp} label="Class Rank" value="#4" sub="32 Total Students" color="bg-gradient-to-br from-violet-600 to-purple-700" delay={0.3} />
      <StatCard icon={BarChart2} label="Attendance" value="94.1%" sub="47 Operating Days" color="bg-gradient-to-br from-orange-500 to-amber-600" delay={0.4} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[500px]">
      {/* Bar Chart Container */}
      <div className="lg:col-span-7 bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 border border-white/60 shadow-xl shadow-blue-500/5 flex flex-col gap-10 group">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-extrabold text-slate-900 font-plus-jakarta">Subject Breakdown</h3>
            <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <Sparkles className="w-5 h-5" />
            </button>
        </div>

        <div className="flex flex-col gap-8 flex-grow">
          {subjects.map((s, i) => (
            <div key={s.name} className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="text-[14px] font-black text-slate-800 uppercase tracking-widest">{s.name}</span>
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-emerald-500">+{s.score - s.prev}%</span>
                    <span className="text-xl font-black text-slate-900 font-plus-jakarta">{s.score}%</span>
                </div>
              </div>
              <div className="relative h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 flex-grow">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.score}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${s.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spider Chart Container */}
      <div className="lg:col-span-5 bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group border border-slate-800 shadow-2xl">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
        
        <h3 className="text-2xl font-extrabold font-plus-jakarta mb-2 relative z-10">Skill Mastery</h3>
        <p className="text-white/40 text-[13px] font-bold mb-10 uppercase tracking-widest relative z-10 italic">Holistic Strength Profile</p>
        
        <div className="flex items-center justify-center relative z-10 py-10">
          <SpiderChart subjects={subjects} />
        </div>
        
        <div className="grid grid-cols-2 gap-3 relative z-10 mt-6">
          {subjects.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl">
               <div className={`w-3 h-3 rounded-full shrink-0`} style={{ background: ['#3b82f6','#10b981','#8b5cf6','#f97316','#ec4899'][i] }} />
               <span className="text-[11px] font-bold uppercase tracking-widest text-white/70 truncate">{s.name}</span>
            </div>
          ))}
        </div>
        
        <motion.button 
            whileHover={{ scale: 1.02 }}
            className="w-full mt-10 py-4 bg-blue-600 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 relative z-10 hover:bg-blue-700 transition-all"
        >
            View Detailed Analysis <ArrowUpRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  </div>
);

export default ReportsView;
