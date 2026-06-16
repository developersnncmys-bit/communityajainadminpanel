import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Activities from './pages/Activities'
import Approvals from './pages/Approvals'
import Wallet from './pages/Wallet'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Access from './pages/Access'
import { Toasts } from './components/ui'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/access" element={<Access />} />
      </Routes>
      <Toasts />
    </Layout>
  )
}
