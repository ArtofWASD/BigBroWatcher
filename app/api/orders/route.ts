import { createClient } from '@/lib/supabase/server'
import { validateOrderData } from '@/lib/orderUtils'

export async function GET() {
  try {
    // Use server client with session
    const supabase = await createClient()
    
    // Проверяем сессию пользователя
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const { data, error } = await supabase
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
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Произошла ошибка при загрузке данных' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}