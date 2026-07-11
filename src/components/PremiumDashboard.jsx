// ===== components/PremiumDashboard.jsx =====
// Design premium inspirado em COINEST
// Cores: Verde teal + bege + branco

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useTransactions } from '../hooks/useTransactions'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Eye, MoreVertical, Plus } from 'lucide-react'

export default function PremiumDashboard({ user }) {
  const { transactions, loading } = useTransactions(user.id)
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savingRate: 0
  })

  const COLORS = ['#4BAF7F', '#2D5E4F', '#3D7E6F', '#FFA726', '#42A5F5', '#AB47BC', '#EF5350', '#29B6F6']

  useEffect(() => {
    if (transactions.length === 0) return

    // Calcular estatísticas
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const balance = income - expense
    const savingRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0

    setStats({ totalIncome: income, totalExpense: expense, balance, savingRate })

    // Agrupar por mês para stacked bar chart
    const monthlyMap = new Map()
    transactions.forEach(t => {
      const date = new Date(t.transaction_date)
      const monthKey = date.toLocaleString('pt-BR', { month: 'short' }).slice(0, 3).toUpperCase()
      const yearMonth = `${monthKey}`
      
      if (!monthlyMap.has(yearMonth)) {
        monthlyMap.set(yearMonth, { month: yearMonth, income: 0, expense: 0 })
      }

      const month = monthlyMap.get(yearMonth)
      if (t.type === 'income') {
        month.income += parseFloat(t.amount)
      } else {
        month.expense += parseFloat(t.amount)
      }
    })

    setMonthlyData(Array.from(monthlyMap.values()).slice(-12))

    // Agrupar por categoria
    const categoryMap = new Map()
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const name = t.categories?.name || 'Outros'
        if (!categoryMap.has(name)) {
          categoryMap.set(name, 0)
        }
        categoryMap.set(name, categoryMap.get(name) + parseFloat(t.amount))
      })

    setCategoryData(
      Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    )
  }, [transactions])

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header com saudação */}
      <div style={{ padding: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
          Bem-vindo, {user?.email?.split('@')[0]}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Sua visão geral financeira completa
        </p>
      </div>

      {/* Grid Principal */}
      <div style={{ padding: '0 var(--spacing-lg)', paddingBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
          
          {/* Card Principal - Balance */}
          <div style={{
            gridColumn: 'span 1',
            backgroundColor: 'var(--primary-dark)',
            color: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decoração background */}
            <div style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-xl)' }}>
                <div>
                  <p style={{ opacity: 0.8, marginBottom: 'var(--spacing-sm)' }}>Saldo Total</p>
                  <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>
                    R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h2>
                </div>
                <div style={{ width: 50, height: 50, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={24} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                <div>
                  <p style={{ opacity: 0.7 }}>EXP</p>
                  <p style={{ fontWeight: 600 }}>1.829</p>
                </div>
                <div>
                  <p style={{ opacity: 0.7 }}>CVV</p>
                  <p style={{ fontWeight: 600 }}>****</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICard
            title="Receita Total"
            value={`R$ ${stats.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="+12%"
            icon={<TrendingUp size={20} />}
            color="var(--accent-green)"
          />

          <KPICard
            title="Despesa Total"
            value={`R$ ${stats.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="+8%"
            icon={<TrendingDown size={20} />}
            color="var(--danger)"
          />

          <KPICard
            title="Taxa de Economia"
            value={`${stats.savingRate}%`}
            change="Meta: 20%"
            icon={<TrendingUp size={20} />}
            color="var(--info)"
          />
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
          {/* Cashflow - Stacked Bar Chart */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.4s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>Fluxo de Caixa</h3>
              <select style={{
                border: '1px solid #E5E7EB',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                backgroundColor: 'var(--bg-primary)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)'
              }}>
                <option>Este Ano</option>
                <option>Últimos 6 Meses</option>
              </select>
            </div>

            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="var(--text-light)" />
                  <YAxis stroke="var(--text-light)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid #E5E7EB',
                      borderRadius: 'var(--radius-md)'
                    }}
                    formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                  />
                  <Legend />
                  <Bar dataKey="income" stackId="a" fill="var(--accent-green)" name="Receita" />
                  <Bar dataKey="expense" stackId="a" fill="var(--danger)" name="Despesa" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                Adicione transações para ver o gráfico
              </div>
            )}
          </div>

          {/* Estatísticas - Pie Chart */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>Despesas por Categoria</h3>
              <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-light)'
              }}>
                <MoreVertical size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--spacing-md)' }}>
                    {categoryData.slice(0, 4).map((cat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: COLORS[idx % COLORS.length]
                        }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 4 }}>
                            {cat.name}
                          </p>
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            R$ {cat.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-light)' }}>
                          {stats.totalExpense > 0 ? Math.round((cat.value / stats.totalExpense) * 100) : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ gridColumn: '1 / -1', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                  Registre despesas para ver análise
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transações Recentes */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-xl)',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>Transações Recentes</h3>
            <button style={{
              backgroundColor: 'var(--accent-green)',
              color: 'var(--text-white)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}>
              <Plus size={16} />
              Adicionar
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--bg-primary)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', color: 'var(--text-light)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Descrição</th>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', color: 'var(--text-light)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Categoria</th>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', color: 'var(--text-light)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Data</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-md)', color: 'var(--text-light)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 6).map(t => (
                  <tr key={t.id} style={{
                    borderBottom: '1px solid var(--bg-primary)',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer'
                  }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {t.description}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <span style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-secondary)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-sm)',
                        display: 'inline-block'
                      }}>
                        {t.categories?.icon} {t.categories?.name || 'Outros'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      {new Date(t.transaction_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{
                      padding: 'var(--spacing-md)',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: t.type === 'income' ? 'var(--accent-green)' : 'var(--danger)'
                    }}>
                      {t.type === 'income' ? '+' : '-'} R$ {parseFloat(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== Componente: KPI Card =====
function KPICard({ title, value, change, icon, color }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-xl)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      alignItems: 'start',
      gap: 'var(--spacing-lg)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        width: 56,
        height: 56,
        backgroundColor: `${color}20`,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0
      }}>
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--text-light)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>
          {title}
        </p>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          {value}
        </h4>
        <p style={{ color: 'var(--accent-green)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
          ↑ {change}
        </p>
      </div>
    </div>
  )
}

// ===== Componente: Loading Skeleton =====
function LoadingSkeleton() {
  return (
    <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            height: 200,
            background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-primary) 50%, var(--bg-card) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite'
          }} />
        ))}
      </div>
    </div>
  )
}
