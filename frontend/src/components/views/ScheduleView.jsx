import React from 'react';
import { motion } from 'framer-motion';
import { Video, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

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
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ y: -2 }}
    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-5"
  >
    <div className={`w-3 h-14 rounded-full ${color.replace('text-', 'bg-').split(' ')[0].replace('bg-', 'bg-').replace('100', '400')}`} />
    <div className="flex-grow">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-normal text-slate-400 uppercase tracking-widest">{time}</span>
        {live && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-semibold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> LIVE NOW
          </span>
        )}
        {!live && minsLeft < 15 && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-[10px] font-semibold">
            In {minsLeft} min
          </span>
        )}
      </div>
      <h4 className="text-[15px] font-semibold text-slate-900">{subject}</h4>
      <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-400 font-medium">
        <span>{teacher}</span>
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {room}</span>
      </div>
    </div>
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-normal transition-all ${
        live || minsLeft <= 5
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600'
          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
      }`}
      disabled={!live && minsLeft > 5}
    >
      <Video className="w-4 h-4" />
      {live ? 'Join Now' : minsLeft <= 5 ? 'Join Soon' : 'Upcoming'}
    </button>
  </motion.div>
);

const ScheduleView = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[22px] font-semibold text-slate-900 tracking-tight">My Schedule</h2>
          <p className="text-sm text-slate-400 font-medium mt-0.5">Thursday, May 14, 2025</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 border border-slate-100 shadow-sm">
          <button className="p-1 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
          <div className="flex gap-1">
            {days.map((d, i) => (
              <button key={d} className={`w-10 h-10 rounded-xl text-[12px] font-normal transition-all ${i === 3 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{d}</button>
            ))}
          </div>
          <button className="p-1 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="font-semibold text-[15px]">Mathematics is LIVE now</span>
          <span className="text-red-100 text-[12px]">with Mrs. Goodman</span>
        </div>
        <button className="bg-white text-red-600 px-4 py-1.5 rounded-xl text-[12px] font-semibold hover:bg-red-50 transition-all flex items-center gap-1">
          <Video className="w-4 h-4" /> Join Immediately
        </button>
      </motion.div>

      <div className="flex flex-col gap-3">
        {schedule.map((cls, i) => <ClassCard key={i} {...cls} />)}
      </div>
    </div>
  );
};

export default ScheduleView;
