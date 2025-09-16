import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Package2, Calendar, Users, CheckCircle } from 'lucide-react';

export const GetRicePage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [hasClaimedThisMonth, setHasClaimedThisMonth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    checkMonthlyRiceClaim();
  }, [profile]);

  const checkMonthlyRiceClaim = async () => {
    if (!profile) return;
    
    try {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
      
      const { data, error } = await supabase
        .from('rice_claims')
        .select('id')
        .eq('profile_id', profile.id)
        .gte('claimed_at', `${currentMonth}-01`)
        .lt('claimed_at', `${currentMonth}-32`);

      if (error) throw error;
      
      setHasClaimedThisMonth(data && data.length > 0);
    } catch (error) {
      console.error('Error checking rice claim:', error);
      toast({
        title: "Error",
        description: "Failed to check rice claim status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateQuota = () => {
    return (profile?.family_members || 4) * 6; // 6kg per family member
  };

  const claimRice = async (deliveryMethod: 'pay_now' | 'cash_on_delivery') => {
    if (!profile) return;
    
    setClaiming(true);
    try {
      const quantity = calculateQuota();
      
      const { error } = await supabase
        .from('rice_claims')
        .insert({
          profile_id: profile.id,
          quantity_kg: quantity,
          delivery_method: deliveryMethod,
          status: 'out_for_delivery'
        });

      if (error) throw error;
      
      setHasClaimedThisMonth(true);
      
      if (deliveryMethod === 'pay_now') {
        toast({
          title: "Payment Confirmed! 🍚",
          description: "Your rice is out for delivery. It will arrive within 0.5–2 days depending on distance.",
          duration: 5000
        });
      } else {
        toast({
          title: "Order Confirmed! 📦",
          description: "Your rice is scheduled for delivery. Please pay at the time of delivery.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error claiming rice:', error);
      toast({
        title: "Error",
        description: "Failed to claim rice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>Please log in to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const quota = calculateQuota();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Get Your Free Rice from Government</h1>
          <p className="text-muted-foreground">Telangana Government PDS Rice Allocation</p>
        </div>

        {/* Quota Information */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Package2 className="h-5 w-5" />
              Your Monthly Rice Quota
            </CardTitle>
            <CardDescription>Based on your family size</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-foreground">{profile.family_members}</div>
                <div className="text-sm text-muted-foreground">Family Members</div>
              </div>
              
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <Package2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-foreground">{quota} KG</div>
                <div className="text-sm text-muted-foreground">Monthly Quota</div>
              </div>
              
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-foreground">Once</div>
                <div className="text-sm text-muted-foreground">Per Month</div>
              </div>
            </div>
            
            <Alert className="border-primary/20 bg-primary/5">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You are entitled to <strong>{quota}kg</strong> of free rice this month 
                ({profile.family_members} family members × 6kg each)
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Claim Status */}
        {hasClaimedThisMonth ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                Already Claimed This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                You have already claimed your rice quota for this month. 
                You can claim again next month.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Claim Your Rice</CardTitle>
              <CardDescription>
                Choose your preferred delivery method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pay Now Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="h-auto p-6 flex-col gap-2" 
                      variant="default"
                      disabled={claiming}
                    >
                      <div className="text-lg font-semibold">Pay Now</div>
                      <div className="text-sm opacity-90">Immediate processing</div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Do you want to confirm your payment for {quota}kg rice delivery?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => claimRice('pay_now')}
                        disabled={claiming}
                      >
                        {claiming ? 'Processing...' : 'Confirm Payment'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Cash on Delivery Button */}
                <Button 
                  variant="outline" 
                  className="h-auto p-6 flex-col gap-2 border-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => claimRice('cash_on_delivery')}
                  disabled={claiming}
                >
                  <div className="text-lg font-semibold">Cash on Delivery</div>
                  <div className="text-sm">Pay when rice arrives</div>
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                Delivery typically takes 0.5–2 days depending on your location
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              • Rice allocation is provided by the Government of Telangana under the PDS scheme
            </div>
            <div className="text-sm text-muted-foreground">
              • Each family member is entitled to 6kg of rice per month
            </div>
            <div className="text-sm text-muted-foreground">
              • Rice can only be claimed once per calendar month
            </div>
            <div className="text-sm text-muted-foreground">
              • Delivery charges may apply based on your location
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};