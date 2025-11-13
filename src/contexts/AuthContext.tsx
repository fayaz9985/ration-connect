import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  phone_number: string;
  ration_card_no: string;
  card_type: 'apl' | 'bpl' | 'aay' | 'priority';
  name: string;
  address?: string;
  family_members: number;
}

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  sendOtp: (phoneNumber: string) => Promise<{ success: boolean; error?: string; otp?: string }>;
  verifyOtp: (phoneNumber: string, otpCode: string) => Promise<{ success: boolean; error?: string; isRegistered?: boolean }>;
  register: (data: Omit<Profile, 'id'>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedProfile = localStorage.getItem('rationProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    setLoading(false);
  }, []);

  const sendOtp = async (phoneNumber: string): Promise<{ success: boolean; error?: string; otp?: string }> => {
    try {
      const normalized = phoneNumber.trim();
      if (!/^[6-9]\d{9}$/.test(normalized)) {
        return { success: false, error: 'Invalid phone number. Enter 10 digits starting 6-9.' };
      }

      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone_number: normalized }
      });

      if (error) {
        return { success: false, error: (data as any)?.error || (error as any)?.message };
      }

      return { success: true, otp: (data as any)?.otp };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (phoneNumber: string, otpCode: string): Promise<{ success: boolean; error?: string; isRegistered?: boolean }> => {
    try {
      const normalized = phoneNumber.trim();
      if (!/^[6-9]\d{9}$/.test(normalized)) {
        return { success: false, error: 'Invalid phone number. Enter 10 digits starting 6-9.' };
      }
      if (!/^\d{6}$/.test(otpCode.trim())) {
        return { success: false, error: 'Invalid OTP. Enter the 6-digit code.' };
      }

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone_number: normalized, otp_code: otpCode.trim() }
      });

      if (error) {
        return { success: false, error: (data as any)?.error || (error as any)?.message };
      }

      if (data?.is_registered && data?.profile) {
        const profile = {
          ...data.profile,
          card_type: data.profile.card_type as 'apl' | 'bpl' | 'aay' | 'priority'
        };
        setProfile(profile);
        localStorage.setItem('rationProfile', JSON.stringify(profile));
      }

      return { success: true, isRegistered: data?.is_registered };
    } catch (error) {
      return { success: false, error: 'Failed to verify OTP' };
    }
  };

  const register = async (data: Omit<Profile, 'id'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const payload = {
        ...data,
        phone_number: data.phone_number.trim(),
        name: data.name.trim(),
        ration_card_no: data.ration_card_no.trim(),
        card_type: (data.card_type as string).toLowerCase() as 'apl' | 'bpl' | 'aay' | 'priority',
        address: data.address?.toString().trim() || null,
        family_members: Number(data.family_members),
      };

      const { data: resp, error } = await supabase.functions.invoke('register-profile', {
        body: payload
      });

      if (error) {
        return { success: false, error: (resp as any)?.error || (error as any)?.message };
      }

      const newProfile = (resp as any)?.profile;
      if (!newProfile) {
        return { success: false, error: (resp as any)?.error || 'Registration failed' };
      }

      const profile = {
        ...newProfile,
        card_type: newProfile.card_type as 'apl' | 'bpl' | 'aay' | 'priority'
      };
      setProfile(profile);
      localStorage.setItem('rationProfile', JSON.stringify(profile));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to register' };
    }
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('rationProfile');
    window.location.href = '/';
  };

  const value = {
    profile,
    loading,
    sendOtp,
    verifyOtp,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};