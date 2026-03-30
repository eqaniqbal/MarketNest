import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function ProductCard({ product }) {
  const discount = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null

  return (
    <motion.div
      whileHover={{ y:-5, boxShadow:'0 16px 48px rgba(0,0,0,0.12)' }}
      transition={{ duration:0.2 }}
      style={{
        background:'white', borderRadius:16,
        border:'1px solid var(--border)',
        overflow:'hidden', cursor:'pointer',
        boxShadow:'var(--shadow-sm)'
      }}
    >
      <Link to={`/products/${product.id}`}>
        {/* Image */}
        <div style={{ position:'relative', paddingTop:'72%', background:'#F5F4F0', overflow:'hidden' }}>
          <img
            src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={product.name}
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s' }}
            onMouseEnter={e => e.target.style.transform='scale(1.05)'}
            onMouseLeave={e => e.target.style.transform='scale(1)'}
          />
          {discount && (
            <span style={{
              position:'absolute', top:10, left:10,
              background:'linear-gradient(135deg,var(--primary),var(--primary-dark))',
              color:'white', padding:'0.22rem 0.6rem',
              borderRadius:6, fontSize:'0.75rem', fontWeight:700,
              boxShadow:'0 2px 8px rgba(200,151,58,0.35)'
            }}>{discount}% OFF</span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding:'0.9rem 1rem 1rem' }}>
          <p style={{ fontSize:'0.73rem', color:'var(--text-muted)', marginBottom:'0.2rem', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em' }}>
            {product.store_name}
          </p>
          <h3 style={{ fontSize:'0.93rem', fontWeight:600, marginBottom:'0.5rem', lineHeight:1.35, color:'var(--text-main)' }}>
            {product.name}
          </h3>
          <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', marginBottom:'0.6rem' }}>
            <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
            <span style={{ fontSize:'0.8rem', fontWeight:600 }}>{Number(product.avg_rating||0).toFixed(1)}</span>
            <span style={{ fontSize:'0.76rem', color:'var(--text-muted)' }}>({product.review_count||0})</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ fontWeight:800, color:'var(--accent)', fontSize:'1.05rem' }}>
              Rs. {(product.discount_price||product.price).toLocaleString()}
            </span>
            {discount && (
              <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', textDecoration:'line-through' }}>
                Rs. {Number(product.price).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
