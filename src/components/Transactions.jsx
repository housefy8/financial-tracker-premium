// ===== Transactions.jsx =====
// Gerenciamento de transações (receitas e despesas)

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useTransactions } from '../hooks/useTransactions'
import { Plus, Trash2, Edit2, Filter } from 'lucide-react'

export default function Transactions({ user }) {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(user.id)
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    type: 'expense',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'other',
    notes: ''
  })
  const [filter, setFilter] = useState({ type: 'all', category: 'all', month: 'all' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)

    if (error) console.error(error)
    else setCategories(data || [])
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    
    try {
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      })
      
      setFormData({
        description: '',
        amount: '',
        category_id: '',
        type: 'expense',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'other',
        notes: ''
      })
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
    }
  }

  const handleDeleteTransaction = async (id) => {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
      try {
        await deleteTransaction(id)
      } catch (error) {
        console.error('Erro ao deletar:', error)
      }
    }
  }

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const typeMatch = filter.type === 'all' || t.type === filter.type
      const categoryMatch = filter.category === 'all' || t.category_id === filter.category
      
      let monthMatch = true
      if (filter.month !== 'all') {
        const tMonth = new Date(t.transaction_date).toISOString().split('-').slice(0, 2).join('-')
        monthMatch = tMonth === filter.month
      }

      return typeMatch && categoryMatch && monthMatch
    })
  }

  const filteredTransactions = getFilteredTransactions()
  const totalFiltered = filteredTransactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount))
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <Plus className="w-5 h-5" />
          Nova Transação
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Nova Transação</h2>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                required
              />
              <input
                type="number"
                placeholder="Valor"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                step="0.01"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>

              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                required
              >
                <option value="">Selecione categoria</option>
                {categories
                  .filter(c => c.type === formData.type)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
              </select>

              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>

            <textarea
              placeholder="Notas (opcional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-primary"
              rows="2"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap items-center">
        <Filter className="w-5 h-5 text-gray-600" />
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none"
        >
          <option value="all">Todas as transações</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>

        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none"
        >
          <option value="all">Todas categorias</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <div className="text-sm font-semibold text-gray-700 ml-auto">
          Total: <span className={totalFiltered >= 0 ? 'text-green-600' : 'text-red-600'}>
            R$ {totalFiltered.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhuma transação encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Descrição</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoria</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(t.transaction_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {t.description}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {t.categories?.icon} {t.categories?.name}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-sm font-semibold text-right ${
                      t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.type === 'income' ? '+' : '-'} R$ {parseFloat(t.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="text-red-600 hover:text-red-800 transition inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ===== Investments.jsx =====
// Gestão de portfólio de investimentos

export function Investments({ user }) {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    ticker: '',
    initial_value: '',
    current_value: '',
    quantity: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    fetchInvestments()
  }, [user.id])

  const fetchInvestments = async () => {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setInvestments(data || [])
    setLoading(false)
  }

  const handleAddInvestment = async (e) => {
    e.preventDefault()

    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{
          user_id: user.id,
          ...formData,
          initial_value: parseFloat(formData.initial_value),
          current_value: parseFloat(formData.current_value) || parseFloat(formData.initial_value),
          quantity: parseFloat(formData.quantity) || 1
        }])
        .select()

      if (error) throw error

      setInvestments([data[0], ...investments])
      setFormData({
        name: '',
        type: 'stock',
        ticker: '',
        initial_value: '',
        current_value: '',
        quantity: '',
        purchase_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error)
    }
  }

  const totalInvested = investments.reduce((sum, i) => sum + parseFloat(i.initial_value), 0)
  const totalCurrent = investments.reduce((sum, i) => sum + parseFloat(i.current_value || i.initial_value), 0)
  const totalGain = totalCurrent - totalInvested
  const gainPercentage = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <Plus className="w-5 h-5" />
          Novo Investimento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Investido</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">R$ {totalInvested.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Valor Atual</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">R$ {totalCurrent.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Ganho/Perda</p>
          <p className={`text-2xl font-bold mt-2 ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {totalGain.toFixed(2)} ({gainPercentage}%)
          </p>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleAddInvestment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do Ativo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
                required
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="stock">Ação</option>
                <option value="fii">FII</option>
                <option value="crypto">Criptomeda</option>
                <option value="cdb">CDB</option>
                <option value="tesouro">Tesouro</option>
                <option value="fundo">Fundo</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Valor Inicial"
                value={formData.initial_value}
                onChange={(e) => setFormData({ ...formData, initial_value: e.target.value })}
                step="0.01"
                className="border border-gray-300 rounded-lg px-4 py-2"
                required
              />
              <input
                type="number"
                placeholder="Valor Atual"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                step="0.01"
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Investimentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : investments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum investimento registrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                  <th className="text-right py-3 px-4 font-semibold">Inicial</th>
                  <th className="text-right py-3 px-4 font-semibold">Atual</th>
                  <th className="text-right py-3 px-4 font-semibold">Ganho/Perda</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => {
                  const gain = (inv.current_value || inv.initial_value) - inv.initial_value
                  const percentage = ((gain / inv.initial_value) * 100).toFixed(2)
                  return (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{inv.name}</td>
                      <td className="py-3 px-4">{inv.type}</td>
                      <td className="py-3 px-4 text-right">R$ {inv.initial_value.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">R$ {(inv.current_value || inv.initial_value).toFixed(2)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {gain.toFixed(2)} ({percentage}%)
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ===== Insights.jsx =====
// Análise com IA dos padrões de gastos

export function Insights({ user }) {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const { transactions } = useTransactions(user.id)

  useEffect(() => {
    if (transactions.length > 0) {
      generateInsights()
    }
  }, [transactions])

  const generateInsights = async () => {
    try {
      // Calcular dados agregados
      const expensesByCategory = {}
      const monthlyData = {}

      transactions.forEach(t => {
        const month = new Date(t.transaction_date).toISOString().split('-').slice(0, 2).join('-')
        
        if (t.type === 'expense') {
          const category = t.categories?.name || 'Outros'
          expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(t.amount)
        }

        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0 }
        }
        if (t.type === 'income') {
          monthlyData[month].income += parseFloat(t.amount)
        } else {
          monthlyData[month].expense += parseFloat(t.amount)
        }
      })

      // Insights fixos (já que geramos insights com IA no backend)
      const newInsights = [
        {
          id: 1,
          type: 'spending_pattern',
          title: 'Categoria com Maior Gasto',
          description: `Você gastou mais em ${Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Diversos'}. Considere revisar se há oportunidades de economia.`,
          priority: 'normal'
        },
        {
          id: 2,
          type: 'saving_opportunity',
          title: 'Oportunidade de Economia',
          description: `Reduza gastos com assinaturas em 10-15%. Isso pode liberar R$ 100-200/mês para investimentos.`,
          priority: 'normal'
        },
        {
          id: 3,
          type: 'goal_progress',
          title: 'Sua Taxa de Economia',
          description: `Você está economizando ${((Object.values(monthlyData)[0]?.income - Object.values(monthlyData)[0]?.expense) / Object.values(monthlyData)[0]?.income * 100 || 0).toFixed(1)}% da renda. Continue assim!`,
          priority: 'low'
        }
      ]

      setInsights(newInsights)
    } catch (error) {
      console.error('Erro ao gerar insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 border-red-300'
      case 'normal': return 'bg-yellow-100 border-yellow-300'
      case 'low': return 'bg-green-100 border-green-300'
      default: return 'bg-gray-100 border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Insights Financeiros</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Gerando insights...</div>
      ) : insights.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Nenhum insight disponível. Adicione transações para ver análises!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map(insight => (
            <div key={insight.id} className={`rounded-lg border-l-4 p-6 ${getPriorityColor(insight.priority)}`}>
              <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
              <p className="text-gray-700 text-sm mb-4">{insight.description}</p>
              <div className="flex gap-2">
                <span className="text-xs bg-white px-2 py-1 rounded">
                  {insight.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
