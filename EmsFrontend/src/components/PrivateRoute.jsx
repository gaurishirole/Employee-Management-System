import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardSkeleton from './DashboardSkeleton'

const PrivateRoute = ({ component: Component }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return isAuthenticated ? <Component /> : <Navigate to="/login" replace />
}

export default PrivateRoute
