import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Package2, Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface QuotaUsage {
  sold: number;
  converted: number;
  claimed: number;
}

export const GetRicePage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [quotaUsage, setQuotaUsage] = useState<QuotaUsage>({ sold: 0, converted: 0, claimed: 0 });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const quotaPerMember = 6;
  const monthlyQuota = profile ? profile.family_members * quotaPerMember : 0;
  const usedQuota = quotaUsage.sold + quotaUsage.converted + quotaUsage.claimed;
  const remainingQuota = Math.max(0, monthlyQuota - usedQuota);
  const hasSoldOrConverted = quotaUsage.sold > 0 || quotaUsage.converted > 0;
  const hasClaimedRice = quotaUsage.claimed > 0;

  useEffect(() => {
    checkQuotaUsage();
  }, [profile]);

  const checkQuotaUsage = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from('rice_claims')
        .select('quantity_kg, status')
        .eq('profile_id', profile.id)
        .gte('claimed_at', startOfMonth.toISOString())
        .lte('claimed_at', endOfMonth.toISOString());

      if (error) throw error;

      const usage: QuotaUsage = { sold: 0, converted: 0, claimed: 0 };
      
      data?.forEach((claim) => {
        if (claim.status === 'sold') {
          usage.sold += claim.quantity_kg;
        } else if (claim.status === 'converted') {
          usage.converted += claim.quantity_kg;
        } else {
          usage.claimed += claim.quantity_kg;
        }
      });

      setQuotaUsage(usage);
    } catch (error) {
      console.error('Error checking quota usage:', error);
      toast({
        title: "Error",
        description: "Failed to check rice claim status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const claimRice = async (deliveryMethod: 'pay_now' | 'cash_on_delivery') => {
    if (!profile) return;
    
    setClaiming(true);
    try {
      const { error } = await supabase
        .from('rice_claims')
        .insert({
          profile_id: profile.id,
          quantity_kg: remainingQuota,
          delivery_method: deliveryMethod,
          status: 'out_for_delivery'
        });

      if (error) throw error;
      
      setQuotaUsage(prev => ({ ...prev, claimed: prev.claimed + remainingQuota }));
      
      if (deliveryMethod === 'pay_now') {
        toast({
          title: "Payment Confirmed! 🍚",
          description: `Your ${remainingQuota} kg rice is out for delivery. It will arrive within 0.5–2 days.`,
          duration: 5000
        });
      } else {
        toast({
          title: "Order Confirmed! 📦",
          description: `Your ${remainingQuota} kg rice is scheduled for delivery. Please pay at the time of delivery.`,
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold text-foreground">{profile.family_members}</div>
                <div className="text-xs text-muted-foreground">Family Members</div>
              </div>
              
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <Package2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold text-foreground">{monthlyQuota} kg</div>
                <div className="text-xs text-muted-foreground">Total Quota</div>
              </div>
              
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold text-primary">{remainingQuota} kg</div>
                <div className="text-xs text-muted-foreground">Available to Claim</div>
              </div>
              
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold text-foreground">Once</div>
                <div className="text-xs text-muted-foreground">Per Month</div>
              </div>
            </div>

            {(quotaUsage.sold > 0 || quotaUsage.converted > 0) && (
              <Alert className="border-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This month: Sold {quotaUsage.sold} kg, Converted {quotaUsage.converted} kg
                  {quotaUsage.claimed > 0 && `, Claimed ${quotaUsage.claimed} kg`}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Claim Status */}
        {hasClaimedRice && remainingQuota === 0 ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                Quota Fully Used This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                You have claimed all {quotaUsage.claimed} kg of your rice quota for this month. 
                Your quota will reset next month.
              </p>
            </CardContent>
          </Card>
        ) : hasSoldOrConverted && remainingQuota === 0 ? (
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                No Rice Available to Claim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                You have sold or converted your entire quota this month. 
                No rice is available for delivery. Your quota will reset next month.
              </p>
            </CardContent>
          </Card>
        ) : remainingQuota > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Claim Your Rice</CardTitle>
              <CardDescription>
                {hasSoldOrConverted 
                  ? `You have ${remainingQuota} kg remaining after selling/converting. Claim it now!`
                  : 'Choose your preferred delivery method'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-primary/20 bg-primary/5">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You can claim <strong>{remainingQuota} kg</strong> of rice
                  {hasSoldOrConverted && ' (remaining after sell/convert)'}
                </AlertDescription>
              </Alert>

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
                        Do you want to confirm your payment for {remainingQuota} kg rice delivery?
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
        ) : null}

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
              • You can split your quota: claim some as rice, sell some, or convert some
            </div>
            <div className="text-sm text-muted-foreground">
              • Once you claim rice for delivery, the remaining quota cannot be sold/converted
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
