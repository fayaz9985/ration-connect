import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpCircle, RefreshCw, ArrowRight, IndianRupee, AlertCircle, CheckCircle2, Package2 } from 'lucide-react';
import { format } from 'date-fns';

interface Shop {
  id: string;
  shop_name: string;
}

interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  description: string;
}

interface QuotaUsage {
  sold: number;
  converted: number;
  claimed: number;
}

export const SellConvertPage = () => {
  const [sellQuantity, setSellQuantity] = useState('');
  const [convertQuantity, setConvertQuantity] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [convertTo, setConvertTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [quotaUsage, setQuotaUsage] = useState<QuotaUsage>({ sold: 0, converted: 0, claimed: 0 });
  const [checkingQuota, setCheckingQuota] = useState(true);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  const ricePrice = 20;
  const quotaPerMember = 6;

  const conversionRates: ConversionRate[] = [
    { from: 'Rice', to: 'Wheat', rate: 0.8, description: '1 kg Rice = 0.8 kg Wheat' },
    { from: 'Rice', to: 'Sugar', rate: 0.3, description: '1 kg Rice = 0.3 kg Sugar' },
    { from: 'Rice', to: 'Oil', rate: 0.1, description: '1 kg Rice = 0.1 L Oil' },
  ];

  const monthlyQuota = profile ? profile.family_members * quotaPerMember : 0;
  const usedQuota = quotaUsage.sold + quotaUsage.converted + quotaUsage.claimed;
  const remainingQuota = Math.max(0, monthlyQuota - usedQuota);
  const hasClaimedRice = quotaUsage.claimed > 0;

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('id, shop_name');

        if (error) {
          console.error('Error fetching shops:', error);
          return;
        }

        setShops(data || []);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setShopsLoading(false);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    const checkQuotaUsage = async () => {
      if (!profile) {
        setCheckingQuota(false);
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

        if (error) {
          console.error('Error checking quota usage:', error);
          return;
        }

        const usage: QuotaUsage = { sold: 0, converted: 0, claimed: 0 };
        
        data?.forEach((claim) => {
          if (claim.status === 'sold') {
            usage.sold += claim.quantity_kg;
          } else if (claim.status === 'converted') {
            usage.converted += claim.quantity_kg;
          } else {
            // All other statuses (confirmed, out_for_delivery, delivered) count as claimed
            usage.claimed += claim.quantity_kg;
          }
        });

        setQuotaUsage(usage);
      } catch (error) {
        console.error('Error checking quota usage:', error);
      } finally {
        setCheckingQuota(false);
      }
    };

    checkQuotaUsage();
  }, [profile]);

  const handleSellRice = async () => {
    if (!sellQuantity || !selectedShop) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Authentication Error",
        description: "Please log in to sell rice",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(sellQuantity);
    if (quantityNum <= 0 || isNaN(quantityNum)) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (quantityNum > remainingQuota) {
      toast({
        title: "Exceeds Available Quota",
        description: `You can only sell up to ${remainingQuota} kg (remaining quota)`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create sell transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          profile_id: profile.id,
          shop_id: selectedShop,
          item: 'Rice',
          quantity: quantityNum,
          type: 'sell',
        }]);

      if (transactionError) throw transactionError;

      // Update rice stock
      const { data: existingStock, error: stockCheckError } = await supabase
        .from('ration_stock')
        .select('id, quantity')
        .eq('shop_id', selectedShop)
        .eq('item', 'Rice')
        .maybeSingle();

      if (stockCheckError) throw stockCheckError;

      if (existingStock) {
        const { error: updateError } = await supabase
          .from('ration_stock')
          .update({ quantity: existingStock.quantity + quantityNum })
          .eq('id', existingStock.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('ration_stock')
          .insert([{
            shop_id: selectedShop,
            item: 'Rice',
            quantity: quantityNum,
          }]);

        if (insertError) throw insertError;
      }

      // Record the sold rice in rice_claims
      const { error: claimError } = await supabase
        .from('rice_claims')
        .insert([{
          profile_id: profile.id,
          quantity_kg: quantityNum,
          delivery_method: 'sold',
          status: 'sold',
        }]);

      if (claimError) throw claimError;

      const totalAmount = quantityNum * ricePrice;
      
      toast({
        title: "Rice Sold Successfully",
        description: `Your account is credited with ₹${totalAmount} for selling ${quantityNum} kg Rice.`,
      });

      setSellQuantity('');
      setSelectedShop('');
      setQuotaUsage(prev => ({ ...prev, sold: prev.sold + quantityNum }));
    } catch (error: any) {
      console.error('Sell error:', error);
      toast({
        title: "Transaction Failed",
        description: error?.message || "Failed to sell rice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!convertQuantity || !convertTo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Authentication Error",
        description: "Please log in to convert rice",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(convertQuantity);
    if (quantityNum <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (quantityNum > remainingQuota) {
      toast({
        title: "Exceeds Available Quota",
        description: `You can only convert up to ${remainingQuota} kg (remaining quota)`,
        variant: "destructive",
      });
      return;
    }

    const conversionRate = conversionRates.find(rate => rate.to === convertTo);
    if (!conversionRate) {
      toast({
        title: "Invalid Conversion",
        description: "Selected conversion option is not available",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (shopError || !shopData) throw shopError || new Error('No shop found');

      const convertedQuantity = Math.floor(quantityNum * conversionRate.rate * 100) / 100;

      const currentDate = new Date();
      const estimatedDeliveryDate = new Date(currentDate);
      estimatedDeliveryDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 3) + 1);

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          profile_id: profile.id,
          shop_id: shopData.id,
          item: `${quantityNum}kg Rice → ${convertedQuantity}kg ${convertTo}`,
          quantity: quantityNum,
          type: 'convert',
          delivery_status: 'confirmed',
          estimated_delivery_date: format(estimatedDeliveryDate, 'yyyy-MM-dd'),
          delivery_address: profile?.address || 'Address not provided'
        }]);

      if (transactionError) throw transactionError;

      // Record the converted rice in rice_claims
      const { error: claimError } = await supabase
        .from('rice_claims')
        .insert([{
          profile_id: profile.id,
          quantity_kg: quantityNum,
          delivery_method: 'converted',
          status: 'converted',
        }]);

      if (claimError) throw claimError;

      toast({
        title: "Conversion Successful",
        description: `Your ${quantityNum}kg rice is being converted to ${convertedQuantity}${convertTo === 'Oil' ? 'L' : 'kg'} ${convertTo}. Delivery within 1–3 days.`,
      });

      setConvertQuantity('');
      setConvertTo('');
      setQuotaUsage(prev => ({ ...prev, converted: prev.converted + quantityNum }));
    } catch (error: any) {
      console.error('Convert error:', error);
      toast({
        title: "Conversion Failed",
        description: error?.message || "Failed to convert items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = () => {
    const quantityNum = parseInt(sellQuantity) || 0;
    return quantityNum * ricePrice;
  };

  const getConvertedQuantity = () => {
    const quantityNum = parseInt(convertQuantity) || 0;
    const conversionRate = conversionRates.find(rate => rate.to === convertTo);
    if (!conversionRate) return 0;
    return Math.floor(quantityNum * conversionRate.rate * 100) / 100;
  };

  const getSelectedConversionRate = () => {
    return conversionRates.find(rate => rate.to === convertTo);
  };

  if (checkingQuota) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking quota status...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Logged In</AlertTitle>
            <AlertDescription>
              Please log in to sell or convert your rice quota.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <RefreshCw className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sell or Convert Rice</h1>
            <p className="text-muted-foreground">Split your quota: sell some, convert some</p>
          </div>
        </div>

        {/* Quota Info Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Quota</p>
                <p className="text-xl font-bold text-primary">{monthlyQuota} kg</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-xl font-bold text-primary">{remainingQuota} kg</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Sold</p>
                <p className="text-xl font-bold text-foreground">{quotaUsage.sold} kg</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Converted</p>
                <p className="text-xl font-bold text-foreground">{quotaUsage.converted} kg</p>
              </div>
            </div>
            {quotaUsage.claimed > 0 && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-center">
                <p className="text-sm text-destructive">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  You have already claimed {quotaUsage.claimed} kg as rice delivery
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {hasClaimedRice ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cannot Sell or Convert</AlertTitle>
            <AlertDescription>
              You have already claimed {quotaUsage.claimed} kg rice for delivery this month. 
              Once you claim rice for delivery, you cannot sell or convert it. 
              You can use this feature next month before claiming your quota.
            </AlertDescription>
          </Alert>
        ) : remainingQuota === 0 ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Quota Fully Used</AlertTitle>
            <AlertDescription>
              You have used your entire monthly quota. 
              Sold: {quotaUsage.sold} kg, Converted: {quotaUsage.converted} kg.
              Your quota will reset next month.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sell Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-primary" />
                  Sell Rice for Money
                </CardTitle>
                <CardDescription>
                  Get ₹{ricePrice}/kg for your quota rice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sell-quantity">Quantity (kg)</Label>
                  <Input
                    id="sell-quantity"
                    type="number"
                    placeholder={`Max ${remainingQuota} kg`}
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(e.target.value)}
                    min="1"
                    max={remainingQuota}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shop">Preferred Shop</Label>
                  <Select onValueChange={setSelectedShop} disabled={shopsLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={shopsLoading ? "Loading..." : "Select shop"} />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.shop_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {sellQuantity && parseInt(sellQuantity) > 0 && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">You'll receive:</span>
                      <div className="flex items-center font-bold text-primary">
                        <IndianRupee className="h-4 w-4" />
                        {calculateAmount()}
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSellRice} 
                  disabled={loading || !sellQuantity || !selectedShop}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Sell Rice'}
                </Button>
              </CardContent>
            </Card>

            {/* Convert Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Convert to Groceries
                </CardTitle>
                <CardDescription>
                  Exchange rice for wheat, sugar, or oil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="convert-quantity">Quantity (kg)</Label>
                  <Input
                    id="convert-quantity"
                    type="number"
                    placeholder={`Max ${remainingQuota} kg`}
                    value={convertQuantity}
                    onChange={(e) => setConvertQuantity(e.target.value)}
                    min="1"
                    max={remainingQuota}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="convert-to">Convert To</Label>
                  <Select onValueChange={setConvertTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {conversionRates.map((rate) => (
                        <SelectItem key={rate.to} value={rate.to}>
                          {rate.to} ({rate.description})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {convertQuantity && convertTo && parseInt(convertQuantity) > 0 && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-medium">{convertQuantity} kg Rice</span>
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-bold text-primary">
                        {getConvertedQuantity()} {convertTo === 'Oil' ? 'L' : 'kg'} {convertTo}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleConvert} 
                  disabled={loading || !convertQuantity || !convertTo}
                  className="w-full"
                >
                  {loading ? 'Converting...' : 'Convert Rice'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• You can split your {monthlyQuota} kg quota: sell some and convert some</li>
              <li>• Once you sell or convert any amount, you cannot claim that portion as rice delivery</li>
              <li>• If you claim rice for delivery first, sell/convert options are disabled</li>
              <li>• Quota resets at the beginning of each month</li>
              <li>• Sell rate: ₹{ricePrice} per kg | Conversion rates vary by item</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
