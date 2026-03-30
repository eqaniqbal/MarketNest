import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import SellerSidebar from '../components/SellerSidebar'
import api from '../utils/api'

const EMPTY_FORM = {
  code: '', discount_type: 'percentage',
  discount_value: '', min_order_amount: '',
  start_date: '', end_date: '', is_active: true
}

function Badge({ active }) {
  return (
    <span style={{
      padding: '0.2rem 0.65rem', borderRadius: 99,
      fontSize: '0.72rem', fontWeight: 700,
      background: active ? 'var(--primary-light)' : '#F9FAFB',
      color: active ? 'var(--primary)' : '#9CA3AF',
      border: `1px solid ${active ? '#BBF7D0' : '#E5E7EB'}`
    }}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function CouponModal({ coupon, onClose, onSave }) {
  const [form, setForm] = useState(coupon || EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async () => {
    if (!form.code.trim()) return toast.error('Enter a coupon code')
    if (!form.discount_value || Number(form.discount_value) <= 0) return toast.error('Enter a valid discount value')
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) return toast.error('Percentage cannot exceed 100')

    setSaving(true)
    try {
      if (coupon?.id) {
        const res = await api.put(`/coupons/${coupon.id}`, form)
        onSave(res.data, 'update')
        toast.success('Coupon updated!')
      } else {
        const res = await api.post('/coupons', form)
        onSave(res.data, 'create')
        toast.success('Coupon created!')
      }
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.9rem',
    border: '1.5px solid #E5E7EB', borderRadius: 8,
    fontSize: '0.88rem', fontFamily: 'Inter, sans-serif',
    outline: 'none', color: '#1A1A2E', background: '#F9FAFB',
    boxSizing: 'border-box'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '1rem'
    }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16,
          padding: '2rem', width: '100%', maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#1A1A2E' }}>
            {coupon?.id ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Code */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
              Coupon Code *
            </label>
            <input
              style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '0.08em' }}
              placeholder="e.g. SAVE20"
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())}
            />
          </div>

          {/* Discount Type + Value */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                Discount Type *
              </label>
              <select style={inputStyle} value={form.discount_type} onChange={e => set('discount_type', e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (Rs.)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                Discount Value *
              </label>
              <input style={inputStyle} type="number" min="0"
                placeholder={form.discount_type === 'percentage' ? '20' : '500'}
                value={form.discount_value}
                onChange={e => set('discount_value', e.target.value)}
              />
            </div>
          </div>

          {/* Min Order */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
              Minimum Order Amount (Rs.) <span style={{ color: '#9CA3AF', fontWeight: 400 }}>— optional</span>
            </label>
            <input style={inputStyle} type="number" min="0"
              placeholder="0 = no minimum"
              value={form.min_order_amount}
              onChange={e => set('min_order_amount', e.target.value)}
            />
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>Start Date</label>
              <input style={inputStyle} type="date" value={form.start_date?.slice(0, 10) || ''}
                onChange={e => set('start_date', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>End Date</label>
              <input style={inputStyle} type="date" value={form.end_date?.slice(0, 10) || ''}
                onChange={e => set('end_date', e.target.value)} />
            </div>
          </div>

          {/* Active toggle */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            cursor: 'pointer', padding: '0.75rem', background: '#F9FAFB',
            borderRadius: 8, border: '1px solid #E5E7EB'
          }}>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {form.is_active
                ? <ToggleRight size={28} color="var(--primary)" />
                : <ToggleLeft size={28} color="#9CA3AF" />}
            </button>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1A1A2E' }}>
                {form.is_active ? 'Active' : 'Inactive'}
              </p>
              <p style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                {form.is_active ? 'Buyers can use this coupon' : 'Coupon is disabled'}
              </p>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '0.75rem', border: '1.5px solid #E5E7EB',
            borderRadius: 8, background: 'white', cursor: 'pointer',
            fontWeight: 600, color: '#6B7280', fontFamily: 'Inter, sans-serif'
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{
            flex: 2, padding: '0.75rem', border: 'none',
            borderRadius: 8, background: saving ? '#A5B4FC' : 'var(--primary)',
            color: 'white', cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
          }}>
            <Check size={16} /> {saving ? 'Saving...' : coupon?.id ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function SellerCoupons() {
  const [coupons, setCoupons]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)

  useEffect(() => {
    api.get('/coupons/my')
      .then(res => { setCoupons(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = (saved, action) => {
    if (action === 'create') setCoupons(prev => [saved, ...prev])
    else setCoupons(prev => prev.map(c => c.id === saved.id ? saved : c))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return
    try {
      await api.delete(`/coupons/${id}`)
      setCoupons(prev => prev.filter(c => c.id !== id))
      toast.success('Coupon deleted')
    } catch {
      toast.error('Failed to delete coupon')
    }
  }

  const handleToggle = async (coupon) => {
    try {
      const res = await api.put(`/coupons/${coupon.id}`, { ...coupon, is_active: !coupon.is_active })
      setCoupons(prev => prev.map(c => c.id === res.data.id ? res.data : c))
      toast.success(`Coupon ${res.data.is_active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update coupon')
    }
  }

  const openCreate = () => { setEditing(null); setShowModal(true) }
  const openEdit = (c) => { setEditing(c); setShowModal(true) }

  const isExpired = (c) => c.end_date && new Date(c.end_date) < new Date()

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <SellerSidebar />
        <main style={{ flex: 1, padding: '2rem', minWidth: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A2E' }}>Coupons & Promotions</h1>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Create discount codes for your buyers</p>
            </div>
            <button onClick={openCreate} style={{
              background: 'var(--primary)', color: 'white', border: 'none',
              borderRadius: 10, padding: '0.7rem 1.3rem', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <Plus size={18} /> Create Coupon
            </button>
          </div>

          {/* Info banner */}
          <div style={{
            background: '#EEF2FF', border: '1px solid #C7D2FE',
            borderRadius: 10, padding: '0.9rem 1.2rem',
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            marginBottom: '2rem', color: '#3730A3', fontSize: '0.85rem'
          }}>
            <Tag size={16} />
            <span>Buyers enter coupon codes at checkout. Coupons apply to the total order amount.</span>
          </div>

          {/* Coupons List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: '#6B7280' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎟️</div>
              <p>Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                background: 'white', borderRadius: 16, border: '1px dashed #D1D5DB',
                padding: '4rem', textAlign: 'center'
              }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</p>
              <h3 style={{ color: '#1A1A2E', marginBottom: '0.5rem' }}>No coupons yet</h3>
              <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Create your first coupon to start attracting buyers</p>
              <button onClick={openCreate} style={{
                background: 'var(--primary)', color: 'white', border: 'none',
                borderRadius: 8, padding: '0.7rem 1.5rem', cursor: 'pointer',
                fontWeight: 600, fontFamily: 'Inter, sans-serif'
              }}>
                Create First Coupon
              </button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
              <AnimatePresence>
                {coupons.map((c, i) => {
                  const expired = isExpired(c)
                  return (
                    <motion.div key={c.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                      style={{
                        background: 'white', borderRadius: 12,
                        border: `1px solid ${expired ? '#FCA5A5' : '#E5E7EB'}`,
                        overflow: 'hidden', opacity: expired ? 0.75 : 1
                      }}
                    >
                      {/* Coupon top band */}
                      <div style={{
                        background: expired ? '#FEF2F2' : c.is_active ? '#EEF2FF' : '#F9FAFB',
                        padding: '1rem 1.2rem',
                        borderBottom: '1px dashed #E5E7EB',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div>
                          <p style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem',
                            color: expired ? '#EF4444' : 'var(--primary)', letterSpacing: '0.1em' }}>
                            {c.code}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.2rem' }}>
                            {expired ? '⚠️ Expired' : c.discount_type === 'percentage'
                              ? `${c.discount_value}% off`
                              : `Rs. ${c.discount_value} off`}
                          </p>
                        </div>
                        <Badge active={c.is_active && !expired} />
                      </div>

                      {/* Details */}
                      <div style={{ padding: '1rem 1.2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                          {[
                            { label: 'Discount', value: c.discount_type === 'percentage' ? `${c.discount_value}%` : `Rs. ${c.discount_value}` },
                            { label: 'Min Order', value: c.min_order_amount > 0 ? `Rs. ${c.min_order_amount}` : 'None' },
                            { label: 'Start', value: c.start_date ? new Date(c.start_date).toLocaleDateString('en-PK') : 'Immediately' },
                            { label: 'Expires', value: c.end_date ? new Date(c.end_date).toLocaleDateString('en-PK') : 'Never' },
                          ].map((item, j) => (
                            <div key={j}>
                              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0.1rem' }}>{item.label}</p>
                              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{item.value}</p>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEdit(c)} style={{
                            flex: 1, padding: '0.55rem', border: '1.5px solid #E5E7EB',
                            borderRadius: 7, background: 'white', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: 600, color: '#374151',
                            fontFamily: 'Inter, sans-serif'
                          }}>
                            Edit
                          </button>
                          <button onClick={() => handleToggle(c)} style={{
                            flex: 1, padding: '0.55rem',
                            border: `1.5px solid ${c.is_active ? '#FCA5A5' : '#A7F3D0'}`,
                            borderRadius: 7, background: 'white', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: 600,
                            color: c.is_active ? '#EF4444' : 'var(--primary)',
                            fontFamily: 'Inter, sans-serif',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                          }}>
                            {c.is_active ? <><ToggleLeft size={14} /> Disable</> : <><ToggleRight size={14} /> Enable</>}
                          </button>
                          <button onClick={() => handleDelete(c.id)} style={{
                            padding: '0.55rem 0.75rem', border: '1.5px solid #FCA5A5',
                            borderRadius: 7, background: 'white', cursor: 'pointer',
                            color: '#EF4444', display: 'flex', alignItems: 'center'
                          }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <CouponModal coupon={editing} onClose={() => setShowModal(false)} onSave={handleSave} />
        )}
      </AnimatePresence>
    </div>
  )
}
