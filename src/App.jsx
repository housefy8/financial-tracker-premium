// ===== App.jsx =====
import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'
import { useAuth } from './hooks/useAuth'
import PremiumSidebar from './components/premium/PremiumSidebar'
import PremiumHeader from './components/premium/PremiumHeader'
import PremiumDashboard from './components/PremiumDashboard'
import Transactions from './components/Transactions'
import { Investments } from './components/Transactions'
import { Insights } from './components/Transactions'
import { Goals } from './components/Layout_Auth_Goals'
import Login from './components/auth/Login'
import './styles/theme.css'

export default function AppPremium() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Login />
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PremiumDashboard user={user} />
      case 'transactions':
        return <Transactions user={user} />
      case 'investments':
        return <Investments user={user} />
      case 'insights':
        return <Insights user={user} />
      case 'goals':
        return <Goals user={user} />
      default:
        return <PremiumDashboard user={user} />
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <PremiumSidebar 
        isOpen={sidebarOpen}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <PremiumHeader 
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Content Area */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

// ===== Loading Screen =====
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-teal) 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'var(--text-white)' }}>
        <div style={{
          width: 60,
          height: 60,
          margin: '0 auto 24px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid var(--text-white)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 8 }}>
          Carregando...
        </h2>
        <p style={{ opacity: 0.8 }}>Seu sistema financeiro está pronto</p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
