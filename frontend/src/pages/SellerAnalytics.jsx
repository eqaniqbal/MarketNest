import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, ShoppingBag, Package, Award,
  Calendar, RefreshCw
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import Navbar from '../components/Navbar'
import SellerSidebar from '../components/SellerSidebar'
import api from '../utils/api'

const RANGES = [
  { label: '7 days',  value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

const STATUS_COLORS = {
  pending:   '#F59E0B',
  confirmed: 'var(--secondary)',
  packed:    '#8B5CF6',
  shipped:   'var(--success)',
  delivered: 'var(--primary)',
  cancelled: '#EF4444',
}

function StatCard({ label, value, icon, color, bg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: 'white', borderRadius: 12,
        border: '1px solid #E5E7EB', padding: '1.4rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
      }}
    >
      <div>
        <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.4rem' }}>{label}</p>
        <p style={{ fontSize: '1.8rem', fontWeight: 800, color }}>{value}</p>
      </div>
      <div style={{ background: bg, color, padding: '0.7rem', borderRadius: 10 }}>{icon}</div>
    </motion.div>
  )
}

export default function SellerAnalytics() {
  const [range, setRange]       = useState(30)
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchData = () => {
    setLoading(true)
    setError(null)
    api.get(`/analytics/seller?range=${range}`)
      .then(res => { setData(res.data); setLoading(false) })
      .catch(err => {
        setError('Could not load analytics. Make sure you have orders.')
        setLoading(false)
      })
  }

  useEffect(() => { fetchData() }, [range])

  // Format daily data — fill missing days with 0
  const chartData = (() => {
    if (!data?.daily) return []
    const map = {}
    data.daily.forEach(d => { map[d.date.slice(0, 10)] = d })
    const result = []
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      result.push({
        date: d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
        revenue: Number(map[key]?.revenue || 0),
        orders: Number(map[key]?.orders || 0),
      })
    }
    return result
  })()

  const totals = data?.totals || {}
  const topProducts = data?.topProducts || []
  const byStatus = data?.byStatus || []

  const formatRs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <SellerSidebar />
        <main style={{ flex: 1, padding: '2rem', minWidth: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A2E' }}>Sales Analytics</h1>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Track your revenue, orders, and top products</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="#6B7280" />
              <div style={{ display: 'flex', background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                {RANGES.map(r => (
                  <button key={r.value} onClick={() => setRange(r.value)}
                    style={{
                      padding: '0.5rem 0.9rem', border: 'none', cursor: 'pointer',
                      fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                      background: range === r.value ? 'var(--primary)' : 'white',
                      color: range === r.value ? 'white' : '#6B7280',
                      transition: 'all 0.15s'
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>
              <button onClick={fetchData} style={{
                background: 'white', border: '1px solid #E5E7EB',
                borderRadius: 8, padding: '0.5rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', color: '#6B7280'
              }}>
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: '#6B7280' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
              <p>Loading analytics...</p>
            </div>
          ) : error ? (
            <div style={{
              background: 'white', borderRadius: 12, border: '1px solid #E5E7EB',
              padding: '4rem', textAlign: 'center'
            }}>
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📉</p>
              <h3 style={{ color: '#1A1A2E', marginBottom: '0.4rem' }}>No data yet</h3>
              <p style={{ color: '#6B7280' }}>Start receiving orders to see your analytics here.</p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.2rem', marginBottom: '2rem'
              }}>
                <StatCard label="Total Revenue" value={formatRs(totals.total_revenue)}
                  icon={<TrendingUp size={20} />} color="var(--primary)" bg="#EEF2FF" delay={0} />
                <StatCard label="Total Orders" value={totals.total_orders || 0}
                  icon={<ShoppingBag size={20} />} color='var(--primary)' bg="var(--primary-light)" delay={0.05} />
                <StatCard label="Products Sold" value={totals.products_sold || 0}
                  icon={<Package size={20} />} color="#D97706" bg="#FFFBEB" delay={0.1} />
                <StatCard label="Top Product Sales" value={topProducts[0]?.units_sold ? `${topProducts[0].units_sold} units` : '—'}
                  icon={<Award size={20} />} color='var(--primary)' bg="#F5F3FF" delay={0.15} />
              </div>

              {/* Revenue Chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#1A1A2E' }}>Revenue — Last {range} Days</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      interval={range <= 7 ? 0 : Math.floor(range / 7)} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v, n) => [n === 'revenue' ? `Rs. ${v.toLocaleString()}` : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5}
                      dot={false} activeDot={{ r: 5, fill: 'var(--primary)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Orders Chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#1A1A2E' }}>Orders — Last {range} Days</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      interval={range <= 7 ? 0 : Math.floor(range / 7)} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} />
                    <Tooltip formatter={v => [v, 'Orders']} />
                    <Bar dataKey="orders" fill='var(--primary)' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                {/* Top Products */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', color: '#1A1A2E' }}>🏆 Top Selling Products</h3>
                  {topProducts.length === 0 ? (
                    <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem 0' }}>No sales yet</p>
                  ) : topProducts.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.8rem',
                      padding: '0.7rem 0',
                      borderBottom: i < topProducts.length - 1 ? '1px solid #F3F4F6' : 'none'
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i === 0 ? '#FEF3C7' : i === 1 ? '#F3F4F6' : '#FEE2E2',
                        color: i === 0 ? '#D97706' : i === 1 ? '#6B7280' : '#DC2626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.82rem', flexShrink: 0
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1A1A2E',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </p>
                        <p style={{ fontSize: '0.76rem', color: '#6B7280' }}>{p.units_sold} units sold</p>
                      </div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                        {formatRs(p.revenue)}
                      </p>
                    </div>
                  ))}
                </motion.div>

                {/* Orders by Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', color: '#1A1A2E' }}>📦 Orders by Status</h3>
                  {byStatus.length === 0 ? (
                    <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem 0' }}>No orders yet</p>
                  ) : byStatus.map((s, i) => {
                    const total = byStatus.reduce((sum, x) => sum + x.count, 0)
                    const pct = total > 0 ? Math.round(s.count / total * 100) : 0
                    const color = STATUS_COLORS[s.status] || '#9CA3AF'
                    return (
                      <div key={i} style={{ marginBottom: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                            {s.status}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{s.count} ({pct}%)</span>
                        </div>
                        <div style={{ background: '#F3F4F6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`, height: '100%',
                            background: color, borderRadius: 99,
                            transition: 'width 0.6s ease'
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
