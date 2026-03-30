import { Navigate } from 'react-router-dom'
import { getUser } from '../utils/auth'

export default function ProtectedRoute({ children, role }) {
  const user = getUser()
  if (!user) return <Navigate to={`/${role}/login`} />
  if (user.role !== role) return <Navigate to="/" />
  return children
}