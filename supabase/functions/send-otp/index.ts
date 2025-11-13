import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Test mode - OTP will be returned in response instead of sent via SMS

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

    const { phone_number } = await req.json()

    // Input validation
    if (!phone_number) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate phone number format (10 digits, starting with 6-9 for Indian numbers)
    if (!/^[6-9]\d{9}$/.test(phone_number)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format. Must be 10 digits starting with 6-9' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Rate limiting check - increased to 10 attempts per hour for better UX
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('increment_rate_limit', {
        _identifier: phone_number,
        _action: 'send_otp',
        _limit: 10,
        _window_hours: 1
      })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    }

    if (rateLimitCheck === false) {
      // Get the rate limit record to calculate exact retry time
      const { data: rateLimit } = await supabase
        .from('rate_limits')
        .select('window_start')
        .eq('identifier', phone_number)
        .eq('action', 'send_otp')
        .single()

      const retryAfterMinutes = rateLimit 
        ? Math.ceil((new Date(rateLimit.window_start).getTime() + 3600000 - Date.now()) / 60000)
        : 60

      return new Response(
        JSON.stringify({ 
          error: `Too many OTP requests. Please try again after ${retryAfterMinutes} minutes.`,
          retry_after: retryAfterMinutes * 60
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate 6-digit OTP
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString()

    // Delete any existing OTPs for this phone number
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone_number', phone_number)

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone_number,
        otp_code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
      })

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`OTP generated for ${phone_number}: ${otp_code}`)

    // Test mode - Return OTP in response for testing purposes
    // In production, this should be sent via SMS service
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP generated successfully',
        otp: otp_code // Only for testing - remove in production
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-otp function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})