import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

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
              <Link to="/dashboard" onClick={() => setDrawerOpen(false)}
                className="font-display text-[28px] font-bold uppercase tracking-tighter text-secondary hover:text-primary hover:translate-x-2 transition-all duration-300 block">
                Dashboard
              </Link>
              <button onClick={() => setDrawerOpen(false)}
                className="font-display text-[28px] font-bold uppercase tracking-tighter text-primary hover:translate-x-2 transition-transform duration-300 text-left">
                My Children
              </button>
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

function QRDisplay({ qrHash }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!canvasRef.current || !qrHash) return
    QRCode.toCanvas(canvasRef.current, qrHash, {
      width: 176, margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [qrHash])
  if (!qrHash) return <div className="label-xs text-secondary">No QR available</div>
  return <canvas ref={canvasRef} className="border border-outline-variant" />
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
        className="w-16 h-16 border-2 border-dashed border-outline hover:border-primary flex items-center justify-center cursor-pointer transition-colors overflow-hidden shrink-0"
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        )}
      </div>
      <div>
        <button type="button" onClick={() => inputRef.current.click()}
          className="label-sm text-primary hover:opacity-60 transition-opacity">
          {preview ? 'Change photo' : 'Upload photo'}
        </button>
        <p className="text-xs text-secondary mt-0.5">JPG or PNG</p>
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
      <div className="grid grid-cols-2 gap-x-6 gap-y-7 mt-6">
        <div>
          <label className="label-sm block mb-2">Child's Name</label>
          <input className="field" placeholder="Ayesha Ali" value={form.name} onChange={field('name')} required />
        </div>
        <div>
          <label className="label-sm block mb-2">Roll Number</label>
          <input className="field" placeholder="201" value={form.roll_number} onChange={field('roll_number')} required />
        </div>
        <div>
          <label className="label-sm block mb-2">Class</label>
          <input className="field" placeholder="Grade 3" value={form.class_name} onChange={field('class_name')} required />
        </div>
        <div>
          <label className="label-sm block mb-2">Section</label>
          <input className="field" placeholder="A" value={form.section_name} onChange={field('section_name')} required />
        </div>
        <div>
          <label className="label-sm block mb-2">Teacher Name</label>
          <input className="field" placeholder="Ms. Fatima" value={form.teacher_name} onChange={field('teacher_name')} required />
        </div>
        <div>
          <label className="label-sm block mb-2">Teacher CNIC</label>
          <input className="field" placeholder="42201-1234567-1" value={form.teacher_cnic}
            onChange={e => setForm(f => ({ ...f, teacher_cnic: formatCnic(e.target.value) }))} required />
        </div>
      </div>
    </>
  )
}

function AddKidForm({ onAdded }) {
  const [open, setOpen]     = useState(false)
  const [form, setForm]     = useState({ name: '', roll_number: '', photo_url: '', class_name: '', section_name: '', teacher_name: '', teacher_cnic: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

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
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-primary flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-display font-bold tracking-tight">Add a Child</span>
        </div>
        <svg className={`w-4 h-4 text-secondary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <form onSubmit={submit} className="px-6 pb-6 border-t border-outline-variant pt-6">
          <KidFields form={form} setForm={setForm} />
          {error && (
            <p className="border border-error/30 bg-error-container/40 px-4 py-3 text-error text-sm mt-6">{error}</p>
          )}
          <button type="submit" className="btn-primary mt-6" disabled={loading}>
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
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
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
    <div className="card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-5">
        {student.photo_url ? (
          <img src={student.photo_url} alt={student.name}
            className="w-14 h-14 object-cover border border-outline-variant shrink-0" />
        ) : (
          <div className="w-14 h-14 border border-outline-variant bg-surface-container flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-on-surface">{student.name}</p>
          <p className="label-xs mt-0.5">Roll #{student.roll_number} · {student.class_name} {student.section_name}</p>
          <p className="label-xs mt-0.5 text-outline">{student.teacher_name}</p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button onClick={() => { setEditing(v => !v); setShowQR(false) }}
            className={`btn-sm-outline ${editing ? 'bg-primary text-on-primary border-primary' : ''}`}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={() => { setShowQR(v => !v); setEditing(false) }}
            className={`btn-sm-outline ${showQR ? 'bg-primary text-on-primary border-primary' : ''}`}>
            {showQR ? 'Hide QR' : 'QR Code'}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger">
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={saveEdit} className="border-t border-outline-variant px-5 pb-5 pt-5">
          <KidFields form={form} setForm={setForm} />
          {editError && (
            <p className="border border-error/30 bg-error-container/40 px-4 py-3 text-error text-sm mt-6">{editError}</p>
          )}
          <button type="submit" className="btn-primary mt-6" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* QR panel */}
      {showQR && (
        <div className="border-t border-outline-variant px-5 pb-5 pt-5 flex flex-col items-center gap-4">
          <QRDisplay qrHash={student.qr_hash} />
          <p className="label-xs text-center text-secondary">Show this at the gate for quick pickup</p>
          <button onClick={regenQR} disabled={regenning}
            className="label-xs text-primary hover:opacity-60 transition-opacity border-b border-primary pb-px">
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

  function onAdded(student)   { setKids(k => [student, ...k]) }
  function onUpdated(updated) { setKids(k => k.map(s => s.id === updated.id ? updated : s)) }
  function onDeleted(id)      { setKids(k => k.filter(s => s.id !== id)) }

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        <div className="stagger delay-1">
          <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] leading-none">My Children</h1>
          <p className="text-sm text-secondary mt-2">Manage your kids and their pickup QR codes</p>
        </div>

        <div className="stagger delay-2">
          <AddKidForm onAdded={onAdded} />
        </div>

        {loading ? (
          <div className="stagger delay-3 text-center text-secondary py-12 text-sm">Loading…</div>
        ) : kids.length === 0 ? (
          <div className="stagger delay-3 border border-outline-variant bg-white px-6 py-14 text-center">
            <p className="font-display font-bold uppercase tracking-wide text-sm mb-2">No children yet</p>
            <p className="text-sm text-secondary">Add your first child using the form above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {kids.map((kid, i) => (
              <div key={kid.id} className="stagger" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <KidCard student={kid} onUpdated={onUpdated} onDeleted={onDeleted} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
