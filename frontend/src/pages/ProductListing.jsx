import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Search, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import api from '../utils/api'

const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty']
const sortOptions = [
  { value: '', label: 'Latest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: '',
  })

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.category) params.set('category', filters.category)
    if (filters.sort) params.set('sort', filters.sort)

    api.get(`/products?${params.toString()}`).then(res => {
      setProducts(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filters])

  const clearFilters = () => setFilters({ search: '', category: '', sort: '' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {filters.category || 'All Products'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{products.length} products found</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>

              {/* Search */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Search</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input-field" placeholder="Search products..."
                    value={filters.search} style={{ paddingLeft: '2.2rem' }}
                    onChange={e => setFilters({ ...filters, search: e.target.value })} />
                </div>
              </div>

              {/* Category */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category</label>
                <select className="input-field" value={filters.category}
                  onChange={e => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sort By</label>
                <select className="input-field" value={filters.sort}
                  onChange={e => setFilters({ ...filters, sort: e.target.value })}>
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <button className="btn btn-danger" onClick={clearFilters} style={{ alignSelf: 'flex-end' }}>
                <X size={15} /> Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Active filters chips */}
        {(filters.category || filters.search) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {filters.category && (
              <span className="badge badge-purple">
                {filters.category}
                <button onClick={() => setFilters({ ...filters, category: '' })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.3rem', color: 'inherit' }}>×</button>
              </span>
            )}
            {filters.search && (
              <span className="badge badge-info">
                "{filters.search}"
                <button onClick={() => setFilters({ ...filters, search: '' })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.3rem', color: 'inherit' }}>×</button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 'var(--radius)', height: 300, border: '1px solid var(--border)' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
            <h3 style={{ marginBottom: '0.5rem' }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try different search terms or clear your filters</p>
            <button className="btn btn-primary" onClick={clearFilters} style={{ marginTop: '1rem' }}>Clear Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}