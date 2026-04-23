import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { snackName, snackCreator, userEmail, price, ingredients } = await req.json()

    if (!snackName || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos: snackName y userEmail son obligatorios' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Create purchase record in predefined_snack_purchases
    const { error: purchaseError } = await supabaseClient
      .from('predefined_snack_purchases')
      .insert({
        snack_name: snackName,
        snack_creator: snackCreator || 'SnackMaker',
        user_email: userEmail,
        price: price || 0,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        purchased_at: new Date().toISOString(),
      })

    if (purchaseError) throw purchaseError

    // Update user inventory
    const { error: inventoryError } = await supabaseClient
      .from('user_inventory')
      .insert({
        user_email: userEmail,
        snack_name: snackName,
        snack_type: 'predefined',
        total_price: price || 0,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        purchased_at: new Date().toISOString(),
      })

    if (inventoryError) throw inventoryError

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
