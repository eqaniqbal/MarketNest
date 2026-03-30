import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { login } from '../utils/auth'

export default function SellerRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '',
    store_name: '', business_address: '', bank_details: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { ...form, role: 'seller' })
      login(res.data.token, res.data.user)
      toast.success('Seller account created!')
      navigate('/seller/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const fields = [
    { name: 'store_name',       label: 'Store Name *',            type: 'text',     placeholder: 'Your store name',                          required: true },
    { name: 'full_name',        label: 'Owner Name *',            type: 'text',     placeholder: 'Full name',                                required: true },
    { name: 'email',            label: 'Email Address *',         type: 'email',    placeholder: 'you@email.com',                            required: true },
    { name: 'phone',            label: 'Phone Number *',          type: 'tel',      placeholder: '03XXXXXXXXX',                              required: true },
    { name: 'business_address', label: 'Business Address *',      type: 'text',     placeholder: 'Street, City, Province',                   required: true },
    { name: 'bank_details',     label: 'Bank / Payout Details',   type: 'text',     placeholder: 'Bank name & account number (for payouts)', required: false },
    { name: 'password',         label: 'Password *',              type: 'password', placeholder: 'Minimum 6 characters',                     required: true },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg) 0%, #F0EDE6 100%)', padding: '2rem 1rem' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'var(--secondary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Store color="white" size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Start Selling</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create your seller account on MarketNest</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              <input
                className="input-field"
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                required={field.required}
              />
              {field.name === 'bank_details' && (
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Optional — used for processing your payouts
                </p>
              )}
            </div>
          ))}
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: '0.5rem', background: 'var(--secondary)' }}
            disabled={loading}>
            {loading ? 'Creating account...' : 'Create Seller Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already registered? <Link to="/seller/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Seller Login</Link>
        </p>
      </motion.div>
    </div>
  )
}
