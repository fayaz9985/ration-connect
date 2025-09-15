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

    if (!phone_number || !otp_code) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP code are required' }),
        { 
          status: 400, 
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