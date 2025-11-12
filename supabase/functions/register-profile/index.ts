import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Registration via verified OTP - inserts profile securely using service role
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json().catch(() => null)
    if (!body) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const {
      phone_number,
      name,
      ration_card_no,
      card_type,
      address = null,
      family_members,
    } = body as {
      phone_number?: string
      name?: string
      ration_card_no?: string
      card_type?: string
      address?: string | null
      family_members?: number
    }

    // Basic validation
    if (!phone_number || !/^[6-9]\d{9}$/.test(phone_number)) {
      return new Response(JSON.stringify({ error: 'Invalid phone number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!name || name.trim().length < 2 || name.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!ration_card_no || ration_card_no.trim().length < 4 || ration_card_no.length > 50) {
      return new Response(JSON.stringify({ error: 'Invalid ration card number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const validCardTypes = new Set(['apl', 'bpl', 'aay', 'priority'])
    if (!card_type || !validCardTypes.has(card_type)) {
      return new Response(JSON.stringify({ error: 'Invalid card type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const fam = Number(family_members)
    if (!Number.isInteger(fam) || fam < 1 || fam > 20) {
      return new Response(JSON.stringify({ error: 'Invalid family members count' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Ensure OTP verified recently for this phone
    const { data: otp, error: otpErr } = await supabase
      .from('otp_codes')
      .select('phone_number, expires_at, verified')
      .eq('phone_number', phone_number)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (otpErr) {
      console.error('OTP fetch error:', otpErr)
    }

    if (!otp || !otp.verified || (otp.expires_at && new Date(otp.expires_at) < new Date())) {
      return new Response(JSON.stringify({ error: 'OTP not verified or expired' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Prevent duplicate registration
    const { data: existing, error: existingErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', phone_number)
      .maybeSingle()

    if (existingErr) {
      console.error('Existing profile check error:', existingErr)
    }

    if (existing) {
      return new Response(JSON.stringify({ error: 'User already registered' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Insert profile (service role bypasses RLS)
    const { data: newProfile, error: insertErr } = await supabase
      .from('profiles')
      .insert({
        phone_number,
        name: name.trim(),
        ration_card_no: ration_card_no.trim(),
        card_type,
        address,
        family_members: fam,
      })
      .select()
      .maybeSingle()

    if (insertErr || !newProfile) {
      console.error('Insert profile error:', insertErr)
      return new Response(JSON.stringify({ error: 'Failed to register' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ success: true, profile: newProfile }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('register-profile error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
