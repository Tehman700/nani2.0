import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'

const STATUSES = ['pending', 'confirmed', 'picked_up', 'cancelled', 'no_show']

const STATUS_STYLES = {
  pending:   'border border-outline text-secondary',
  confirmed: 'bg-primary text-on-primary border border-primary',
  picked_up: 'bg-surface-container-highest text-on-surface border border-outline-variant',
  cancelled: 'border border-outline-variant text-outline',
  no_show:   'border border-outline-variant text-outline opacity-60',
}

const ROLE_STYLES = {
  parent:       'border border-outline-variant text-secondary',
  teacher:      'bg-primary text-on-primary border border-primary',
  branch_admin: 'border border-primary text-primary',
  super_admin:  'bg-on-surface text-surface border border-on-surface',
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
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-surface-container-low transition-colors border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <span className="font-display font-bold tracking-tight">{title}</span>
          {count !== undefined && (
            <span className="inline-flex items-center border border-outline-variant px-2 py-0.5 label-xs text-secondary">
              {count}
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 text-secondary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`bg-white border px-5 py-5 ${accent ? 'border-primary' : 'border-outline-variant'}`}>
      <p className="font-display text-3xl font-bold tracking-tighter">{value ?? '—'}</p>
      <p className="label-xs mt-2">{label}</p>
    </div>
  )
}

function TeacherNode({ node }) {
  const [open, setOpen] = useState(true)
  const { teacher, students } = node
  return (
    <div className="border-b border-outline-variant last:border-0">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors text-left">
        <div className="w-8 h-8 border border-outline-variant flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm">{teacher.name}</p>
          <p className="label-xs mt-0.5">{teacher.email} · CNIC: {teacher.cnic || '—'}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="label-xs text-secondary">{students.length} student{students.length !== 1 ? 's' : ''}</span>
          <svg className={`w-3.5 h-3.5 text-secondary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="pb-2">
          {students.length === 0 ? (
            <p className="px-16 py-2 label-xs text-outline italic">No students linked yet</p>
          ) : (
            students.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-6 py-2.5 hover:bg-surface-container-low">
                <span className="text-secondary text-sm w-5 shrink-0">{i === students.length - 1 ? '└' : '├'}</span>
                {s.photo_url ? (
                  <img src={s.photo_url} alt={s.name} className="w-7 h-7 object-cover border border-outline-variant shrink-0" />
                ) : (
                  <div className="w-7 h-7 border border-outline-variant bg-surface-container flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-on-surface">{s.name}</span>
                  <span className="label-xs ml-2 text-secondary">Roll #{s.roll_number} · {s.class_name} {s.section_name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

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
          <tr className="border-b border-outline-variant">
            {['Name', 'Email', 'Role', 'CNIC', 'Actions'].map(h => (
              <th key={h} className="px-6 py-3 text-left label-xs text-secondary">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
              {editing === u.id ? (
                <>
                  <td className="px-6 py-3"><input className="field text-sm" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></td>
                  <td className="px-6 py-3"><input className="field text-sm" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></td>
                  <td className="px-6 py-3">
                    <div className="relative">
                      <select className="field text-sm" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                        {['parent','teacher','branch_admin','super_admin'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-3"><input className="field text-sm" value={editForm.cnic} onChange={e => setEditForm(f => ({ ...f, cnic: e.target.value }))} /></td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(u.id)} disabled={saving} className="btn-sm">
                        {saving ? '…' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(null)} className="btn-sm-outline">Cancel</button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-3 font-medium text-on-surface">{u.name}</td>
                  <td className="px-6 py-3 text-secondary">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase ${ROLE_STYLES[u.role] || ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-secondary font-mono text-xs">{u.cnic || '—'}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(u)} className="btn-sm-outline">Edit</button>
                      <button onClick={() => del(u.id, u.name)} className="btn-danger">Delete</button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p className="px-6 py-8 text-secondary text-sm text-center">No users found</p>}
    </div>
  )
}

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
          <tr className="border-b border-outline-variant">
            {['Name', 'Roll #', 'Class', 'Teacher', 'Parent', 'Action'].map(h => (
              <th key={h} className="px-6 py-3 text-left label-xs text-secondary">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {students.map(s => (
            <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
              <td className="px-6 py-3 font-medium text-on-surface">{s.name}</td>
              <td className="px-6 py-3 text-secondary">{s.roll_number || '—'}</td>
              <td className="px-6 py-3 text-secondary">{s.class_name} {s.section_name}</td>
              <td className="px-6 py-3 text-secondary">{s.teacher_name || '—'}</td>
              <td className="px-6 py-3 text-secondary">{s.parent?.name || '—'}</td>
              <td className="px-6 py-3">
                <button onClick={() => del(s.id, s.name)} className="btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {students.length === 0 && <p className="px-6 py-8 text-secondary text-sm text-center">No students found</p>}
    </div>
  )
}

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
          <tr className="border-b border-outline-variant">
            {['Student', 'Parent', 'Pickup Time', 'Created', 'Status', 'Action'].map(h => (
              <th key={h} className="px-6 py-3 text-left label-xs text-secondary">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {bookings.map(b => (
            <tr key={b.id} className="hover:bg-surface-container-low transition-colors">
              <td className="px-6 py-3">
                <p className="font-medium text-on-surface">{b.student.name}</p>
                <p className="label-xs text-secondary mt-0.5">Roll #{b.student.roll_number}</p>
              </td>
              <td className="px-6 py-3">
                <p className="text-on-surface">{b.parent.name}</p>
                <p className="label-xs text-secondary mt-0.5">{b.parent.email}</p>
              </td>
              <td className="px-6 py-3 text-secondary whitespace-nowrap">{fmt(b.pickup_time)}</td>
              <td className="px-6 py-3 text-secondary whitespace-nowrap text-xs">{fmt(b.created_at)}</td>
              <td className="px-6 py-3">
                <div className="relative">
                  <select
                    value={b.status}
                    onChange={e => changeStatus(b.id, e.target.value)}
                    className={`text-[10px] font-semibold tracking-widest uppercase px-2 py-1 border cursor-pointer bg-transparent appearance-none pr-5 ${STATUS_STYLES[b.status]}`}
                  >
                    {STATUSES.map(s => <option key={s} value={s} className="bg-white text-on-surface">{s}</option>)}
                  </select>
                  <svg className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-secondary pointer-events-none"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </td>
              <td className="px-6 py-3">
                <button onClick={() => del(b.id)} className="btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && <p className="px-6 py-8 text-secondary text-sm text-center">No bookings found</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats,    setStats]    = useState(null)
  const [tree,     setTree]     = useState([])
  const [users,    setUsers]    = useState([])
  const [students, setStudents] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

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
    <div className="min-h-screen bg-surface">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setDrawerOpen(true)} className="flex flex-col gap-[5px] group" aria-label="Menu">
              <span className="block w-5 h-px bg-primary" />
              <span className="block w-3 h-px bg-primary transition-all group-hover:w-5" />
            </button>
            <span className="font-display text-base font-bold tracking-[-0.03em] uppercase">NANI 2.0</span>
            <span className="border border-primary px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase">ADMIN</span>
          </div>
          <button onClick={logout} className="label-sm text-secondary hover:text-primary transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-[59] bg-black/10" onClick={() => setDrawerOpen(false)} />
      )}
      <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full px-6 py-6 justify-center relative">
          <button className="absolute top-6 right-6" onClick={() => setDrawerOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="space-y-10">
            <div className="font-display text-[40px] font-bold tracking-[-0.03em] leading-none uppercase">NANI 2.0</div>
            <nav className="flex flex-col gap-5">
              <button onClick={() => setDrawerOpen(false)}
                className="font-display text-[28px] font-bold uppercase tracking-tighter text-primary hover:translate-x-2 transition-transform duration-300 text-left">
                Dashboard
              </button>
              <button onClick={logout}
                className="font-display text-[28px] font-bold uppercase tracking-tighter text-secondary hover:text-primary hover:translate-x-2 transition-all duration-300 text-left">
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        <div className="stagger delay-1">
          <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] leading-none">Dashboard</h1>
          <p className="text-sm text-secondary mt-2">Full system overview and controls</p>
        </div>

        {loading ? (
          <div className="text-center text-secondary py-24 text-sm">Loading…</div>
        ) : (
          <>
            {/* Stats */}
            <div className="stagger delay-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-outline-variant border border-outline-variant">
              <StatCard label="Total Users"     value={stats?.total_users}     accent />
              <StatCard label="Parents"         value={stats?.total_parents} />
              <StatCard label="Teachers"        value={stats?.total_teachers} />
              <StatCard label="Students"        value={stats?.total_students} />
              <StatCard label="Active Bookings" value={stats?.active_bookings} accent />
              <StatCard label="Total Bookings"  value={stats?.total_bookings} />
            </div>

            {/* Teacher-Student Tree */}
            <div className="stagger delay-3">
              <SectionHeader title="Teacher → Student Structure" count={tree.length}>
                {tree.length === 0 ? (
                  <p className="px-6 py-8 text-secondary text-sm text-center">No teachers registered yet</p>
                ) : (
                  tree.map(node => <TeacherNode key={node.teacher.id} node={node} />)
                )}
              </SectionHeader>
            </div>

            {/* Bookings */}
            <div className="stagger delay-4">
              <SectionHeader title="All Bookings" count={bookings.length}>
                <BookingsSection bookings={bookings} setBookings={setBookings} />
              </SectionHeader>
            </div>

            {/* Users */}
            <div className="stagger delay-5">
              <SectionHeader title="All Users" count={users.length}>
                <UsersSection users={users} setUsers={setUsers} />
              </SectionHeader>
            </div>

            {/* Students */}
            <div className="stagger delay-6">
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
