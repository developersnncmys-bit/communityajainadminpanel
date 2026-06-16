import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Activities from './pages/Activities'
import Approvals from './pages/Approvals'
import Wallet from './pages/Wallet'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Access from './pages/Access'
import Login from './pages/Login'
import { Toasts } from './components/ui'
import { useStore } from './store'

// Gate every panel route behind authentication. Renders the app shell when
// signed in, otherwise bounces to /login (remembering where the user wanted to go).
function Protected() {
  const { user } = useStore()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Protected />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/access" element={<Access />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toasts />
    </>
  )
}
