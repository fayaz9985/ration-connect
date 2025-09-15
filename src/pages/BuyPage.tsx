import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Minus, Plus } from 'lucide-react';

interface StockItem {
  id: string;
  item: string;
  quantity: number;
  shop_name: string;
  shop_id: string;
}

interface CartItem extends StockItem {
  requestedQuantity: number;
}

export const BuyPage = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const { data, error } = await supabase
        .from('ration_stock')
        .select(`
          id,
          item,
          quantity,
          shops (
            id,
            shop_name
          )
        `)
        .gt('quantity', 0);

      if (error) throw error;

      const formattedData = data.map(item => ({
        id: item.id,
        item: item.item,
        quantity: item.quantity,
        shop_name: item.shops?.shop_name || 'Unknown Shop',
        shop_id: item.shops?.id || '',
      }));

      setStockItems(formattedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch stock items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: StockItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      if (existingItem.requestedQuantity < item.quantity) {
        setCart(cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, requestedQuantity: cartItem.requestedQuantity + 1 }
            : cartItem
        ));
      } else {
        toast({
          title: "Limit Reached",
          description: "Cannot add more than available quantity",
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, { ...item, requestedQuantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem && existingItem.requestedQuantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, requestedQuantity: cartItem.requestedQuantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.requestedQuantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.requestedQuantity, 0);
  };

  const handlePurchase = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before purchasing",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);
    
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

      toast({
        title: "Purchase Successful",
        description: `Successfully purchased ${getTotalItems()} items`,
      });

      setCart([]);
      fetchStock(); // Refresh stock
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Failed to complete purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading stock items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Buy Ration Items</h1>
              <p className="text-muted-foreground">Purchase ration items from available stock</p>
            </div>
          </div>
          
          {cart.length > 0 && (
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Cart: {getTotalItems()} items
              </Badge>
              <Button onClick={handlePurchase} disabled={purchasing}>
                {purchasing ? 'Processing...' : 'Purchase All'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stockItems.map((item) => {
            const cartQuantity = getCartItemQuantity(item.id);
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.item}</CardTitle>
                    <Badge variant="outline">{item.quantity} kg available</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.shop_name}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {cartQuantity > 0 ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-3 font-semibold">{cartQuantity} kg</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCart(item)}
                          disabled={cartQuantity >= item.quantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => addToCart(item)} className="w-full">
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {stockItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Stock Available</h3>
            <p className="text-muted-foreground">
              Currently no ration items are in stock. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};