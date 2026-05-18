import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { email, password, fullName, phone, role } = await req.json()

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    // Create user profile with admin role
    const { error: profileError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          phone,
          role: role || "admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

    if (profileError) {
      // Try to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create user profile: ${profileError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin account created successfully",
        userId: authData.user.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})
