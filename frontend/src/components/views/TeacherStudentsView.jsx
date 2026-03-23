import React from 'react';
import { motion } from 'framer-motion';
import { UsersRound, Search, Phone, BookOpen, Hash, User } from 'lucide-react';
import api from '../../api';

const TeacherStudentsView = () => {
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({ grade: '', status: '' });

  React.useEffect(() => {
    api.get('/students/')
      .then(r => setStudents(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const n = `${s.user?.first_name||''} ${s.user?.last_name||''} ${s.user?.username||''}`.toLowerCase();
    const matchesSearch = n.includes(q) || s.student_id?.toLowerCase().includes(q) || s.grade?.toLowerCase().includes(q);
    const matchesGrade = !filters.grade || s.grade === filters.grade;
    const matchesStatus = !filters.status || s.status === filters.status;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UsersRound size={20} color="#fff" />
          </span>
          <div>
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 17, margin: 0 }}>Student List</p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>{students.length} students enrolled</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 11, padding: '8px 14px' }}>
            <Search size={14} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
              style={{ background: 'none', border: 'none', outline: 'none', color: '#1e293b', fontSize: 13, width: 180 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ padding: '10px 16px', borderRadius: 11, border: '1px solid #e2e8f0', background: showFilters ? '#6366f1' : '#fff', color: showFilters ? '#fff' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
              <UsersRound size={14} />
              Filter
            </button>
            {showFilters && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Grade</label>
                  <select value={filters.grade} onChange={e => setFilters({...filters, grade: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                    <option value="">All Grades</option>
                    {[...Array(12)].map((_,i) => <option key={i+1} value={`${i+1}th`}>{i+1}th Grade</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Status</label>
                  <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button onClick={() => setFilters({grade:'', status:''})} style={{ marginTop: 4, background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, textAlign: 'left' }}>Clear All</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading students…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          {search ? 'No students match your search.' : 'No students found. Add via Admin panel.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((s, i) => {
            const name = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name || ''}`.trim() : s.user?.username || s.student_id;
            const open = selected === s.id;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div onClick={() => setSelected(open ? null : s.id)}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 18px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#1e293b', fontWeight: 600, fontSize: 14, margin: 0 }}>{name}</p>
                      <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>ID: {s.student_id} · Grade {s.grade}</p>
                    </div>
                    <span style={{ color: '#cbd5e1', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
                  </div>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      style={{ borderTop: '1px solid #f1f5f9', padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#fafafa' }}>
                      <Detail icon={Hash} label="Student ID" value={s.student_id} />
                      <Detail icon={BookOpen} label="Grade" value={s.grade} />
                      <Detail icon={User} label="Parent Name" value={s.parent_name} />
                      <Detail icon={Phone} label="Parent Contact" value={s.parent_contact} />
                      <Detail icon={BookOpen} label="Subjects" value={s.subjects?.map(sub => sub.name).join(', ')} />
                      <Detail icon={BookOpen} label="Bio" value={s.bio} />
                      {s.medical_info && (
                        <div style={{ gridColumn: '1/-1' }}>
                          <Detail icon={BookOpen} label="Medical Info" value={s.medical_info} />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Detail = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    <Icon size={14} color="#6366f1" style={{ marginTop: 2, flexShrink: 0 }} />
    <div>
      <p style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{label}</p>
      <p style={{ color: '#1e293b', fontSize: 13, fontWeight: 500, margin: 0 }}>{value || '—'}</p>
    </div>
  </div>
);

export default TeacherStudentsView;
