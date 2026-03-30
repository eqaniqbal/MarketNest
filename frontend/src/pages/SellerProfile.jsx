import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import SellerSidebar from '../components/SellerSidebar'
import api from '../utils/api'
import { getUser, login } from '../utils/auth'

export default function SellerProfile() {
  const user = getUser()
  const [form, setForm] = useState({
    store_name: user?.store_name || '',
    store_description: user?.store_description || '',
    phone: user?.phone || '',
    business_address: user?.business_address || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <SellerSidebar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 700 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Store Profile</h1>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>
                {user?.full_name?.[0]}
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>{user?.full_name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSave}>
              {[
                { name: 'store_name', label: 'Store Name' },
                { name: 'phone', label: 'Phone Number' },
                { name: 'business_address', label: 'Business Address' },
              ].map(f => (
                <div key={f.name} className="form-group">
                  <label>{f.label}</label>
                  <input className="input-field" value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label>Store Description</label>
                <textarea className="input-field" rows={4} value={form.store_description}
                  onChange={e => setForm({ ...form, store_description: e.target.value })}
                  style={{ resize: 'vertical' }} />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  )
}