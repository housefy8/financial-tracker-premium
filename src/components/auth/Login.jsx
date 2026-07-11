import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { login, signup, error } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignup) {
        await signup(email, password)
        setMessage('✅ Conta criada! Verifique seu email.')
      } else {
        await login(email, password)
        setMessage('✅ Login realizado!')
      }
      setEmail('')
      setPassword('')
    } catch (err) {
      setMessage(`❌ Erro: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-teal) 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: 'var(--spacing-8)',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <h1 style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: 'var(--spacing-2)',
          textAlign: 'center',
          color: 'var(--text-primary)',
        }}>
          Financial Tracker
        </h1>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--spacing-8)',
        }}>
          {isSignup ? 'Crie sua conta' : 'Faça login'}
        </p>

        {message && (
          <div style={{
            padding: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: message.includes('✅') 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            color: message.includes('✅') 
              ? 'var(--status-success)' 
              : 'var(--status-danger)',
            fontSize: 'var(--font-size-sm)',
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            padding: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--status-danger)',
            fontSize: 'var(--font-size-sm)',
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-2)',
              color: 'var(--text-primary)',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%',
                padding: 'var(--spacing-3) var(--spacing-4)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-2)',
              color: 'var(--text-primary)',
            }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha segura"
              required
              style={{
                width: '100%',
                padding: 'var(--spacing-3) var(--spacing-4)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              background: loading ? '#ccc' : 'var(--primary-teal)',
              color: 'var(--text-white)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Carregando...' : (isSignup ? 'Criar conta' : 'Entrar')}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: 'var(--font-size-sm)',
          marginTop: 'var(--spacing-6)',
          color: 'var(--text-secondary)',
        }}>
          {isSignup ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-teal)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              textDecoration: 'underline',
            }}
          >
            {isSignup ? 'Faça login' : 'Crie uma'}
          </button>
        </p>
      </div>
    </div>
  )
}
