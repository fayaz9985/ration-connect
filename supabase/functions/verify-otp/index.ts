import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { phone_number, otp_code } = await req.json()

    // Input validation
    if (!phone_number || !otp_code) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(phone_number)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp_code)) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP format. Must be 6 digits' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Rate limiting check for verification attempts
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('increment_rate_limit', {
        _identifier: phone_number,
        _action: 'verify_otp',
        _limit: 5,
        _window_hours: 0.25 // 15 minutes
      })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    }

    if (rateLimitCheck === false) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many verification attempts. Please try again after 15 minutes.',
          retry_after: 900
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Find the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('otp_code', otp_code)
      .eq('verified', false)
      .single()

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP code' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if OTP has expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return new Response(
        JSON.stringify({ error: 'OTP has expired' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id)

    if (updateError) {
      console.error('Error updating OTP:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify OTP' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone_number', phone_number)
      .single()

    let isRegistered = false
    if (!profileError && profile) {
      isRegistered = true
    }

    console.log(`OTP verified for ${phone_number}. User registered: ${isRegistered}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP verified successfully',
        is_registered: isRegistered,
        profile: isRegistered ? profile : null
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in verify-otp function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})