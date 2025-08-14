import { supabaseAdmin } from '@/lib/supabase'
import { validateOrderData } from '@/lib/orderUtils'
import type { Order } from '@/types/database'

export async function GET() {
  try {
    // Use admin client to bypass RLS
    if (!supabaseAdmin) {
      return new Response(
        JSON.stringify({ error: 'Supabase admin client is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate and normalize data
    const validatedData = (data || []).map(validateOrderData)
    
    return new Response(
      JSON.stringify({ orders: validatedData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}