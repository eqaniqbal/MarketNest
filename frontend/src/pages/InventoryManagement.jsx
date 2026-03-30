import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Search, Save, RefreshCw, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import SellerSidebar from '../components/SellerSidebar'
import api from '../utils/api'

const LOW_STOCK_THRESHOLD = 5

export default function InventoryManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [edits, setEdits]       = useState({})
  const [saving, setSaving]     = useState({})

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = () => {
    setLoading(true)
    // Use /products/mine — gets seller's own products including unapproved
    api.get('/products/mine')
      .then(res => { setProducts(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const handleQtyChange = (id, val) => {
    setEdits(prev => ({ ...prev, [id]: val }))
  }

  const handleSave = async (product) => {
    const newQty = edits[product.id]
    if (newQty === undefined || newQty === '') return
    if (Number(newQty) < 0) return toast.error('Quantity cannot be negative')

    setSaving(prev => ({ ...prev, [product.id]: true }))
    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        discount_price: product.discount_price,
        stock_quantity: Number(newQty)
      })
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_quantity: Number(newQty) } : p))
      setEdits(prev => { const n = { ...prev }; delete n[product.id]; return n })
      toast.success(`Stock updated for "${product.name}"`)
    } catch {
      toast.error('Could not update stock')
    }
    setSaving(prev => ({ ...prev, [product.id]: false }))
  }

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => {
      if (filter === 'low')  return p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD
      if (filter === 'out')  return p.stock_quantity === 0
      return true
    })

  const lowStockCount = products.filter(p => p.stock_quantity <= LOW_STOCK_THRESHOLD && p.stock_quantity > 0).length
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <SellerSidebar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 'calc(100% - 220px)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Inventory Management</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Monitor and update your product stock levels</p>
            </div>
            <button onClick={fetchProducts} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Products', value: products.length, color: 'var(--primary)', bg: 'var(--primary-light)' },
              { label: 'Low Stock', value: lowStockCount, color: '#F59E0B', bg: '#fef3c7' },
              { label: 'Out of Stock', value: outOfStockCount, color: 'var(--danger)', bg: '#fee2e2' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="card" style={{ padding: '1.1rem' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{s.label}</p>
                <p style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color }}>{loading ? '–' : s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Alert banner */}
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '0.9rem 1.2rem', marginBottom: '1.5rem' }}>
              <AlertTriangle size={18} color="#D97706" />
              <p style={{ fontSize: '0.88rem', color: '#92400E' }}>
                <strong>{lowStockCount} product(s)</strong> are running low.
                {outOfStockCount > 0 && <> <strong>{outOfStockCount}</strong> are out of stock.</>}
              </p>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-field"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
            {['all', 'low', 'out'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', cursor: 'pointer', fontWeight: filter === f ? 600 : 400, borderColor: filter === f ? 'var(--primary)' : 'var(--border)', background: filter === f ? 'var(--primary-light)' : 'white', color: filter === f ? 'var(--primary)' : 'var(--text-muted)' }}>
                {f === 'all' ? 'All' : f === 'low' ? '⚠️ Low Stock' : '❌ Out of Stock'}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading inventory...</p>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Package size={40} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>No products found</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Current Stock</th>
                      <th>Update Stock</th>
                      <th>Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const isLow = p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD
                      const isOut = p.stock_quantity === 0
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>{p.category}</td>
                          <td>
                            <span className={`badge ${p.is_approved ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                              {p.is_approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: isOut ? 'var(--danger)' : isLow ? '#D97706' : 'inherit' }}>
                              {p.stock_quantity}
                              {isOut && <span style={{ fontSize: '0.72rem', marginLeft: '0.3rem', color: 'var(--danger)' }}>OUT</span>}
                              {isLow && <span style={{ fontSize: '0.72rem', marginLeft: '0.3rem', color: '#D97706' }}>LOW</span>}
                            </span>
                          </td>
                          <td>
                            <input
                              type="number" min="0"
                              placeholder={String(p.stock_quantity)}
                              value={edits[p.id] !== undefined ? edits[p.id] : ''}
                              onChange={e => handleQtyChange(p.id, e.target.value)}
                              style={{ width: 90, padding: '0.4rem 0.6rem', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                              onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                          </td>
                          <td>
                            <button
                              onClick={() => handleSave(p)}
                              disabled={edits[p.id] === undefined || saving[p.id]}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: edits[p.id] === undefined ? 0.4 : 1 }}>
                              <Save size={13} /> {saving[p.id] ? '...' : 'Save'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
