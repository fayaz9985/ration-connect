import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpCircle, IndianRupee } from 'lucide-react';

export const SellPage = () => {
  const [quantity, setQuantity] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  const shops = [
    { id: '1', name: 'Central Ration Shop' },
    { id: '2', name: 'North District Shop' },
    { id: '3', name: 'South Central Shop' },
  ];

  const ricePrice = 20; // Price per kg

  const handleSellRice = async () => {
    if (!quantity || !selectedShop) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
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

    setLoading(true);

    try {
      // Get the shop details first
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .limit(1)
        .single();

      if (shopError) throw shopError;

      // Create sell transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          profile_id: profile!.id,
          shop_id: shopData.id,
          item: 'Rice',
          quantity: quantityNum,
          type: 'sell',
        }]);

      if (transactionError) throw transactionError;

      // Update rice stock (add the sold rice back to stock)
      const { data: existingStock } = await supabase
        .from('ration_stock')
        .select('quantity')
        .eq('shop_id', shopData.id)
        .eq('item', 'Rice')
        .single();

      if (existingStock) {
        await supabase
          .from('ration_stock')
          .update({ quantity: existingStock.quantity + quantityNum })
          .eq('shop_id', shopData.id)
          .eq('item', 'Rice');
      } else {
        await supabase
          .from('ration_stock')
          .insert([{
            shop_id: shopData.id,
            item: 'Rice',
            quantity: quantityNum,
          }]);
      }

      const totalAmount = quantityNum * ricePrice;
      
      toast({
        title: "Rice Sold Successfully",
        description: `Sold ${quantityNum} kg rice for ₹${totalAmount}. Amount will be credited to your account.`,
      });

      setQuantity('');
      setSelectedShop('');
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to sell rice. Please try again.",
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <ArrowUpCircle className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sell Rice</h1>
            <p className="text-muted-foreground">Sell your unwanted rice back to the government</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sell Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sell Rice</CardTitle>
              <CardDescription>
                Enter the quantity of rice you want to sell
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity in kg"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop">Preferred Shop *</Label>
                <Select onValueChange={setSelectedShop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ration shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
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

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Selling Information</CardTitle>
              <CardDescription>
                Important details about rice selling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Current Rate:</span>
                  <span className="font-bold text-primary">₹{ricePrice}/kg</span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Terms & Conditions:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Rice must be in good condition</li>
                    <li>• Minimum selling quantity: 1 kg</li>
                    <li>• Payment will be credited within 3-5 working days</li>
                    <li>• Government reserves the right to inspect the rice quality</li>
                    <li>• Selling is subject to current government policies</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Required Documents:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Valid Ration Card</li>
                    <li>• Identity Proof</li>
                    <li>• Bank Account Details</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};