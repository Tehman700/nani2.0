import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'

const STATUSES = ['pending', 'confirmed', 'picked_up', 'cancelled', 'no_show']

const STATUS_STYLES = {
  pending:   'bg-amber-400/10 text-amber-300 border-amber-400/20',
  confirmed: 'bg-sky-400/10 text-sky-300 border-sky-400/20',
  picked_up: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  cancelled: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  no_show:   'bg-slate-400/10 text-slate-400 border-slate-400/20',
}

const ROLE_STYLES = {
  parent:      'bg-sky-400/10 text-sky-300 border-sky-400/20',
  teacher:     'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  branch_admin:'bg-violet-400/10 text-violet-300 border-violet-400/20',
  super_admin: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
}

function fmt(iso) {
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function SectionHeader({ title, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-navy-800/60 rounded-2xl border border-navy-700/60 card-glow overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-navy-700/20 transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-white">{title}</span>
          {count !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-navy-700 text-slate-400 text-xs font-display font-bold">{count}</span>
          )}
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="border-t border-navy-700/40">{children}</div>}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-navy-800/60 rounded-xl border border-navy-700/60 p-4 text-center">
      <p className={`font-display text-3xl font-bold ${color}`}>{value ?? '—'}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  )
}

// ── Teacher-Student Tree ─────────────────────────────────────────────────────

function TeacherNode({ node }) {
  const [open, setOpen] = useState(true)
  const { teacher, students } = node

  return (
    <div className="border-b border-navy-700/30 last:border-0">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-navy-700/10 transition-colors text-left">
        <div className="w-8 h-8 rounded-full bg-violet-400/15 border border-violet-400/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white text-sm">{teacher.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{teacher.email} · CNIC: {teacher.cnic || '—'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500">{students.length} student{students.length !== 1 ? 's' : ''}</span>
          <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="pb-3">
          {students.length === 0 ? (
            <p className="px-16 py-2 text-xs text-slate-500 italic">No students linked yet</p>
          ) : (
            students.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-6 py-2.5 hover:bg-navy-700/10">
                <div className="w-5 flex items-center justify-center shrink-0">
                  <span className="text-slate-600 text-sm">{i === students.length - 1 ? '└' : '├'}</span>
                </div>
                {s.photo_url ? (
                  <img src={s.photo_url} alt={s.name}
                    className="w-8 h-8 rounded-full object-cover border border-navy-600 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-slate-200 font-medium">{s.name}</span>
                  <span className="text-xs text-slate-500 ml-2">Roll #{s.roll_number} · {s.class_name} {s.section_name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Users table ──────────────────────────────────────────────────────────────

function UsersSection({ users, setUsers }) {
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  function startEdit(u) {
    setEditing(u.id)
    setEditForm({ name: u.name, email: u.email, cnic: u.cnic || '', role: u.role })
  }

  async function saveEdit(id) {
    setSaving(true)
    try {
      const updated = await api.put(`/admin/users/${id}`, editForm)
      setUsers(us => us.map(u => u.id === id ? updated : u))
      setEditing(null)
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  async function del(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(us => us.filter(u => u.id !== id))
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-700/40">
            {['Name', 'Email', 'Role', 'CNIC', 'Actions'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs text-slate-500 uppercase tracking-wide font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-700/20">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-navy-700/10 transition-colors">
              {editing === u.id ? (
                <>
                  <td className="px-6 py-3"><input className="field !py-1 !text-sm" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></td>
                  <td className="px-6 py-3"><input className="field !py-1 !text-sm" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></td>
                  <td className="px-6 py-3">
                    <select className="field !py-1 !text-sm" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                      {['parent','teacher','branch_admin','super_admin'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-3"><input className="field !py-1 !text-sm" value={editForm.cnic} onChange={e => setEditForm(f => ({ ...f, cnic: e.target.value }))} /></td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(u.id)} disabled={saving}
                        className="text-xs px-2 py-1 rounded-lg bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 hover:bg-emerald-400/20">
                        {saving ? '…' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(null)}
                        className="text-xs px-2 py-1 rounded-lg bg-navy-700 text-slate-400 border border-navy-600 hover:text-slate-200">
                        Cancel
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-3 text-slate-200 font-medium">{u.name}</td>
                  <td className="px-6 py-3 text-slate-400">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_STYLES[u.role] || ''}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-3 text-slate-400 font-mono text-xs">{u.cnic || '—'}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(u)}
                        className="text-xs px-2 py-1 rounded-lg bg-sky-400/10 text-sky-300 border border-sky-400/20 hover:bg-sky-400/20">Edit</button>
                      <button onClick={() => del(u.id, u.name)}
                        className="text-xs px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20">Delete</button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p className="px-6 py-8 text-slate-500 text-sm text-center">No users found</p>}
    </div>
  )
}

// ── Students table ───────────────────────────────────────────────────────────

function StudentsSection({ students, setStudents }) {
  async function del(id, name) {
    if (!window.confirm(`Delete student "${name}"?`)) return
    try {
      await api.delete(`/admin/students/${id}`)
      setStudents(ss => ss.filter(s => s.id !== id))
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-700/40">
            {['Name', 'Roll #', 'Class', 'Teacher', 'Parent', 'Action'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs text-slate-500 uppercase tracking-wide font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-700/20">
          {students.map(s => (
            <tr key={s.id} className="hover:bg-navy-700/10 transition-colors">
              <td className="px-6 py-3 text-slate-200 font-medium">{s.name}</td>
              <td className="px-6 py-3 text-slate-400">{s.roll_number || '—'}</td>
              <td className="px-6 py-3 text-slate-400">{s.class_name} {s.section_name}</td>
              <td className="px-6 py-3 text-slate-400">{s.teacher_name || '—'}</td>
              <td className="px-6 py-3 text-slate-400">{s.parent?.name || '—'}</td>
              <td className="px-6 py-3">
                <button onClick={() => del(s.id, s.name)}
                  className="text-xs px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {students.length === 0 && <p className="px-6 py-8 text-slate-500 text-sm text-center">No students found</p>}
    </div>
  )
}

// ── Bookings table ───────────────────────────────────────────────────────────

function BookingsSection({ bookings, setBookings }) {
  async function changeStatus(id, status) {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status })
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b))
    } catch (err) { alert(err.message) }
  }

  async function del(id) {
    if (!window.confirm('Delete this booking?')) return
    try {
      await api.delete(`/admin/bookings/${id}`)
      setBookings(bs => bs.filter(b => b.id !== id))
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-700/40">
            {['Student', 'Parent', 'Pickup Time', 'Created', 'Status', 'Action'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs text-slate-500 uppercase tracking-wide font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-700/20">
          {bookings.map(b => (
            <tr key={b.id} className="hover:bg-navy-700/10 transition-colors">
              <td className="px-6 py-3">
                <p className="text-slate-200 font-medium">{b.student.name}</p>
                <p className="text-xs text-slate-500">Roll #{b.student.roll_number}</p>
              </td>
              <td className="px-6 py-3">
                <p className="text-slate-300">{b.parent.name}</p>
                <p className="text-xs text-slate-500">{b.parent.email}</p>
              </td>
              <td className="px-6 py-3 text-slate-300 whitespace-nowrap">{fmt(b.pickup_time)}</td>
              <td className="px-6 py-3 text-slate-500 whitespace-nowrap text-xs">{fmt(b.created_at)}</td>
              <td className="px-6 py-3">
                <select
                  value={b.status}
                  onChange={e => changeStatus(b.id, e.target.value)}
                  className={`text-xs px-2 py-1 rounded-lg border bg-transparent cursor-pointer ${STATUS_STYLES[b.status]}`}
                >
                  {STATUSES.map(s => <option key={s} value={s} className="bg-navy-900 text-slate-200">{s}</option>)}
                </select>
              </td>
              <td className="px-6 py-3">
                <button onClick={() => del(b.id)}
                  className="text-xs px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && <p className="px-6 py-8 text-slate-500 text-sm text-center">No bookings found</p>}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats,    setStats]    = useState(null)
  const [tree,     setTree]     = useState([])
  const [users,    setUsers]    = useState([])
  const [students, setStudents] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/teacher-tree'),
      api.get('/admin/users'),
      api.get('/admin/students'),
      api.get('/admin/bookings'),
    ]).then(([s, t, u, st, b]) => {
      setStats(s); setTree(t); setUsers(u); setStudents(st); setBookings(b)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function logout() { auth.clear(); navigate('/admin-login') }

  return (
    <div className="min-h-screen dot-bg">
      {/* Nav */}
      <header className="border-b border-navy-700/60 bg-navy-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-400/20 border border-violet-400/30 flex items-center justify-center">
              <svg className="w-3 h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="font-display font-bold text-white text-base">nani<span className="text-violet-400">2.0</span></span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-violet-400/30 text-violet-400 font-display font-bold">Admin</span>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-slate-200 text-sm transition-colors">Sign out</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Title */}
        <div className="enter enter-1">
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Full system overview and controls</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-24 text-sm">Loading…</div>
        ) : (
          <>
            {/* Stats */}
            <div className="enter enter-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Total Users"     value={stats?.total_users}     color="text-white" />
              <StatCard label="Parents"         value={stats?.total_parents}   color="text-sky-400" />
              <StatCard label="Teachers"        value={stats?.total_teachers}  color="text-emerald-400" />
              <StatCard label="Students"        value={stats?.total_students}  color="text-amber-400" />
              <StatCard label="Active Bookings" value={stats?.active_bookings} color="text-violet-400" />
              <StatCard label="Total Bookings"  value={stats?.total_bookings}  color="text-slate-300" />
            </div>

            {/* Teacher-Student Tree */}
            <div className="enter enter-3">
              <SectionHeader title="Teacher → Student Structure" count={tree.length}>
                {tree.length === 0 ? (
                  <p className="px-6 py-8 text-slate-500 text-sm text-center">No teachers registered yet</p>
                ) : (
                  tree.map(node => <TeacherNode key={node.teacher.id} node={node} />)
                )}
              </SectionHeader>
            </div>

            {/* Bookings */}
            <div className="enter enter-4">
              <SectionHeader title="All Bookings" count={bookings.length}>
                <BookingsSection bookings={bookings} setBookings={setBookings} />
              </SectionHeader>
            </div>

            {/* Users */}
            <div className="enter enter-5">
              <SectionHeader title="All Users" count={users.length}>
                <UsersSection users={users} setUsers={setUsers} />
              </SectionHeader>
            </div>

            {/* Students */}
            <div className="enter enter-6">
              <SectionHeader title="All Students" count={students.length} defaultOpen={false}>
                <StudentsSection students={students} setStudents={setStudents} />
              </SectionHeader>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
