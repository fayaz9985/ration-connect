import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const RegisterPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    ration_card_no: '',
    card_type: '',
    address: '',
    family_members: 4,
  });

  const { sendOtp, verifyOtp, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.phoneNumber) {
      setPhoneNumber(location.state.phoneNumber);
      setOtpVerified(true);
    }
  }, [location.state]);

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
      // Only show OTP in development mode
      if (import.meta.env.DEV && result.otp) {
        setGeneratedOtp(result.otp);
      }
      toast({
        title: "OTP Sent",
        description: import.meta.env.DEV && result.otp 
          ? `OTP: ${result.otp} (Development mode only)` 
          : "Please check your phone for the OTP",
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
          title: "Error",
          description: "User already registered. Please login instead.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        setOtpVerified(true);
        toast({
          title: "Success",
          description: "OTP verified! Please complete your registration.",
        });
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

  const handleRegister = async () => {
    if (!formData.name || !formData.ration_card_no || !formData.card_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await register({
      phone_number: phoneNumber,
      ...formData,
      card_type: formData.card_type as 'apl' | 'bpl' | 'aay' | 'priority',
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Registration completed successfully!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Error",
        description: result.error || "Registration failed",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (otpVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete Registration</CardTitle>
            <CardDescription>
              Fill in your details to complete registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ration_card">Ration Card Number *</Label>
              <Input
                id="ration_card"
                value={formData.ration_card_no}
                onChange={(e) => setFormData({ ...formData, ration_card_no: e.target.value })}
                placeholder="Enter ration card number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card_type">Card Type *</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, card_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apl">APL (Above Poverty Line)</SelectItem>
                  <SelectItem value="bpl">BPL (Below Poverty Line)</SelectItem>
                  <SelectItem value="aay">AAY (Antyodaya Anna Yojana)</SelectItem>
                  <SelectItem value="priority">Priority Household</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_members">Number of Family Members *</Label>
              <Input
                id="family_members"
                type="number"
                value={formData.family_members}
                onChange={(e) => setFormData({ ...formData, family_members: parseInt(e.target.value) || 1 })}
                placeholder="Enter number of family members"
                min="1"
                max="20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
              />
            </div>

            <Button 
              onClick={handleRegister} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" onClick={() => navigate('/login')} className="p-0">
                  Login here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register for E-Ration Portal</CardTitle>
          <CardDescription>
            Enter your mobile number to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
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
              {loading ? 'Sending...' : 'Send OTP'}
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
              Already have an account?{' '}
              <Button variant="link" onClick={() => navigate('/login')} className="p-0">
                Login here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};