import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  description: string;
}

export const ConvertPage = () => {
  const [riceQuantity, setRiceQuantity] = useState('');
  const [convertTo, setConvertTo] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  const conversionRates: ConversionRate[] = [
    { from: 'Rice', to: 'Wheat', rate: 0.8, description: '1 kg Rice = 0.8 kg Wheat' },
    { from: 'Rice', to: 'Sugar', rate: 0.3, description: '1 kg Rice = 0.3 kg Sugar' },
    { from: 'Rice', to: 'Oil', rate: 0.1, description: '1 kg Rice = 0.1 L Oil' },
  ];

  const handleConvert = async () => {
    if (!riceQuantity || !convertTo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(riceQuantity);
    if (quantityNum <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
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
      // Get the first shop for the transaction
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .limit(1)
        .single();

      if (shopError) throw shopError;

      const convertedQuantity = Math.floor(quantityNum * conversionRate.rate * 100) / 100;

      // Create conversion transaction with delivery tracking
      const currentDate = new Date();
      const estimatedDeliveryDate = new Date(currentDate);
      estimatedDeliveryDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 3) + 1); // 1-3 days for conversions

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([{
            profile_id: profile!.id,
            shop_id: shopData.id,
            item: `${quantityNum}kg Rice → ${convertedQuantity}kg ${convertTo}`,
            quantity: quantityNum,
            type: 'convert',
            delivery_status: 'confirmed',
            estimated_delivery_date: format(estimatedDeliveryDate, 'yyyy-MM-dd'),
            delivery_address: profile?.address || 'Address not provided'
          }]);

        if (transactionError) throw transactionError;

      // Update rice stock (remove converted rice)
      const { data: riceStock } = await supabase
        .from('ration_stock')
        .select('quantity')
        .eq('shop_id', shopData.id)
        .eq('item', 'Rice')
        .single();

      if (riceStock && riceStock.quantity >= quantityNum) {
        await supabase
          .from('ration_stock')
          .update({ quantity: riceStock.quantity - quantityNum })
          .eq('shop_id', shopData.id)
          .eq('item', 'Rice');
      }

      // Update target item stock (add converted quantity)
      const { data: targetStock } = await supabase
        .from('ration_stock')
        .select('quantity')
        .eq('shop_id', shopData.id)
        .eq('item', convertTo)
        .single();

      if (targetStock) {
        await supabase
          .from('ration_stock')
          .update({ quantity: targetStock.quantity + convertedQuantity })
          .eq('shop_id', shopData.id)
          .eq('item', convertTo);
      } else {
        await supabase
          .from('ration_stock')
          .insert([{
            shop_id: shopData.id,
            item: convertTo,
            quantity: convertedQuantity,
          }]);
      }

      toast({
        title: "Conversion Successful",
        description: `Your rice is being converted into ${convertTo}. Delivery will arrive within 1–3 days depending on distance.`,
      });

      setRiceQuantity('');
      setConvertTo('');
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Failed to convert items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConvertedQuantity = () => {
    const quantityNum = parseInt(riceQuantity) || 0;
    const conversionRate = conversionRates.find(rate => rate.to === convertTo);
    if (!conversionRate) return 0;
    return Math.floor(quantityNum * conversionRate.rate * 100) / 100;
  };

  const getSelectedConversionRate = () => {
    return conversionRates.find(rate => rate.to === convertTo);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <RefreshCw className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Convert Items</h1>
            <p className="text-muted-foreground">Convert rice into other grocery items</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conversion Form */}
          <Card>
            <CardHeader>
              <CardTitle>Item Conversion</CardTitle>
              <CardDescription>
                Convert your rice allocation to other items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rice-quantity">Rice Quantity (kg) *</Label>
                <Input
                  id="rice-quantity"
                  type="number"
                  placeholder="Enter rice quantity in kg"
                  value={riceQuantity}
                  onChange={(e) => setRiceQuantity(e.target.value)}
                  min="1"
                />
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

              {riceQuantity && convertTo && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center space-x-4 mb-3">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rice</p>
                      <p className="text-lg font-bold">{riceQuantity} kg</p>
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

          {/* Conversion Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates</CardTitle>
              <CardDescription>
                Current government approved conversion rates
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

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2">Important Notes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Conversion rates are set by government policy</li>
                  <li>• Minimum conversion quantity: 1 kg</li>
                  <li>• Converted items will be available for pickup</li>
                  <li>• Conversion is irreversible once processed</li>
                  <li>• Processing time: 1-2 working days</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};