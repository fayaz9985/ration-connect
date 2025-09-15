import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Package, Search, Store } from 'lucide-react';

interface StockItem {
  id: string;
  item: string;
  quantity: number;
  shop_name: string;
  owner_name: string;
  updated_at: string;
}

export const StockPage = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShop, setSelectedShop] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    filterStock();
  }, [stockItems, searchTerm, selectedShop, selectedItem]);

  const fetchStock = async () => {
    try {
      const { data, error } = await supabase
        .from('ration_stock')
        .select(`
          id,
          item,
          quantity,
          updated_at,
          shops (
            shop_name,
            owner_name
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(item => ({
        id: item.id,
        item: item.item,
        quantity: item.quantity,
        shop_name: item.shops?.shop_name || 'Unknown Shop',
        owner_name: item.shops?.owner_name || 'Unknown Owner',
        updated_at: item.updated_at,
      }));

      setStockItems(formattedData);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStock = () => {
    let filtered = stockItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shop_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedShop !== 'all') {
      filtered = filtered.filter(item => item.shop_name === selectedShop);
    }

    if (selectedItem !== 'all') {
      filtered = filtered.filter(item => item.item === selectedItem);
    }

    setFilteredItems(filtered);
  };

  const getUniqueShops = () => {
    const shops = [...new Set(stockItems.map(item => item.shop_name))];
    return shops.sort();
  };

  const getUniqueItems = () => {
    const items = [...new Set(stockItems.map(item => item.item))];
    return items.sort();
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity < 50) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading stock information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Package className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ration Stock</h1>
            <p className="text-muted-foreground">View current stock levels across all shops</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Filter Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items or shops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by shop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {getUniqueShops().map((shop) => (
                    <SelectItem key={shop} value={shop}>
                      {shop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  {getUniqueItems().map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item.quantity);
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.item}</CardTitle>
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.label}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Store className="h-4 w-4 mr-1" />
                    {item.shop_name}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Available:</span>
                      <span className="text-2xl font-bold text-primary">
                        {item.quantity} kg
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Owner: {item.owner_name}</p>
                      <p>Updated: {formatDate(item.updated_at)}</p>
                    </div>

                    {/* Stock Level Bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.quantity === 0
                            ? 'bg-destructive'
                            : item.quantity < 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((item.quantity / 200) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Stock Found</h3>
            <p className="text-muted-foreground">
              No stock items match your current filters.
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Stock Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stockItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stockItems.filter(item => item.quantity > 50).length}
                </p>
                <p className="text-sm text-muted-foreground">Well Stocked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {stockItems.filter(item => item.quantity > 0 && item.quantity <= 50).length}
                </p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {stockItems.filter(item => item.quantity === 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};