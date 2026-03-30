import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, ShoppingBag, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { login } from '../utils/auth'

export default function BuyerLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      if (res.data.user.role !== 'buyer') return toast.error('Please use a buyer account')
      login(res.data.token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.full_name}!`)
      navigate('/')
    } catch(err) { toast.error(err.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr' }}>
      {/* Left panel */}
      <div style={{
        background:'linear-gradient(145deg, var(--accent) 0%, var(--accent-mid) 60%, #0F3460 100%)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'3rem', position:'relative', overflow:'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-80, left:-80, width:300, height:300, borderRadius:'50%', background:'rgba(200,151,58,0.08)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(200,151,58,0.06)', pointerEvents:'none' }}/>

        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          style={{ textAlign:'center', zIndex:1 }}>
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 1.5rem', boxShadow:'0 8px 32px rgba(200,151,58,0.4)'
          }}>
            <ShoppingBag size={36} color="white" />
          </div>
          <h1 style={{ color:'white', fontSize:'2rem', fontWeight:800, marginBottom:'0.75rem', letterSpacing:'-0.03em' }}>
            Market<span style={{ color:'var(--primary)' }}>Nest</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.95rem', maxWidth:280, lineHeight:1.7 }}>
            Pakistan's trusted marketplace — thousands of products, verified sellers, secure payments.
          </p>
          <div style={{ marginTop:'2.5rem', display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            {['🛍️  Shop from 10,000+ products','🔒  Secure & fast checkout','🚚  Delivery across Pakistan'].map((f,i) => (
              <div key={i} style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.88rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>{f}</div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'3rem 2rem' }}>
        <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}
          style={{ width:'100%', maxWidth:400 }}>
          <div style={{ marginBottom:'2rem' }}>
            <h2 style={{ fontSize:'1.7rem', fontWeight:800, marginBottom:'0.4rem', letterSpacing:'-0.02em' }}>Welcome back</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'0.92rem' }}>Sign in to your buyer account</p>
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
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'0.85rem', marginTop:'0.5rem', fontSize:'0.95rem' }} disabled={loading}>
              <LogIn size={16} /> {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'0.5rem', textAlign:'center' }}>
            <p style={{ fontSize:'0.88rem', color:'var(--text-muted)' }}>
              No account? <Link to="/buyer/register" style={{ color:'var(--primary)', fontWeight:600 }}>Create one free</Link>
            </p>
            <p style={{ fontSize:'0.88rem', color:'var(--text-muted)' }}>
              Are you a seller? <Link to="/seller/login" style={{ color:'var(--accent)', fontWeight:600 }}>Seller Login →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
