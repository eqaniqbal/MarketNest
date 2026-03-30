import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Tag, Warehouse, User, ShoppingBag as Logo } from 'lucide-react'

const links = [
  { to:'/seller/dashboard',  icon:LayoutDashboard, label:'Dashboard' },
  { to:'/seller/products',   icon:Package,         label:'Products' },
  { to:'/seller/orders',     icon:ShoppingBag,     label:'Orders' },
  { to:'/seller/analytics',  icon:BarChart2,       label:'Analytics' },
  { to:'/seller/coupons',    icon:Tag,             label:'Coupons' },
  { to:'/seller/inventory',  icon:Warehouse,       label:'Inventory' },
  { to:'/seller/profile',    icon:User,            label:'Profile' },
]

export default function SellerSidebar() {
  const { pathname } = useLocation()

  return (
    <aside style={{
      width:220, minHeight:'calc(100vh - 68px)',
      background:'var(--accent)',
      borderRight:'1px solid rgba(255,255,255,0.06)',
      display:'flex', flexDirection:'column',
      padding:'1.5rem 0', flexShrink:0,
      position:'sticky', top:68
    }}>
      {/* Brand */}
      <div style={{ padding:'0 1.2rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <div style={{
            width:32, height:32, borderRadius:8,
            background:'linear-gradient(135deg,var(--primary),var(--primary-dark))',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            <Logo size={16} color="white" />
          </div>
          <span style={{ color:'white', fontWeight:700, fontSize:'0.95rem' }}>Seller Hub</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'1rem 0.75rem', display:'flex', flexDirection:'column', gap:'0.25rem', flex:1 }}>
        {links.map(({ to, icon:Icon, label }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to} style={{
              display:'flex', alignItems:'center', gap:'0.7rem',
              padding:'0.65rem 0.9rem', borderRadius:10,
              background: active ? 'rgba(200,151,58,0.15)' : 'transparent',
              color: active ? 'var(--primary)' : 'rgba(255,255,255,0.55)',
              fontWeight: active ? 700 : 400,
              fontSize:'0.88rem', transition:'all 0.15s',
              borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
              textDecoration:'none'
            }}
            onMouseEnter={e => { if(!active) { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.85)' }}}
            onMouseLeave={e => { if(!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.55)' }}}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
