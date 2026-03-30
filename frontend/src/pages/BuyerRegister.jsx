import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { login } from '../utils/auth'

export default function BuyerRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { ...form, role: 'buyer' })
      login(res.data.token, res.data.user)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg) 0%, #F0EDE6 100%)', padding: '2rem 1rem' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <UserPlus color="white" size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join MarketNest as a buyer</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@email.com' },
            { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '03XXXXXXXXX' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
            { name: 'confirm_password', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
          ].map(field => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              <input className="input-field" type={field.type} placeholder={field.placeholder}
                value={form[field.name]} onChange={e => setForm({ ...form, [field.name]: e.target.value })} required />
            </div>
          ))}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/buyer/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Login</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Want to sell? <Link to="/seller/register" style={{ color: 'var(--secondary)', fontWeight: 500 }}>Register as Seller</Link>
        </p>
      </motion.div>
    </div>
  )
}