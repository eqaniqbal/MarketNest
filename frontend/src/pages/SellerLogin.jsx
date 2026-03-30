import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, Mail, Lock, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { login } from '../utils/auth'

export default function SellerLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      if (res.data.user.role !== 'seller' && res.data.user.role !== 'admin')
        return toast.error('Please use a seller or admin account')
      login(res.data.token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.full_name}!`)
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/seller/dashboard')
    } catch(err) { toast.error(err.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr' }}>
      <div style={{
        background:'linear-gradient(145deg, #0F3460 0%, var(--accent-mid) 50%, var(--accent) 100%)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'3rem', position:'relative', overflow:'hidden'
      }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'rgba(200,151,58,0.07)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-60, left:-60, width:220, height:220, borderRadius:'50%', background:'rgba(200,151,58,0.05)', pointerEvents:'none' }}/>
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} style={{ textAlign:'center', zIndex:1 }}>
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 1.5rem', boxShadow:'0 8px 32px rgba(200,151,58,0.4)'
          }}>
            <Store size={36} color="white" />
          </div>
          <h1 style={{ color:'white', fontSize:'1.9rem', fontWeight:800, marginBottom:'0.75rem', letterSpacing:'-0.03em' }}>
            Seller <span style={{ color:'var(--primary)' }}>Portal</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.92rem', maxWidth:280, lineHeight:1.7 }}>
            Manage your store, track orders, and grow sales with powerful analytics.
          </p>
          <div style={{ marginTop:'2.5rem', display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            {['📦  List unlimited products','📊  Real-time sales analytics','💬  Chat directly with buyers'].map((f,i) => (
              <div key={i} style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.88rem' }}>{f}</div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'3rem 2rem' }}>
        <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}
          style={{ width:'100%', maxWidth:400 }}>
          <div style={{ marginBottom:'2rem' }}>
            <h2 style={{ fontSize:'1.7rem', fontWeight:800, marginBottom:'0.4rem', letterSpacing:'-0.02em' }}>Seller / Admin Login</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'0.92rem' }}>Access your dashboard</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                <input className="input-field" type="email" placeholder="you@email.com" style={{ paddingLeft:'2.5rem' }}
                  value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                <input className="input-field" type="password" placeholder="Your password" style={{ paddingLeft:'2.5rem' }}
                  value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
              </div>
            </div>
            <button className="btn btn-dark" style={{ width:'100%', justifyContent:'center', padding:'0.85rem', marginTop:'0.5rem', fontSize:'0.95rem' }} disabled={loading}>
              <TrendingUp size={16} /> {loading ? 'Signing in…' : 'Access Dashboard'}
            </button>
          </form>
          <div style={{ marginTop:'1.5rem', textAlign:'center' }}>
            <p style={{ fontSize:'0.88rem', color:'var(--text-muted)' }}>
              New seller? <Link to="/seller/register" style={{ color:'var(--primary)', fontWeight:600 }}>Register your store</Link>
            </p>
            <p style={{ fontSize:'0.88rem', color:'var(--text-muted)', marginTop:'0.4rem' }}>
              Are you a buyer? <Link to="/buyer/login" style={{ color:'var(--accent)', fontWeight:600 }}>Buyer Login →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
