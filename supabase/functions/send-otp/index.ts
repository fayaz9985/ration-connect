import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

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

    // Rate limiting check
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('increment_rate_limit', {
        _identifier: phone_number,
        _action: 'send_otp',
        _limit: 3,
        _window_hours: 1
      })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    }

    if (rateLimitCheck === false) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many OTP requests. Please try again after 1 hour.',
          retry_after: 3600
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

    console.log(`OTP generated for ${phone_number}`)

    // Send OTP via Twilio SMS
    try {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
      const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
      
      const formData = new URLSearchParams()
      formData.append('To', `+91${phone_number}`)
      formData.append('From', TWILIO_PHONE_NUMBER!)
      formData.append('Body', `Your OTP is: ${otp_code}. It will expire in 10 minutes.`)

      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      if (!twilioResponse.ok) {
        const twilioError = await twilioResponse.text()
        console.error('Twilio API error:', twilioError)
        throw new Error(`Failed to send SMS: ${twilioError}`)
      }

      const twilioData = await twilioResponse.json()
      console.log('SMS sent successfully:', twilioData.sid)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP sent successfully via SMS'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (smsError) {
      console.error('Error sending SMS:', smsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send SMS',
          details: smsError instanceof Error ? smsError.message : 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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