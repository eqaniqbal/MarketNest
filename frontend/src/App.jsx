import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import AIChatBubble from './components/AIChatBubble'
import { getUser } from './utils/auth'
import OrderConfirmation from './pages/OrderConfirmation'

// Auth Pages
import SellerRegister from './pages/SellerRegister'
import SellerLogin from './pages/SellerLogin'
import BuyerRegister from './pages/BuyerRegister'
import BuyerLogin from './pages/BuyerLogin'
import AdminLogin from './pages/AdminLogin'

// Seller Pages
import SellerDashboard from './pages/SellerDashboard'
import ProductManagement from './pages/ProductManagement'
import OrderManagement from './pages/OrderManagement'
import SellerProfile from './pages/SellerProfile'
import SellerAnalytics from './pages/SellerAnalytics'
import SellerCoupons from './pages/SellerCoupons'
import InventoryManagement from './pages/InventoryManagement'

// Buyer Pages
import Home from './pages/Home'
import ProductListing from './pages/ProductListing'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import BuyerDashboard from './pages/BuyerDashboard'
import Wishlist from './pages/Wishlist'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'

// Shared
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const user = getUser()
  // Show chatbot for everyone EXCEPT admin
  const showChat = !user || user?.role !== 'admin'

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: 'Inter, sans-serif', borderRadius: '10px' }
      }} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/buyer/register" element={<BuyerRegister />} />
        <Route path="/buyer/login" element={<BuyerLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Seller protected */}
        <Route path="/seller/dashboard" element={
          <ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>
        } />
        <Route path="/seller/products" element={
          <ProtectedRoute role="seller"><ProductManagement /></ProtectedRoute>
        } />
        <Route path="/seller/orders" element={
          <ProtectedRoute role="seller"><OrderManagement /></ProtectedRoute>
        } />
        <Route path="/seller/profile" element={
          <ProtectedRoute role="seller"><SellerProfile /></ProtectedRoute>
        } />
        <Route path="/seller/analytics" element={
          <ProtectedRoute role="seller"><SellerAnalytics /></ProtectedRoute>
        } />
        <Route path="/seller/coupons" element={
          <ProtectedRoute role="seller"><SellerCoupons /></ProtectedRoute>
        } />
        <Route path="/seller/inventory" element={
          <ProtectedRoute role="seller"><InventoryManagement /></ProtectedRoute>
        } />

        {/* Buyer protected */}
        <Route path="/cart" element={
          <ProtectedRoute role="buyer"><Cart /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute role="buyer"><Checkout /></ProtectedRoute>
        } />
        <Route path="/buyer/dashboard" element={
          <ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute role="buyer"><Wishlist /></ProtectedRoute>
        } />
        <Route path="/order-confirmation" element={
          <ProtectedRoute role="buyer"><OrderConfirmation /></ProtectedRoute>
        } />

        {/* Admin protected */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Nesty AI — shown for buyers, sellers, and guests. Hidden for admins. */}
      {showChat && <AIChatBubble />}
    </BrowserRouter>
  )
}
