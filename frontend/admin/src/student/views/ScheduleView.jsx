import { motion } from 'framer-motion';
import { Video, Clock, MapPin, ChevronLeft, ChevronRight, Users, Sparkles } from 'lucide-react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const schedule = [
  { time: '8:30 AM', subject: 'Mathematics', teacher: 'Mrs. Goodman', room: 'B3, Room 124', color: 'bg-blue-100 text-blue-700', live: true, minsLeft: 3 },
  { time: '10:30 AM', subject: 'English Language Arts', teacher: 'Ms. Melton', room: 'B2, Room 158', color: 'bg-emerald-100 text-emerald-700', live: false, minsLeft: 120 },
  { time: '12:00 PM', subject: 'Biology', teacher: 'Mr. Hodge', room: 'B3, Room 310', color: 'bg-violet-100 text-violet-700', live: false, minsLeft: 210 },
  { time: '2:00 PM', subject: 'Social Studies', teacher: 'Mrs. Murray', room: 'B1, Room 112', color: 'bg-orange-100 text-orange-700', live: false, minsLeft: 330 },
  { time: '3:30 PM', subject: 'Physical Education', teacher: 'Coach Davis', room: 'Sports Hall', color: 'bg-pink-100 text-pink-700', live: false, minsLeft: 420 },
];

const ClassCard = ({ time, subject, teacher, room, color, live, minsLeft }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.01 }}
    className="group bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all flex flex-col sm:flex-row items-center gap-6"
  >
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-[2rem] text-white min-w-[100px] shadow-lg shadow-slate-900/10">
      <span className="text-[14px] font-black font-plus-jakarta">{time.split(' ')[0]}</span>
      <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{time.split(' ')[1]}</span>
    </div>

    <div className="flex-grow text-center sm:text-left">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
        <h4 className="text-[18px] font-extrabold text-slate-900 font-plus-jakarta leading-none">{subject}</h4>
        {live && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500 text-white rounded-full text-[10px] font-black animate-pulse shadow-lg shadow-rose-500/20 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> Live
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[12px] text-slate-400 font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {teacher}</span>
        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {room}</span>
      </div>
    </div>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`group/btn flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[13px] font-bold transition-all ${
        live || minsLeft <= 5
          ? 'bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:bg-blue-700'
          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
      }`}
      disabled={!live && minsLeft > 5}
    >
      <Video className={`w-4 h-4 ${live ? 'animate-bounce' : ''}`} />
      {live ? 'Join Session' : minsLeft <= 5 ? 'Join Soon' : `${minsLeft}m Left`}
    </motion.button>
  </motion.div>
);

const ScheduleView = () => {
  return (
    <div className="flex flex-col gap-10 w-full pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta">My Schedule</h2>
          <p className="text-[15px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Thursday, May 14, 2025</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 backdrop-blur-xl p-2 rounded-[2rem] border border-white/50 shadow-sm">
          <button className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm group">
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
          </button>
          <div className="flex gap-1">
            {days.map((d, i) => (
              <button 
                key={d} 
                className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all ${
                  i === 3 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm group">
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
          </button>
        </div>
      </div>

      {/* Hero Live Session Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-[3.5rem] p-10 text-white shadow-[0_30px_60px_-15px_rgba(37,99,235,0.3)] overflow-hidden group"
      >
        <Sparkles className="absolute top-[-10%] right-[-5%] w-64 h-64 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
        <div className="absolute top-10 right-10 flex gap-2">
            {[1,2,3].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/30" />
            ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-4xl shadow-xl">
               📐
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-4 py-1.5 bg-rose-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/30">Live Now</span>
                <span className="text-[13px] font-bold text-white/60 uppercase tracking-widest italic">Mathematics</span>
              </div>
              <h3 className="text-4xl font-extrabold font-plus-jakarta mb-2">Advance Geometry</h3>
              <p className="text-white/70 font-bold text-[15px]">Session with Mrs. Goodman — Class Starts in 3 mins</p>
            </div>
          </div>
          
          <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             className="bg-white text-blue-600 px-10 py-5 rounded-[2rem] font-black text-[15px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl hover:bg-blue-50 transition-all"
          >
            <Video className="w-5 h-5" /> Join Studio
          </motion.button>
        </div>
      </motion.div>

      <div className="flex flex-col gap-6">
        <h3 className="text-[18px] font-extrabold text-slate-800 px-4 font-plus-jakarta uppercase tracking-widest">Daily Timeline</h3>
        <div className="flex flex-col gap-4">
          {schedule.map((cls, i) => <ClassCard key={i} {...cls} />)}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
