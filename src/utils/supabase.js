import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis Supabase não configuradas!')
  console.error('Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function handleSupabaseError(error) {
  console.error('Erro Supabase:', error)
  
  if (error.status === 401) {
    throw new Error('Não autenticado. Faça login novamente.')
  }
  
  if (error.status === 403) {
    throw new Error('Acesso negado.')
  }
  
  throw new Error(error.message || 'Erro ao conectar com banco de dados')
}
