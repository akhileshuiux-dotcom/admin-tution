import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Hash, Search, MoreVertical, Paperclip, Smile, ShieldCheck, ChevronRight } from 'lucide-react';

const ROOMS = [
  { id: 1, name: 'Class 9A - General', unread: 3, last: 'Mrs. Goodman: Don\'t forget the test...', active: true },
  { id: 2, name: 'Math Group', unread: 0, last: 'John: Got it, thanks!' },
  { id: 3, name: 'Biology Lab', unread: 1, last: 'Alice: Check the notes I shared' },
];

const INITIAL_MESSAGES = [
  { id: 1, sender: 'Mrs. Goodman', text: 'Good morning everyone! Don\'t forget the math test on Friday.', time: '9:00 AM', self: false, teacher: true },
  { id: 2, sender: 'Student (You)', text: 'Good morning! I had a question about problem 7 in the homework.', time: '9:05 AM', self: true },
  { id: 3, sender: 'Mrs. Goodman', text: 'Of course! Which part is difficult? Feel free to ask anytime.', time: '9:07 AM', self: false, teacher: true },
  { id: 4, sender: 'Alice Johnson', text: 'I had the same question! Thanks for clarifying.', time: '9:10 AM', self: false, teacher: false },
];

const ChatView = ({ user }) => {
  const [activeRoom, setActiveRoom] = useState(ROOMS[0]);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { id: m.length + 1, sender: 'Student (You)', text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), self: true }]);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-14rem)] gap-8 w-full animate-fade-in relative">
      
      {/* ── Room Sidebar ─────────────────────────────────────────────────── */}
      <div className="w-80 flex flex-col gap-6">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
             className="w-full pl-12 pr-6 py-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[1.5rem] text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" 
             placeholder="Search active chats..." 
          />
        </div>
        
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">
          <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Internal Channels</p>
          {ROOMS.map(room => (
            <motion.button 
              key={room.id} 
              whileHover={{ x: 5 }} 
              onClick={() => setActiveRoom(room)}
              className={`text-left p-5 rounded-[2rem] transition-all relative ${
                activeRoom.id === room.id 
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/10' 
                    : 'bg-white/40 backdrop-blur-md text-slate-700 hover:bg-white border border-white/40'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeRoom.id === room.id ? 'bg-blue-600' : 'bg-slate-100'}`}>
                    <Hash className={`w-4 h-4 ${activeRoom.id === room.id ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <span className="font-extrabold text-[14px] font-plus-jakarta truncate pr-6">{room.name}</span>
                {room.unread > 0 && (
                   <span className="absolute top-5 right-5 text-[10px] font-black bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/20">
                      {room.unread}
                   </span>
                )}
              </div>
              <p className={`text-[12px] font-medium truncate ${activeRoom.id === room.id ? 'text-white/50' : 'text-slate-400'}`}>
                {room.last}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Chat Canvas ──────────────────────────────────────────────────── */}
      <div className="flex-grow bg-white/70 backdrop-blur-2xl rounded-[3.5rem] border border-white/60 shadow-xl shadow-blue-500/5 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-blue-600/5 opacity-30 pointer-events-none" />
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-white/40 flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center shadow-lg">
             <Hash className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-[18px] text-slate-900 font-plus-jakarta">{activeRoom.name}</h4>
            <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">32 Members Active</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
              <button className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-slate-400"><Search className="w-5 h-5" /></button>
              <button className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-slate-400"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messaging Area */}
        <div className="flex-grow overflow-y-auto p-10 flex flex-col gap-6 relative z-10 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {messages.map(msg => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                layout
                className={`flex flex-col max-w-[80%] ${msg.self ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {!msg.self && (
                    <div className="flex items-center gap-2 mb-2 ml-2">
                        <span className={`text-[12px] font-black uppercase tracking-widest ${msg.teacher ? 'text-blue-600' : 'text-slate-400'}`}>
                            {msg.sender}
                        </span>
                        {msg.teacher && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                )}
                <div className={`px-6 py-4 rounded-[2rem] text-[15px] font-medium leading-relaxed shadow-sm ${
                    msg.self 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 px-2">{msg.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* High-Fidelity Input Box */}
        <div className="p-10 relative z-20">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-2 flex items-center gap-3 pr-2 shadow-blue-500/5">
                <button className="p-4 hover:bg-slate-50 rounded-[2rem] text-slate-400 transition-all"><Paperclip className="w-5 h-5" /></button>
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && send()}
                    className="flex-grow px-4 py-4 text-[15px] font-medium text-slate-800 focus:outline-none placeholder:text-slate-300"
                    placeholder="Contribute to the discussion..." 
                />
                <button className="p-4 hover:bg-slate-50 rounded-[2rem] text-slate-400 transition-all"><Smile className="w-5 h-5" /></button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={send} 
                    className="w-14 h-14 bg-blue-600 text-white rounded-[1.8rem] flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                >
                    <Send className="w-5 h-5 ml-0.5" />
                </motion.button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
