import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, auth } from '../api/client'

function NavBar() {
  const navigate = useNavigate()
  function logout() { auth.clear(); navigate('/') }
  return (
    <header className="border-b border-navy-700/60 bg-navy-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-sky-400/20 border border-sky-400/30 flex items-center justify-center">
            <svg className="w-3 h-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight">nani<span className="text-sky-400">2.0</span></span>
        </div>
        <button onClick={logout} className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
          Sign out
        </button>
      </div>
    </header>
  )
}

function StudentCard({ student, index }) {
  return (
    <div className={`enter enter-${index + 2} flex items-center gap-4 bg-navy-800/60 rounded-2xl border border-navy-700/60 p-4 card-glow`}>
      {student.photo_url ? (
        <img src={student.photo_url} alt={student.name}
          className="w-12 h-12 rounded-full object-cover border border-navy-600 shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-white">{student.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">Roll #{student.roll_number}</p>
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
    <div className="min-h-screen dot-bg">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        <div className="enter enter-1 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">My Students</h1>
            <p className="text-slate-400 text-sm mt-1">Students assigned to you for pickup management</p>
          </div>
          <Link to="/teacher-queue"
            className="shrink-0 px-4 py-2 rounded-xl bg-sky-400/15 border border-sky-400/30 text-sky-300 text-sm font-display font-bold hover:bg-sky-400/25 transition-colors">
            Today's Queue →
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12 text-sm">Loading…</div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-6 py-8 text-center text-rose-300 text-sm">
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="enter enter-2 bg-navy-800/40 rounded-2xl border border-navy-700/60 px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">No students found. Make sure your CNIC matches what parents entered.</p>
          </div>
        ) : (
          <>
            <div className="enter enter-2 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300 text-xs font-display font-bold">
                {students.length} student{students.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="space-y-3">
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
