import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    const fetchTransactions = async () => {
      try {
        setError(null)
        const { data, error } = await supabase
          .from('transactions')
          .select('*,categories(name, icon, color)')
          .eq('user_id', userId)
          .order('transaction_date', { ascending: false })

        if (error) throw error
        setTransactions(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userId])

  const addTransaction = async (transaction) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: userId }])
        .select()

      if (error) throw error
      setTransactions([data[0], ...transactions])
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return { transactions, loading, error, addTransaction }
}
