import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, LogOut, Store, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { getUser, logout } from '../utils/auth'
import toast from 'react-hot-toast'

export default function Navbar() {
  const user = getUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        background: 'var(--accent)',
        padding: '0 2.5rem',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          width: 38, height: 38, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(200,151,58,0.4)'
        }}>
          <ShoppingBag size={20} color="white" strokeWidth={2.5} />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.22rem', color: 'white', letterSpacing: '-0.02em' }}>
          Market<span style={{ color: 'var(--primary)' }}>Nest</span>
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {!user && <>
          <Link to="/products" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', fontWeight: 500, padding: '0 0.5rem' }}>
            Browse
          </Link>
          <Link to="/buyer/login" style={{
            padding: '0.5rem 1.1rem', borderRadius: 8,
            background: 'rgba(255,255,255,0.08)', color: 'white',
            fontWeight: 500, fontSize: '0.88rem', border: '1px solid rgba(255,255,255,0.12)',
            transition: 'all 0.2s'
          }}>Login</Link>
          <Link to="/buyer/register" style={{
            padding: '0.5rem 1.1rem', borderRadius: 8,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: 'white', fontWeight: 600, fontSize: '0.88rem',
            boxShadow: '0 2px 12px rgba(200,151,58,0.35)', transition: 'all 0.2s'
          }}>Sign Up</Link>
          <Link to="/seller/login" style={{
            padding: '0.5rem 1rem', borderRadius: 8,
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
            fontWeight: 500, fontSize: '0.88rem', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: '0.35rem'
          }}>
            <Store size={14} /> Sell
          </Link>
        </>}

        {user?.role === 'buyer' && <>
          <Link to="/products" style={{ color: 'rgba(255,255,255,0.6)', padding: '0.5rem', borderRadius: 8, transition: 'color 0.2s' }}>
            <ShoppingBag size={19} />
          </Link>
          <Link to="/wishlist" style={{ color: 'rgba(255,255,255,0.6)', padding: '0.5rem', borderRadius: 8 }}>
            <Heart size={19} />
          </Link>
          <Link to="/cart" style={{ color: 'rgba(255,255,255,0.6)', padding: '0.5rem', borderRadius: 8 }}>
            <ShoppingCart size={19} />
          </Link>
          <Link to="/buyer/dashboard" style={{ color: 'rgba(255,255,255,0.6)', padding: '0.5rem', borderRadius: 8 }}>
            <User size={19} />
          </Link>
          <button onClick={handleLogout} style={{
            padding: '0.45rem 1rem', borderRadius: 8,
            background: 'rgba(239,68,68,0.15)', color: '#FCA5A5',
            border: '1px solid rgba(239,68,68,0.2)', fontWeight: 500, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <LogOut size={14} /> Logout
          </button>
        </>}

        {user?.role === 'seller' && <>
          <Link to="/seller/dashboard" style={{
            padding: '0.5rem 1.1rem', borderRadius: 8,
            background: 'var(--primary-light)', color: 'var(--primary-dark)',
            fontWeight: 600, fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <LayoutDashboard size={15} /> Dashboard
          </Link>
          <button onClick={handleLogout} style={{
            padding: '0.45rem 1rem', borderRadius: 8,
            background: 'rgba(239,68,68,0.15)', color: '#FCA5A5',
            border: '1px solid rgba(239,68,68,0.2)', fontWeight: 500, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <LogOut size={14} /> Logout
          </button>
        </>}

        {user?.role === 'admin' && <>
          <Link to="/admin/dashboard" style={{
            padding: '0.5rem 1.1rem', borderRadius: 8,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: 'white', fontWeight: 600, fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <LayoutDashboard size={15} /> Admin Panel
          </Link>
          <button onClick={handleLogout} style={{
            padding: '0.45rem 1rem', borderRadius: 8,
            background: 'rgba(239,68,68,0.15)', color: '#FCA5A5',
            border: '1px solid rgba(239,68,68,0.2)', fontWeight: 500, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <LogOut size={14} /> Logout
          </button>
        </>}
      </div>
    </motion.nav>
  )
}
