import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, auth } from '../api/client'

function NavBar() {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  function logout() { auth.clear(); navigate('/') }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-outline-variant">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setDrawerOpen(true)} className="flex flex-col gap-[5px] group" aria-label="Menu">
              <span className="block w-5 h-px bg-primary transition-all" />
              <span className="block w-3 h-px bg-primary transition-all group-hover:w-5" />
            </button>
            <span className="font-display text-base font-bold tracking-[-0.03em] uppercase">NANI 2.0</span>
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
                My Students
              </button>
              <Link to="/teacher-queue" onClick={() => setDrawerOpen(false)}
                className="font-display text-[28px] font-bold uppercase tracking-tighter text-secondary hover:text-primary hover:translate-x-2 transition-all duration-300 block">
                Today's Queue
              </Link>
              <button onClick={logout}
                className="font-display text-[28px] font-bold uppercase tracking-tighter text-secondary hover:text-primary hover:translate-x-2 transition-all duration-300 text-left">
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

function StudentCard({ student, index }) {
  return (
    <div
      className="stagger flex items-center gap-4 bg-white border border-outline-variant p-5 hover:border-primary transition-colors"
      style={{ animationDelay: `${0.2 + index * 0.06}s` }}
    >
      {student.photo_url ? (
        <img src={student.photo_url} alt={student.name}
          className="w-12 h-12 object-cover border border-outline-variant shrink-0" />
      ) : (
        <div className="w-12 h-12 border border-outline-variant bg-surface-container flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-on-surface">{student.name}</p>
        <p className="label-xs mt-0.5">Roll #{student.roll_number}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="label-xs">{student.class_name} {student.section_name}</p>
      </div>
    </div>
  )
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    api.get('/student/teacher-view')
      .then(setStudents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        <div className="stagger delay-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] leading-none">My Students</h1>
            <p className="text-sm text-secondary mt-2">Students assigned for pickup management</p>
          </div>
          <Link to="/teacher-queue" className="btn-sm shrink-0 mt-1">
            Today's Queue →
          </Link>
        </div>

        {loading ? (
          <div className="stagger delay-2 text-center text-secondary py-12 text-sm">Loading…</div>
        ) : error ? (
          <div className="stagger delay-2 border border-error/30 bg-error-container/40 px-6 py-8 text-center text-error text-sm">
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="stagger delay-2 border border-outline-variant bg-white px-6 py-14 text-center">
            <p className="font-display font-bold uppercase tracking-wide text-sm mb-2">No students yet</p>
            <p className="text-sm text-secondary">Make sure your CNIC matches what parents entered.</p>
          </div>
        ) : (
          <>
            <div className="stagger delay-2 flex items-center gap-3">
              <span className="inline-flex items-center border border-primary px-3 py-1 label-xs text-primary">
                {students.length} student{students.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {students.map((s, i) => (
                <StudentCard key={s.id} student={s} index={i} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
