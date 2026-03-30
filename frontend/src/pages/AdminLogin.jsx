import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { login } from '../utils/auth'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post('/auth/login', form)

      // Check if user is admin
      if (res.data.user.role !== 'admin') {
        toast.error('Access denied. Admins only.')
        return
      }

      // Save token and user info
      login(res.data.token, res.data.user)
      toast.success('Welcome, Admin!')
      navigate('/admin/dashboard')

    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--bg) 0%, #F0EDE6 100%)',
        padding: '2rem'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: 'var(--text-main)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <ShieldCheck color="white" size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Admin Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Restricted access — authorized personnel only
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              className="input-field"
              type="email"
              name="email"
              placeholder="admin@marketnest.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              name="password"
              placeholder="Admin password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.8rem',
              marginTop: '0.5rem',
              background: 'var(--text-main)'
            }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Login as Admin'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}