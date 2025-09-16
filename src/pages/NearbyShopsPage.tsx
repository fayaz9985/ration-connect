import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Package, Clock } from 'lucide-react';
import { MapComponent } from '@/components/MapComponent';

interface Shop {
  id: string;
  shop_name: string;
  owner_name: string;
  latitude: number;
  longitude: number;
}

interface StockItem {
  item: string;
  quantity: number;
}

export const NearbyShopsPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [stockData, setStockData] = useState<Record<string, StockItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopsAndStock();
  }, []);

  const fetchShopsAndStock = async () => {
    try {
      // Fetch shops
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .limit(10);

      if (shopsError) {
        console.error('Error fetching shops:', shopsError);
        return;
      }

      setShops(shopsData || []);

      // Fetch stock data for these shops
      const { data: stockData, error: stockError } = await supabase
        .from('ration_stock')
        .select('shop_id, item, quantity')
        .in('shop_id', shopsData?.map(shop => shop.id) || []);

      if (stockError) {
        console.error('Error fetching stock:', stockError);
        return;
      }

      // Group stock by shop_id
      const groupedStock: Record<string, StockItem[]> = {};
      stockData?.forEach(item => {
        if (!groupedStock[item.shop_id]) {
          groupedStock[item.shop_id] = [];
        }
        groupedStock[item.shop_id].push({
          item: item.item,
          quantity: item.quantity
        });
      });

      setStockData(groupedStock);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-96 bg-muted rounded"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Nearby Ration Shops</h1>
          <p className="text-muted-foreground">Find ration shops near your location in Telangana</p>
        </div>

        {/* Map Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Shop Locations
            </CardTitle>
            <CardDescription>Red markers show nearby ration shops</CardDescription>
          </CardHeader>
          <CardContent>
            <MapComponent height="500px" />
          </CardContent>
        </Card>

        {/* Shop List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">All Ration Shops</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => {
              const shopStock = stockData[shop.id] || [];
              return (
                <Card key={shop.id} className="hover:shadow-md transition-shadow border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">{shop.shop_name}</CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Owner: {shop.owner_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coordinates: {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shopStock.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          Stock Available
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          {shopStock.map((item) => (
                            <div key={item.item} className="text-center p-2 bg-accent/50 rounded">
                              <div className="font-medium">{item.quantity}</div>
                              <div className="text-muted-foreground">{item.item} (kg)</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      9:00 AM - 6:00 PM (Mon-Sat)
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};