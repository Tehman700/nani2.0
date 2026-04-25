import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { api, auth } from '../api/client'

function formatCnic(value) {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function NavBar() {
  const navigate = useNavigate()
  function logout() { auth.clear(); navigate('/') }
  return (
    <header className="border-b border-navy-700/60 bg-navy-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-slate-200 text-sm transition-colors mr-2">
            ← Dashboard
          </button>
          <div className="w-6 h-6 rounded-md bg-sky-400/20 border border-sky-400/30 flex items-center justify-center">
            <svg className="w-3 h-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight">nani<span className="text-sky-400">2.0</span></span>
        </div>
        <button onClick={logout} className="text-slate-400 hover:text-slate-200 text-sm transition-colors">Sign out</button>
      </div>
    </header>
  )
}

function QRDisplay({ qrHash }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!canvasRef.current || !qrHash) return
    QRCode.toCanvas(canvasRef.current, qrHash, {
      width: 180, margin: 2,
      color: { dark: '#ffffff', light: '#0f172a' },
    })
  }, [qrHash])
  if (!qrHash) return <div className="text-xs text-slate-500">No QR available</div>
  return <canvas ref={canvasRef} className="rounded-lg" />
}

function PhotoPicker({ preview, onChange }) {
  const inputRef = useRef(null)
  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    onChange(await readFileAsBase64(file))
  }
  return (
    <div className="flex items-center gap-4">
      <div
        onClick={() => inputRef.current.click()}
        className="w-16 h-16 rounded-full bg-navy-700 border-2 border-dashed border-navy-600 hover:border-sky-400/50 flex items-center justify-center cursor-pointer transition-colors overflow-hidden shrink-0"
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
        )}
      </div>
      <div>
        <button type="button" onClick={() => inputRef.current.click()}
          className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors">
          {preview ? 'Change photo' : 'Upload photo'}
        </button>
        <p className="text-xs text-slate-500 mt-0.5">JPG or PNG</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

function KidFields({ form, setForm }) {
  function field(key) { return e => setForm(f => ({ ...f, [key]: e.target.value })) }
  return (
    <>
      <PhotoPicker preview={form.photo_url} onChange={v => setForm(f => ({ ...f, photo_url: v }))} />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Child's Name</label>
          <input className="field" placeholder="Ayesha Ali" value={form.name} onChange={field('name')} required />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Roll Number</label>
          <input className="field" placeholder="201" value={form.roll_number} onChange={field('roll_number')} required />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Class</label>
          <input className="field" placeholder="Grade 3" value={form.class_name} onChange={field('class_name')} required />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Section</label>
          <input className="field" placeholder="A" value={form.section_name} onChange={field('section_name')} required />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Teacher Name</label>
          <input className="field" placeholder="Ms. Fatima" value={form.teacher_name} onChange={field('teacher_name')} required />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Teacher CNIC</label>
          <input className="field" placeholder="42201-1234567-1" value={form.teacher_cnic}
            onChange={e => setForm(f => ({ ...f, teacher_cnic: formatCnic(e.target.value) }))} required />
        </div>
      </div>
    </>
  )
}

function AddKidForm({ onAdded }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', roll_number: '', photo_url: '', class_name: '', section_name: '', teacher_name: '', teacher_cnic: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.photo_url) delete payload.photo_url
      const student = await api.post('/student/add', payload)
      setForm({ name: '', roll_number: '', photo_url: '', class_name: '', section_name: '', teacher_name: '', teacher_cnic: '' })
      setOpen(false)
      onAdded(student)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-navy-800/60 rounded-2xl border border-navy-700/60 overflow-hidden card-glow">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-navy-700/20 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-400/15 border border-sky-400/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-display font-bold text-white">Add a Child</span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <form onSubmit={submit} className="px-5 pb-5 border-t border-navy-700/40 pt-5">
          <KidFields form={form} setForm={setForm} />
          {error && <p className="text-rose-300 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mt-4">{error}</p>}
          <button type="submit" className="btn-primary mt-4" disabled={loading}>
            {loading ? 'Adding…' : 'Add Child'}
          </button>
        </form>
      )}
    </div>
  )
}

function KidCard({ student, onUpdated, onDeleted }) {
  const [showQR, setShowQR]   = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({
    name: student.name, roll_number: student.roll_number || '',
    photo_url: student.photo_url || '', class_name: student.class_name || '',
    section_name: student.section_name || '', teacher_name: student.teacher_name || '',
    teacher_cnic: student.teacher_cnic || '',
  })
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [regenning, setRegenning] = useState(false)
  const [editError, setEditError] = useState('')

  async function saveEdit(e) {
    e.preventDefault()
    setEditError('')
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.photo_url) delete payload.photo_url
      const updated = await api.put(`/student/${student.id}`, payload)
      onUpdated(updated)
      setEditing(false)
    } catch (err) {
      setEditError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Remove ${student.name} from your list?`)) return
    setDeleting(true)
    try {
      await api.delete(`/student/${student.id}`)
      onDeleted(student.id)
    } catch (err) {
      alert(err.message)
      setDeleting(false)
    }
  }

  async function regenQR() {
    setRegenning(true)
    try {
      const updated = await api.post(`/student/${student.id}/regenerate-qr`, {})
      onUpdated(updated)
    } catch (err) {
      alert(err.message)
    } finally {
      setRegenning(false)
    }
  }

  return (
    <div className="bg-navy-800/60 rounded-2xl border border-navy-700/60 card-glow overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-5">
        {student.photo_url ? (
          <img src={student.photo_url} alt={student.name}
            className="w-14 h-14 rounded-full object-cover border border-navy-600 shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white text-base">{student.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">Roll #{student.roll_number} · {student.class_name} {student.section_name}</p>
          <p className="text-xs text-slate-500 mt-0.5">Teacher: {student.teacher_name}</p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button onClick={() => { setEditing(v => !v); setShowQR(false) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all border ${
              editing ? 'bg-sky-400/20 text-sky-300 border-sky-400/30' : 'bg-navy-700 text-slate-300 border-navy-600 hover:border-sky-400/30'
            }`}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={() => { setShowQR(v => !v); setEditing(false) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all border ${
              showQR ? 'bg-sky-400/20 text-sky-300 border-sky-400/30' : 'bg-navy-700 text-slate-300 border-navy-600 hover:border-sky-400/30'
            }`}>
            {showQR ? 'Hide QR' : 'QR Code'}
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-3 py-1.5 rounded-lg text-xs font-display font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all">
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={saveEdit} className="border-t border-navy-700/40 px-5 pb-5 pt-5">
          <KidFields form={form} setForm={setForm} />
          {editError && <p className="text-rose-300 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mt-4">{editError}</p>}
          <button type="submit" className="btn-primary mt-4" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* QR panel */}
      {showQR && (
        <div className="border-t border-navy-700/40 px-5 pb-5 pt-4 flex flex-col items-center gap-3">
          <QRDisplay qrHash={student.qr_hash} />
          <p className="text-xs text-slate-500 text-center">Show this at the gate for quick pickup</p>
          <button onClick={regenQR} disabled={regenning}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
            {regenning ? 'Generating…' : '↺ Generate new QR code'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ParentKidsPage() {
  const [kids, setKids]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/student/my-kids')
      .then(setKids)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function onAdded(student)       { setKids(k => [student, ...k]) }
  function onUpdated(updated)     { setKids(k => k.map(s => s.id === updated.id ? updated : s)) }
  function onDeleted(id)          { setKids(k => k.filter(s => s.id !== id)) }

  return (
    <div className="min-h-screen dot-bg">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        <div className="enter enter-1">
          <h1 className="font-display text-2xl font-bold text-white">My Children</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your kids and their pickup QR codes</p>
        </div>

        <div className="enter enter-2">
          <AddKidForm onAdded={onAdded} />
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12 text-sm">Loading…</div>
        ) : kids.length === 0 ? (
          <div className="enter enter-3 bg-navy-800/40 rounded-2xl border border-navy-700/60 px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">No children added yet. Add your first child above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {kids.map((kid, i) => (
              <div key={kid.id} className={`enter enter-${i + 3}`}>
                <KidCard student={kid} onUpdated={onUpdated} onDeleted={onDeleted} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
