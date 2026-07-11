export default function PremiumHeader({ user, onMenuToggle }) {
  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--spacing-8)',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)',
    }}>
      {/* Left */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
      }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--spacing-2)',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.3s ease',
          }}
        >
          ☰
        </button>
        <h1 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-primary)',
        }}>
          Gestor Financeiro
        </h1>
      </div>

      {/* Right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
      }}>
        <span style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)',
        }}>
          {user?.email}
        </span>
      </div>
    </header>
  )
}
