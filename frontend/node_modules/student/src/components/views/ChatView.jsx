import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Hash, Search } from 'lucide-react';

const ROOMS = [
  { id: 1, name: 'Class 9A - General', unread: 3, last: 'Mrs. Goodman: Don\'t forget the test...' },
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
    <div className="flex h-[calc(100vh-10rem)] gap-5 w-full">
      {/* Room List */}
      <div className="w-72 flex flex-col gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-[13px] placeholder:text-slate-300 focus:outline-none" placeholder="Search chats..." />
        </div>
        <div className="flex flex-col gap-1">
          {ROOMS.map(room => (
            <motion.button key={room.id} whileHover={{ x: 2 }} onClick={() => setActiveRoom(room)}
              className={`text-left p-3 rounded-2xl transition-all ${activeRoom.id === room.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <Hash className="w-3.5 h-3.5 opacity-60" />
                <span className="font-normal text-[13px]">{room.name}</span>
                {room.unread > 0 && <span className="ml-auto text-[10px] font-semibold bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center">{room.unread}</span>}
              </div>
              <p className={`text-[11px] truncate ${activeRoom.id === room.id ? 'text-white/60' : 'text-slate-400'}`}>{room.last}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-grow bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center"><Hash className="w-4 h-4 text-slate-500" /></div>
          <div>
            <h4 className="font-semibold text-[14px] text-slate-900">{activeRoom.name}</h4>
            <p className="text-[11px] text-slate-400">32 members · Class Group</p>
          </div>
          <Users className="w-5 h-5 text-slate-300 ml-auto" />
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-5 flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} layout
                className={`flex flex-col max-w-[70%] ${msg.self ? 'self-end items-end' : 'self-start items-start'}`}>
                {!msg.self && <span className={`text-[11px] font-normal mb-1 ${msg.teacher ? 'text-violet-600' : 'text-slate-500'}`}>{msg.sender}</span>}
                <div className={`px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed ${msg.self ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100 flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-grow bg-slate-50 rounded-2xl px-4 py-2.5 text-[13px] focus:outline-none focus:bg-white border border-transparent focus:border-slate-200 transition-all"
            placeholder="Type a message..." />
          <button onClick={send} className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
