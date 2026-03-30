import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Upload, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import SellerSidebar from '../components/SellerSidebar'
import api from '../utils/api'

const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty', 'Toys', 'Groceries', 'Other']
const emptyForm = { name: '', description: '', category: '', price: '', discount_price: '', sku: '', stock_quantity: '', variants: '' }

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [images, setImages]     = useState([])
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    // Use /products/mine to get THIS seller's products including unapproved ones
    api.get('/products/mine')
      .then(res => { setProducts(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setImages([]); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description || '', category: p.category || '', price: p.price, discount_price: p.discount_price || '', sku: p.sku || '', stock_quantity: p.stock_quantity, variants: p.variants || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const res = await api.put(`/products/${editing.id}`, form)
        setProducts(products.map(p => p.id === editing.id ? { ...p, ...res.data } : p))
        toast.success('Product updated!')
      } else {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        images.forEach(img => fd.append('images', img))
        const res = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setProducts([res.data, ...products])
        toast.success('Product added! Awaiting admin approval.')
      }
      setShowModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally { setSaving(false) }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Remove this product?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
      toast.success('Product removed')
    } catch { toast.error('Could not remove product') }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <SellerSidebar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 'calc(100% - 220px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Product Management</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Manage your store's products</p>
            </div>
            <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} /> Add Product
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading products...</p>
          ) : products.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <Package size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>No products yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Add your first product to start selling!</p>
              <button className="btn btn-primary" onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={15} /> Add First Product
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{p.category}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                            Rs. {p.discount_price || p.price}
                          </span>
                          {p.discount_price && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'line-through', marginLeft: '0.4rem' }}>
                              Rs. {p.price}
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ color: p.stock_quantity < 5 ? 'var(--danger)' : 'inherit', fontWeight: p.stock_quantity < 5 ? 600 : 400 }}>
                            {p.stock_quantity}
                          </span>
                          {p.stock_quantity < 5 && <span style={{ fontSize: '0.72rem', color: 'var(--danger)', marginLeft: '0.3rem' }}>Low!</span>}
                        </td>
                        <td>
                          <span className={`badge ${p.is_approved ? 'badge-success' : 'badge-warning'}`}>
                            {p.is_approved ? '✓ Approved' : '⏳ Pending'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.82rem' }} onClick={() => openEdit(p)}>
                              <Edit2 size={13} />
                            </button>
                            <button className="btn btn-danger" style={{ padding: '0.35rem 0.7rem', fontSize: '0.82rem' }} onClick={() => deleteProduct(p.id)}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: '05%', left: '30%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 16, padding: '1.8rem', width: '100%', maxWidth: 520, zIndex: 101, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Product Name *</label>
                    <input className="input-field" placeholder="e.g. Wireless Headphones" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Description</label>
                    <textarea className="input-field" placeholder="Describe your product..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Category *</label>
                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Price (Rs.) *</label>
                      <input className="input-field" type="number" min="0" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Discount Price (Rs.)</label>
                      <input className="input-field" type="number" min="0" placeholder="Optional" value={form.discount_price} onChange={e => setForm({ ...form, discount_price: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>SKU Code</label>
                      <input className="input-field" placeholder="Unique product code" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Stock Quantity *</label>
                      <input className="input-field" type="number" min="0" placeholder="0" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Variants (Size, Color etc.)</label>
                    <input className="input-field" placeholder="e.g. Red, Blue, S, M, L" value={form.variants} onChange={e => setForm({ ...form, variants: e.target.value })} />
                  </div>
                  {!editing && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Product Images (max 5)</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', border: '2px dashed var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        <Upload size={16} /> {images.length > 0 ? `${images.length} image(s) selected` : 'Click to upload images'}
                        <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => setImages(Array.from(e.target.files).slice(0, 5))} />
                      </label>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setShowModal(false)}
                      style={{ flex: 1, padding: '0.7rem', border: '1.5px solid var(--border)', borderRadius: 9, background: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
