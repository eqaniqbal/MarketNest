import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingBag, Shield, Truck, Star, ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import api from '../utils/api'

// ── Category Data ──────────────────────────────────────────────────────────────
const categories = [
  { name: 'Electronics', icon: '📱', bg: '#EEF2FF' },
  { name: 'Fashion',     icon: '👗', bg: '#FFF1F2' },
  { name: 'Home',        icon: '🏠', bg: 'var(--primary-light)' },
  { name: 'Sports',      icon: '⚽', bg: '#FFFBEB' },
  { name: 'Books',       icon: '📚', bg: '#EFF6FF' },
  { name: 'Beauty',      icon: '💄', bg: '#FDF4FF' },
  { name: 'Toys',        icon: '🧸', bg: '#FFF7ED' },
  { name: 'Groceries',   icon: '🛒', bg: 'var(--primary-light)' },
]

const banners = [
  {
    title: 'Up to 50% Off Electronics',
    subtitle: 'Limited time deals on top brands',
    emoji: '📱',
    bg: 'linear-gradient(120deg, var(--accent) 0%, var(--accent-mid) 100%)',
    link: '/products?category=Electronics',
    tag: 'Hot Deal'
  },
  {
    title: 'New Fashion Collection',
    subtitle: 'Fresh styles added every week',
    emoji: '👗',
    bg: 'linear-gradient(120deg, var(--primary) 0%, var(--primary-dark) 100%)',
    link: '/products?category=Fashion',
    tag: 'New In'
  },
  {
    title: 'Free Shipping Over Rs. 2000',
    subtitle: 'On all standard deliveries nationwide',
    emoji: '🚚',
    bg: 'linear-gradient(120deg, var(--accent-mid) 0%, var(--accent-light) 100%)',
    link: '/products',
    tag: 'Free Delivery'
  },
]

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      <div style={{ paddingTop: '70%', background: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
        />
      </div>
      <div style={{ padding: '1rem' }}>
        {[75, 55, 35].map((w, i) => (
          <div key={i} style={{ height: 10, background: '#F3F4F6', borderRadius: 5, marginBottom: 8, width: `${w}%`, overflow: 'hidden', position: 'relative' }}>
            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
              style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Banner Slider ──────────────────────────────────────────────────────────────
function BannerSlider() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % banners.length), 4500)
    return () => clearInterval(t)
  }, [])

  const b = banners[current]

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: '3rem' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.38 }}
          style={{
            background: b.bg, borderRadius: 16, padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            minHeight: 190, cursor: 'pointer'
          }}
          onClick={() => navigate(b.link)}
        >
          <div>
            <span style={{
              background: 'rgba(255,255,255,0.2)', color: 'white',
              padding: '0.2rem 0.7rem', borderRadius: 99,
              fontSize: '0.75rem', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              marginBottom: '0.8rem'
            }}>
              <Tag size={11} /> {b.tag}
            </span>
            <h2 style={{ color: 'white', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 800, marginBottom: '0.4rem', lineHeight: 1.25 }}>
              {b.title}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '1.3rem' }}>{b.subtitle}</p>
            <button
              style={{
                background: 'white', border: 'none',
                padding: '0.55rem 1.3rem', borderRadius: 8,
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
              }}
            >
              Shop Now <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', userSelect: 'none', opacity: 0.9 }}>{b.emoji}</div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      {[{ fn: () => setCurrent(c => (c - 1 + banners.length) % banners.length), side: { left: 12 }, icon: <ChevronLeft size={16} /> },
        { fn: () => setCurrent(c => (c + 1) % banners.length), side: { right: 12 }, icon: <ChevronRight size={16} /> }
      ].map((btn, i) => (
        <button key={i} onClick={e => { e.stopPropagation(); btn.fn() }} style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)', ...btn.side,
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', cursor: 'pointer', zIndex: 2, backdropFilter: 'blur(4px)'
        }}>
          {btn.icon}
        </button>
      ))}

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.35rem', zIndex: 2 }}>
        {banners.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i) }} style={{
            width: i === current ? 20 : 6, height: 6, borderRadius: 99,
            background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0
          }} />
        ))}
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Home() {
  const [products, setProducts]   = useState([])
  const [search, setSearch]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSugg, setShowSugg]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [productCount, setProductCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/products')
      .then(res => { setProducts(res.data); setProductCount(res.data.length); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const fetchSuggestions = async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); setShowSugg(false); return }
    try {
      const all = products.filter(p => p.name?.toLowerCase().includes(q.toLowerCase()))
      const list = all.slice(0, 5).map(p => p.name)
      setSuggestions(list)
      setShowSugg(list.length > 0)
    } catch { setSuggestions([]) }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { setShowSugg(false); navigate(`/products?search=${encodeURIComponent(search.trim())}`) }
  }

  const handleCategory = (cat) => {
    setActiveCategory(cat)
    navigate(`/products?category=${cat}`)
  }

  const displayed = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(120deg, var(--accent) 0%, var(--primary-dark) 60%, var(--primary) 100%)',
        padding: 'clamp(3rem, 6vw, 5rem) 1.5rem',
        textAlign: 'center'
      }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 style={{
            color: 'white', fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
            fontWeight: 800, lineHeight: 1.15, marginBottom: '0.8rem'
          }}>
            Pakistan's Trusted<br />
            <span style={{ color: '#FCD34D' }}>Online Marketplace</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '2rem', maxWidth: 460, margin: '0 auto 2rem' }}>
            Shop from {productCount > 0 ? `${productCount}+` : 'thousands of'} products from verified sellers across Pakistan.
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 540, margin: '0 auto' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex' }}>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); fetchSuggestions(e.target.value) }}
                onFocus={() => { if (search.length >= 2) setShowSugg(suggestions.length > 0) }}
                onBlur={() => setTimeout(() => setShowSugg(false), 180)}
                placeholder="Search products, brands..."
                style={{
                  flex: 1, padding: '0.9rem 1.2rem',
                  borderRadius: '10px 0 0 10px', border: 'none',
                  fontSize: '0.95rem', outline: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                }}
              />
              <button type="submit" style={{
                padding: '0.9rem 1.4rem', background: 'var(--secondary)',
                color: 'white', border: 'none', borderRadius: '0 10px 10px 0',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <Search size={17} /> Search
              </button>
            </form>

            <AnimatePresence>
              {showSugg && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'white', borderRadius: '0 0 10px 10px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)', zIndex: 50,
                    textAlign: 'left', overflow: 'hidden'
                  }}
                >
                  {suggestions.map((s, i) => (
                    <div key={i}
                      onMouseDown={() => { setSearch(s); setShowSugg(false); navigate(`/products?search=${encodeURIComponent(s)}`) }}
                      style={{
                        padding: '0.7rem 1.1rem', cursor: 'pointer',
                        fontSize: '0.88rem', color: '#111827',
                        borderBottom: i < suggestions.length - 1 ? '1px solid #E5E7EB' : 'none',
                        display: 'flex', alignItems: 'center', gap: '0.6rem'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <Search size={13} color="#9CA3AF" /> {s}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.8rem', flexWrap: 'wrap' }}>
            <Link to="/products" style={{
              background: 'white', color: 'var(--primary)',
              padding: '0.7rem 1.5rem', borderRadius: 10,
              fontWeight: 700, fontSize: '0.9rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
            }}>
              <ShoppingBag size={16} /> Browse Products
            </Link>
            <Link to="/seller/register" style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              padding: '0.7rem 1.5rem', borderRadius: 10,
              fontWeight: 600, fontSize: '0.9rem',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
            }}>
              Start Selling <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Trust Strip ── */}
      <section style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '1.2rem 2rem' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { icon: <Truck size={20} />, text: 'Fast Delivery', sub: '3-5 days nationwide', color: 'var(--primary)' },
            { icon: <Shield size={20} />, text: 'Buyer Protection', sub: 'Safe & secure payments', color: 'var(--primary)' },
            { icon: <Star size={20} />, text: 'Verified Sellers', sub: 'Admin-approved only', color: '#D97706' },
            { icon: <Tag size={20} />, text: 'Best Prices', sub: 'Daily deals & coupons', color: '#DC2626' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ color: f.color, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>{f.text}</p>
                <p style={{ fontSize: '0.76rem', color: '#6B7280' }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        <BannerSlider />

        {/* ── Categories ── */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Shop by Category</h2>
            <Link to="/products" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.8rem' }}>
            {categories.map((cat, i) => (
              <motion.button key={i}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                onClick={() => handleCategory(cat.name)}
                style={{
                  background: activeCategory === cat.name ? '#EEF2FF' : 'white',
                  border: activeCategory === cat.name ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                  borderRadius: 12, padding: '1.1rem 0.5rem',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}
              >
                <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{cat.icon}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: activeCategory === cat.name ? 'var(--primary)' : '#374151', textAlign: 'center' }}>
                  {cat.name}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── Products ── */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
              {activeCategory ? `${activeCategory}` : 'Featured Products'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              {activeCategory && (
                <button onClick={() => setActiveCategory(null)} style={{
                  background: 'white', border: '1px solid #E5E7EB',
                  borderRadius: 7, padding: '0.35rem 0.8rem',
                  fontSize: '0.8rem', cursor: 'pointer', color: '#6B7280'
                }}>
                  ✕ Clear
                </button>
              )}
              <Link to={activeCategory ? `/products?category=${activeCategory}` : '/products'}
                style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                See all <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.2rem' }}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: 12, border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🛍️</p>
              <h3 style={{ color: '#111827', marginBottom: '0.4rem' }}>
                {activeCategory ? `No ${activeCategory} products yet` : 'No products yet'}
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Check back soon — new products are added daily!</p>
              {activeCategory && (
                <button onClick={() => setActiveCategory(null)}
                  style={{ marginTop: '1rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem 1.4rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  Show All
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.2rem' }}>
              {displayed.slice(0, 8).map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Sell CTA ── */}
        <section>
          <div style={{
            background: 'linear-gradient(120deg, var(--accent) 0%, var(--accent-mid) 100%)',
            borderRadius: 16, padding: 'clamp(2rem, 4vw, 2.8rem)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '1.5rem'
          }}>
            <div>
              <p style={{ color: '#A5B4FC', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                For Sellers
              </p>
              <h2 style={{ color: 'white', fontSize: 'clamp(1.2rem, 3vw, 1.7rem)', fontWeight: 800, marginBottom: '0.4rem' }}>
                Grow your business on MarketNest
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: 420 }}>
                Join our growing community of sellers. Free to start, no monthly fees.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <Link to="/seller/register" style={{
                background: 'var(--primary)', color: 'white',
                padding: '0.75rem 1.5rem', borderRadius: 10,
                fontWeight: 700, fontSize: '0.9rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
              }}>
                Create Seller Account <ArrowRight size={14} />
              </Link>
              <Link to="/seller/login" style={{
                background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                padding: '0.75rem 1.5rem', borderRadius: 10,
                fontWeight: 600, fontSize: '0.9rem',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                Seller Login
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: '#111827', padding: '2.5rem 2rem 1.5rem', marginTop: '3rem' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '2rem', marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
              <div style={{ background: 'var(--primary)', color: 'white', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>M</div>
              <span style={{ color: 'white', fontWeight: 800 }}>MarketNest</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', lineHeight: 1.7 }}>
              Pakistan's trusted marketplace. Verified sellers, secure payments.
            </p>
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.88rem' }}>Shop</p>
            {[['Browse Products', '/products'], ['My Cart', '/cart'], ['Wishlist', '/wishlist'], ['My Orders', '/buyer/dashboard']].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', marginBottom: '0.45rem' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.88rem' }}>Sell</p>
            {[['Become a Seller', '/seller/register'], ['Seller Login', '/seller/login'], ['Seller Dashboard', '/seller/dashboard']].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', marginBottom: '0.45rem' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.88rem' }}>Support</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', lineHeight: 1.8 }}>
              📧 support@marketnest.com<br />
              🕐 Mon–Sat, 9am–6pm PKT<br />
              🇵🇰 Pakistan
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>© 2024 MarketNest. All rights reserved.</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>Made with ❤️ in Pakistan</p>
        </div>
      </footer>
    </div>
  )
}