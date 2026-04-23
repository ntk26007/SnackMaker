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

    const { name, userEmail, totalPrice, ingredients } = await req.json()

    // Create custom snack
    const { data: snack, error: snackError } = await supabaseClient
      .from('custom_snacks')
      .insert({
        name,
        user_email: userEmail,
        total_price: totalPrice,
        ingredients: ingredients,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (snackError) throw snackError

    // Create purchase record with total_amount instead of total_price
    const { error: purchaseError } = await supabaseClient
      .from('purchases')
      .insert({
        snack_id: snack.id,
        user_email: userEmail,
        total_amount: totalPrice,
        purchased_at: new Date().toISOString()
      })

    if (purchaseError) throw purchaseError

    // Update user inventory
    const { error: inventoryError } = await supabaseClient
      .from('user_inventory')
      .insert({
        user_email: userEmail,
        snack_name: name,
        snack_type: 'custom',
        total_price: totalPrice,
        ingredients: ingredients,
        purchased_at: new Date().toISOString()
      })

    if (inventoryError) throw inventoryError

    return new Response(
      JSON.stringify({ success: true, snack }),
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