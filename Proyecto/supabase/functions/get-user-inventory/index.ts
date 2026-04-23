import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to parse a single ingredient (may be object or JSON string)
function parseIngredient(ing: any): { name: string; quantity: number } | null {
  if (!ing) return null;
  if (typeof ing === 'string') {
    try {
      const parsed = JSON.parse(ing);
      return { name: parsed.name || '', quantity: parsed.quantity || 1 };
    } catch {
      return { name: ing, quantity: 1 };
    }
  }
  if (typeof ing === 'object') {
    return { name: ing.name || '', quantity: ing.quantity || 1 };
  }
  return null;
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

    const url = new URL(req.url)
    const userEmail = url.searchParams.get('email')

    if (!userEmail) {
      throw new Error('Email is required')
    }

    // Get user inventory
    const { data: inventory, error } = await supabaseClient
      .from('user_inventory')
      .select('*')
      .eq('user_email', userEmail)
      .order('purchased_at', { ascending: false })

    if (error) throw error

    // Calculate statistics
    const totalPurchases = inventory.length
    const totalSpent = inventory.reduce((sum, item) => sum + item.total_price, 0)
    
    const customCount = inventory.filter(item => item.snack_type === 'custom').length
    const predefinedCount = inventory.filter(item => item.snack_type === 'predefined').length

    // Get favorite ingredients - handle all formats (object, JSON string, array of strings)
    const ingredientCounts: { [key: string]: number } = {}
    inventory.forEach(item => {
      let ingredients = item.ingredients;

      // If ingredients is a string, try to parse it as JSON array
      if (typeof ingredients === 'string') {
        try {
          ingredients = JSON.parse(ingredients);
        } catch {
          ingredients = [];
        }
      }

      if (Array.isArray(ingredients)) {
        ingredients.forEach((ing: any) => {
          const parsed = parseIngredient(ing);
          if (parsed && parsed.name) {
            ingredientCounts[parsed.name] = (ingredientCounts[parsed.name] || 0) + (parsed.quantity || 1);
          }
        });
      }
    })

    const favoriteIngredients = Object.entries(ingredientCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    return new Response(
      JSON.stringify({
        inventory,
        stats: {
          totalPurchases,
          totalSpent,
          customCount,
          predefinedCount,
          favoriteIngredients
        }
      }),
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
