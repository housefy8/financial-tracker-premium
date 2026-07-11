export default function PremiumSidebar({ isOpen, currentPage, onPageChange, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'transactions', label: '💳 Transações', icon: '💳' },
    { id: 'investments', label: '📈 Investimentos', icon: '📈' },
    { id: 'insights', label: '💡 Insights', icon: '💡' },
    { id: 'goals', label: '🎯 Metas', icon: '🎯' },
  ]

  return (
    <div style={{
      width: isOpen ? 280 : 80,
      backgroundColor: 'var(--primary-dark)',
      color: 'var(--text-white)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      boxShadow: 'var(--shadow-lg)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-6)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <h2 style={{
          fontSize: isOpen ? 'var(--font-size-lg)' : 0,
          fontWeight: 'var(--font-weight-bold)',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}>
          💰 FT
        </h2>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: 'var(--spacing-4)' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            style={{
              width: '100%',
              padding: 'var(--spacing-4)',
              marginBottom: 'var(--spacing-2)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: currentPage === item.id 
                ? 'var(--accent-green)' 
                : 'transparent',
              color: 'var(--text-white)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: isOpen ? 'var(--font-size-sm)' : 0,
              fontWeight: 'var(--font-weight-medium)',
              textAlign: isOpen ? 'left' : 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isOpen ? 'flex-start' : 'center',
              gap: isOpen ? 'var(--spacing-3)' : 0,
            }}
          >
            <span style={{ fontSize: isOpen ? 'var(--font-size-lg)' : 'var(--font-size-xl)' }}>
              {item.icon}
            </span>
            {isOpen && <span>{item.label.split(' ')[1]}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{
        padding: 'var(--spacing-4)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: 'var(--spacing-3)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: 'var(--text-white)',
            cursor: 'pointer',
            fontSize: isOpen ? 'var(--font-size-sm)' : 0,
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {isOpen ? 'Sair' : '🚪'}
        </button>
      </div>
    </div>
  )
}
