import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, CreditCard, Truck, ArrowLeft } from 'lucide-react';

interface CartItem {
  id: string;
  item: string;
  quantity: number;
  shop_name: string;
  shop_id: string;
  requestedQuantity: number;
}

// Item prices (in rupees per kg)
const ITEM_PRICES = {
  'Rice': 30,
  'Sugar': 45,
  'Oil': 120,
  'Wheat': 25,
  'Dal': 80,
};

export const ViewCartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const cart: CartItem[] = location.state?.cart || [];

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some items to your cart first</p>
          <Button onClick={() => navigate('/buy')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const getItemPrice = (itemName: string): number => {
    return ITEM_PRICES[itemName as keyof typeof ITEM_PRICES] || 50;
  };

  const calculateItemTotal = (item: CartItem): number => {
    return getItemPrice(item.item) * item.requestedQuantity;
  };

  const calculateTotalAmount = (): number => {
    return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const getDeliveryDays = (): string => {
    // Random delivery days between 2-7 days
    const days = Math.floor(Math.random() * 6) + 2;
    return days.toString();
  };

  const handlePayNow = async () => {
    const confirmed = window.confirm("Do you want to pay?");
    if (!confirmed) return;

    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create transactions for each cart item
      const transactions = cart.map(item => ({
        profile_id: profile!.id,
        shop_id: item.shop_id,
        item: item.item,
        quantity: item.requestedQuantity,
        type: 'buy' as const,
      }));

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (transactionError) throw transactionError;

      // Update stock quantities
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('ration_stock')
          .update({ quantity: item.quantity - item.requestedQuantity })
          .eq('id', item.id);

        if (stockError) throw stockError;
      }

      const deliveryDays = getDeliveryDays();
      alert(`Your payment is successful. Your order will be delivered within ${deliveryDays} days depending on distance.`);
      
      toast({
        title: "Payment Successful",
        description: `Order placed successfully. Delivery in ${deliveryDays} days.`,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCashOnDelivery = async () => {
    setProcessing(true);
    
    try {
      // Create transactions for each cart item
      const transactions = cart.map(item => ({
        profile_id: profile!.id,
        shop_id: item.shop_id,
        item: item.item,
        quantity: item.requestedQuantity,
        type: 'buy' as const,
      }));

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (transactionError) throw transactionError;

      // Update stock quantities
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('ration_stock')
          .update({ quantity: item.quantity - item.requestedQuantity })
          .eq('id', item.id);

        if (stockError) throw stockError;
      }

      alert("Your order has been placed. Please pay at the time of delivery.");
      
      toast({
        title: "Order Placed",
        description: "Cash on delivery order placed successfully.",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const shopName = cart[0]?.shop_name || 'Unknown Shop';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/buy')} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
              <p className="text-muted-foreground">Review your items from {shopName}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{item.item}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₹{getItemPrice(item.item)} per kg
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {item.requestedQuantity} kg
                        </Badge>
                        <p className="font-semibold">
                          ₹{calculateItemTotal(item)}
                        </p>
                      </div>
                    </div>
                    {index < cart.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Checkout Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Items ({cart.reduce((sum, item) => sum + item.requestedQuantity, 0)} kg)</span>
                  <span>₹{calculateTotalAmount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>₹{calculateTotalAmount()}</span>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handlePayNow} 
                    disabled={processing}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {processing ? 'Processing...' : 'Pay Now'}
                  </Button>
                  
                  <Button 
                    onClick={handleCashOnDelivery}
                    disabled={processing}
                    variant="outline"
                    className="w-full"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Cash on Delivery
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  <p>Secure payment • Free cancellation</p>
                  <p>Delivery within 2-7 days depending on distance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};