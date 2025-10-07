import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Minus, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

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

// Item prices per kg/liter
const ITEM_PRICES = {
  Rice: 30,
  Wheat: 25,
  Oil: 100,
  Sugar: 40,
};

export const BuyPage = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    // Check if user is trying to add from a different shop
    if (selectedShop && selectedShop !== item.shop_id) {
      toast({
        title: t('pages.buy.differentShop'),
        description: t('pages.buy.differentShopDesc'),
        variant: "destructive",
      });
      return;
    }

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
          title: t('pages.buy.limitReached'),
          description: t('pages.buy.limitReachedDesc'),
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, { ...item, requestedQuantity: 1 }]);
      if (!selectedShop) {
        setSelectedShop(item.shop_id);
      }
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
      // If cart is empty, reset selected shop
      if (cart.length === 1) {
        setSelectedShop(null);
      }
    }
  };

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.requestedQuantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.requestedQuantity, 0);
  };

  const getItemPrice = (itemName: string) => {
    return ITEM_PRICES[itemName as keyof typeof ITEM_PRICES] || 0;
  };

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => {
      return total + (item.requestedQuantity * getItemPrice(item.item));
    }, 0);
  };

  const handlePurchase = async () => {
    if (cart.length === 0) {
      toast({
        title: t('pages.buy.emptyCartError'),
        description: t('pages.buy.emptyCartErrorDesc'),
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);
    
    try {
      // First, validate stock availability for all items
      for (const item of cart) {
        const { data: currentStock, error: stockCheckError } = await supabase
          .from('ration_stock')
          .select('quantity')
          .eq('id', item.id)
          .single();

        if (stockCheckError) throw stockCheckError;

        if (!currentStock || currentStock.quantity < item.requestedQuantity) {
          toast({
            title: t('pages.buy.insufficientStock'),
            description: t('pages.buy.insufficientStockDesc', { item: item.item }),
            variant: "destructive",
          });
          setPurchasing(false);
          return;
        }
      }

      // Update stock quantities first (to prevent overselling)
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('ration_stock')
          .update({ quantity: item.quantity - item.requestedQuantity })
          .eq('id', item.id);

        if (stockError) throw stockError;
      }

      // Create transactions for each cart item
      const currentDate = new Date();
      const estimatedDeliveryDate = new Date(currentDate);
      estimatedDeliveryDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 5) + 3); // 3-7 days

      const transactions = cart.map(item => ({
        profile_id: profile!.id,
        shop_id: item.shop_id,
        item: item.item,
        quantity: item.requestedQuantity,
        type: 'buy' as const,
        delivery_status: 'confirmed',
        estimated_delivery_date: format(estimatedDeliveryDate, 'yyyy-MM-dd'),
        delivery_address: profile?.address || 'Address not provided'
      }));

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (transactionError) throw transactionError;

      toast({
        title: t('pages.buy.purchaseSuccess'),
        description: t('pages.buy.purchaseSuccessDesc', { count: getTotalItems(), total: getTotalCartValue() }),
      });

      setCart([]);
      setSelectedShop(null);
      fetchStock(); // Refresh stock
    } catch (error) {
      toast({
        title: t('pages.buy.purchaseFailed'),
        description: t('pages.buy.purchaseFailedDesc'),
        variant: "destructive",
      });
      // Refresh stock to show current availability
      fetchStock();
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('pages.buy.loadingStock')}</p>
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
              <h1 className="text-3xl font-bold text-foreground">{t('pages.buy.title')}</h1>
              <p className="text-muted-foreground">{t('pages.buy.subtitle')}</p>
            </div>
          </div>
          
          {cart.length > 0 && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <Badge variant="secondary" className="text-lg px-3 py-1 mb-2">
                  {t('pages.buy.cartItems', { count: getTotalItems() })}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {t('buy.total')}: ₹{getTotalCartValue()}
                </p>
              </div>
              <Button onClick={() => navigate('/view-cart', { state: { cart } })}>
                <Eye className="h-4 w-4 mr-2" />
                {t('pages.buy.viewAll')}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stockItems
            .filter(item => !selectedShop || item.shop_id === selectedShop)
            .map((item) => {
            const cartQuantity = getCartItemQuantity(item.id);
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.item}</CardTitle>
                    <Badge variant="outline">{t('pages.buy.available', { quantity: item.quantity })}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">{item.shop_name}</p>
                    <p className="text-sm font-semibold text-primary">
                      {t('pages.buy.pricePerUnit', { price: getItemPrice(item.item), unit: item.item === 'Oil' ? 'liter' : 'kg' })}
                    </p>
                  </div>
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
                        <div className="mx-3 text-center">
                          <span className="font-semibold">{cartQuantity} {item.item === 'Oil' ? 'L' : 'kg'}</span>
                          <p className="text-xs text-muted-foreground">₹{cartQuantity * getItemPrice(item.item)}</p>
                        </div>
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
                        {t('pages.buy.addToCart')}
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
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('pages.buy.noStock')}</h3>
            <p className="text-muted-foreground">
              {t('pages.buy.noStockDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};