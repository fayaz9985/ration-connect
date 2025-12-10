import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpCircle, RefreshCw, ArrowRight, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';
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

export const SellConvertPage = () => {
  const [quantity, setQuantity] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [convertTo, setConvertTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [hasClaimedThisMonth, setHasClaimedThisMonth] = useState<boolean | null>(null);
  const [checkingClaim, setCheckingClaim] = useState(true);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  const ricePrice = 20;
  const quotaPerMember = 6; // 6 kg per family member

  const conversionRates: ConversionRate[] = [
    { from: 'Rice', to: 'Wheat', rate: 0.8, description: '1 kg Rice = 0.8 kg Wheat' },
    { from: 'Rice', to: 'Sugar', rate: 0.3, description: '1 kg Rice = 0.3 kg Sugar' },
    { from: 'Rice', to: 'Oil', rate: 0.1, description: '1 kg Rice = 0.1 L Oil' },
  ];

  const monthlyQuota = profile ? profile.family_members * quotaPerMember : 0;

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
    const checkMonthlyRiceClaim = async () => {
      if (!profile) {
        setCheckingClaim(false);
        return;
      }

      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const { data, error } = await supabase
          .from('rice_claims')
          .select('id')
          .eq('profile_id', profile.id)
          .gte('claimed_at', startOfMonth.toISOString())
          .lte('claimed_at', endOfMonth.toISOString())
          .limit(1);

        if (error) {
          console.error('Error checking rice claim:', error);
          setHasClaimedThisMonth(false);
          return;
        }

        setHasClaimedThisMonth(data && data.length > 0);
      } catch (error) {
        console.error('Error checking rice claim:', error);
        setHasClaimedThisMonth(false);
      } finally {
        setCheckingClaim(false);
      }
    };

    checkMonthlyRiceClaim();
  }, [profile]);

  const handleSellRice = async () => {
    if (!quantity || !selectedShop) {
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

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0 || isNaN(quantityNum)) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (quantityNum > monthlyQuota) {
      toast({
        title: "Exceeds Quota",
        description: `You can only sell up to ${monthlyQuota} kg (your monthly quota)`,
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

      // Mark as claimed by creating a rice_claim record with status 'sold'
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

      setQuantity('');
      setSelectedShop('');
      setHasClaimedThisMonth(true);
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
    if (!quantity || !convertTo) {
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

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (quantityNum > monthlyQuota) {
      toast({
        title: "Exceeds Quota",
        description: `You can only convert up to ${monthlyQuota} kg (your monthly quota)`,
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

      // Mark as claimed by creating a rice_claim record with status 'converted'
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

      setQuantity('');
      setConvertTo('');
      setHasClaimedThisMonth(true);
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
    const quantityNum = parseInt(quantity) || 0;
    return quantityNum * ricePrice;
  };

  const getConvertedQuantity = () => {
    const quantityNum = parseInt(quantity) || 0;
    const conversionRate = conversionRates.find(rate => rate.to === convertTo);
    if (!conversionRate) return 0;
    return Math.floor(quantityNum * conversionRate.rate * 100) / 100;
  };

  const getSelectedConversionRate = () => {
    return conversionRates.find(rate => rate.to === convertTo);
  };

  if (checkingClaim) {
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
            <p className="text-muted-foreground">Choose to sell or convert your monthly quota rice</p>
          </div>
        </div>

        {/* Quota Info Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Monthly Rice Quota</p>
                <p className="text-2xl font-bold text-primary">{monthlyQuota} kg</p>
                <p className="text-xs text-muted-foreground">
                  ({profile.family_members} family members × {quotaPerMember} kg)
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${hasClaimedThisMonth ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                {hasClaimedThisMonth ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Already Used</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Available</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {hasClaimedThisMonth ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Quota Already Used This Month</AlertTitle>
            <AlertDescription>
              You have already claimed, sold, or converted your rice quota for this month. 
              You can sell or convert rice again next month when your quota resets.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="sell" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sell" className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Sell Rice
              </TabsTrigger>
              <TabsTrigger value="convert" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Convert Rice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sell">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Sell Your Quota Rice</CardTitle>
                    <CardDescription>
                      Sell up to {monthlyQuota} kg of your monthly quota
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="sell-quantity">Quantity (kg) *</Label>
                      <Input
                        id="sell-quantity"
                        type="number"
                        placeholder={`Enter quantity (max ${monthlyQuota} kg)`}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        max={monthlyQuota}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum: {monthlyQuota} kg (your monthly quota)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shop">Preferred Shop *</Label>
                      <Select onValueChange={setSelectedShop} disabled={shopsLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder={shopsLoading ? "Loading shops..." : "Select a ration shop"} />
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

                    {quantity && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total Amount:</span>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            <span className="text-lg font-bold">{calculateAmount()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Rate: ₹{ricePrice} per kg
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={handleSellRice} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Processing...' : 'Sell Rice'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Selling Information</CardTitle>
                    <CardDescription>
                      Important details about rice selling
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">Current Rate:</span>
                      <span className="font-bold text-primary">₹{ricePrice}/kg</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Terms & Conditions:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Only monthly quota rice can be sold</li>
                        <li>• Once sold, quota is marked as used for this month</li>
                        <li>• Payment credited within 3-5 working days</li>
                        <li>• Selling is subject to government policies</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="convert">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Convert Your Quota Rice</CardTitle>
                    <CardDescription>
                      Convert up to {monthlyQuota} kg into other items
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="convert-quantity">Rice Quantity (kg) *</Label>
                      <Input
                        id="convert-quantity"
                        type="number"
                        placeholder={`Enter quantity (max ${monthlyQuota} kg)`}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        max={monthlyQuota}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum: {monthlyQuota} kg (your monthly quota)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="convert-to">Convert To *</Label>
                      <Select onValueChange={setConvertTo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item to convert to" />
                        </SelectTrigger>
                        <SelectContent>
                          {conversionRates.map((rate) => (
                            <SelectItem key={rate.to} value={rate.to}>
                              {rate.to}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {quantity && convertTo && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center space-x-4 mb-3">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Rice</p>
                            <p className="text-lg font-bold">{quantity} kg</p>
                          </div>
                          <ArrowRight className="h-6 w-6 text-primary" />
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">{convertTo}</p>
                            <p className="text-lg font-bold">
                              {getConvertedQuantity()} {convertTo === 'Oil' ? 'L' : 'kg'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          {getSelectedConversionRate()?.description}
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={handleConvert} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Converting...' : 'Convert Items'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Rates</CardTitle>
                    <CardDescription>
                      Government approved conversion rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {conversionRates.map((rate, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border ${
                          convertTo === rate.to ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{rate.from} → {rate.to}</span>
                          <span className="text-sm font-mono">1:{rate.rate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{rate.description}</p>
                      </div>
                    ))}

                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">Important Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Only monthly quota rice can be converted</li>
                        <li>• Once converted, quota is marked as used</li>
                        <li>• Delivery within 1-3 working days</li>
                        <li>• Conversion is irreversible</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
