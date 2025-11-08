import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const { sendOtp, verifyOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await sendOtp(phoneNumber);

    if (result.success) {
      setOtpSent(true);
      // Show OTP for testing (SMS not yet implemented)
      setGeneratedOtp(result.otp || '');
      toast({
        title: "OTP Sent",
        description: result.otp 
          ? `Your OTP: ${result.otp}` 
          : "OTP sent successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send OTP",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await verifyOtp(phoneNumber, otpCode);

    if (result.success) {
      if (result.isRegistered) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Account Not Found",
          description: "Please register first",
        });
        navigate('/register', { state: { phoneNumber } });
      }
    } else {
      toast({
        title: "Error",
        description: result.error || "Invalid OTP",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
          <CardDescription>
            {t('common.phone')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('common.phone')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={otpSent}
              maxLength={10}
            />
          </div>

          {!otpSent ? (
            <Button 
              onClick={handleSendOtp} 
              disabled={loading}
              className="w-full"
            >
              {loading ? `${t('common.loading')}` : 'Send OTP'}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                />
                {generatedOtp && (
                  <p className="text-sm text-muted-foreground">
                    Test OTP: {generatedOtp}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleVerifyOtp} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => setOtpSent(false)}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.dontHaveAccount')}{' '}
              <Button variant="link" onClick={() => navigate('/register')} className="p-0">
                {t('common.register')}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};