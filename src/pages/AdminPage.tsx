import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Package, Users, TrendingUp, Plus, Edit, Shield } from 'lucide-react';

interface StockItem {
  id: string;
  item: string;
  quantity: number;
  shop_id: string;
  shop_name: string;
}

interface Profile {
  id: string;
  name: string;
  phone_number: string;
  ration_card_no: string;
  card_type: string;
}

interface Transaction {
  id: string;
  item: string;
  quantity: number;
  type: string;
  created_at: string;
  profile_name: string;
  shop_name: string;
}

export const AdminPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('stock');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  const [newStock, setNewStock] = useState({
    item: '',
    quantity: '',
    shop_id: '',
  });

  // Check if user has admin role from database
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!profile) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setIsAdmin(false);
        } else {
          const hasAdminRole = userRoles?.some(r => r.role === 'admin');
          setIsAdmin(hasAdminRole || false);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminRole();
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'stock') fetchStock();
    if (activeTab === 'users') fetchProfiles();
    if (activeTab === 'transactions') fetchTransactions();
  }, [activeTab]);

  // Show loading state while checking admin status
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!profile || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const fetchStock = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ration_stock')
        .select(`
          id,
          item,
          quantity,
          shop_id,
          shops (
            shop_name
          )
        `)
        .order('item');

      if (error) throw error;

      const formattedData = data.map(item => ({
        id: item.id,
        item: item.item,
        quantity: item.quantity,
        shop_id: item.shop_id,
        shop_name: item.shops?.shop_name || 'Unknown Shop',
      }));

      setStockItems(formattedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch stock data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          item,
          quantity,
          type,
          created_at,
          profiles (
            name
          ),
          shops (
            shop_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedData = data.map(transaction => ({
        id: transaction.id,
        item: transaction.item,
        quantity: transaction.quantity,
        type: transaction.type,
        created_at: transaction.created_at,
        profile_name: transaction.profiles?.name || 'Unknown User',
        shop_name: transaction.shops?.shop_name || 'Unknown Shop',
      }));

      setTransactions(formattedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!newStock.item || !newStock.quantity || !newStock.shop_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('ration_stock')
        .insert([{
          item: newStock.item,
          quantity: parseInt(newStock.quantity),
          shop_id: newStock.shop_id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock item added successfully",
      });

      setNewStock({ item: '', quantity: '', shop_id: '' });
      fetchStock();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stock item",
        variant: "destructive",
      });
    }
  };

  const updateStockQuantity = async (id: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('ration_stock')
        .update({ quantity: newQuantity })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock quantity updated",
      });

      fetchStock();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    }
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

  const getCardTypeColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'apl': return 'bg-blue-100 text-blue-800';
      case 'bpl': return 'bg-green-100 text-green-800';
      case 'aay': return 'bg-purple-100 text-purple-800';
      case 'priority': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalStats = () => {
    return {
      totalStock: stockItems.reduce((sum, item) => sum + item.quantity, 0),
      totalUsers: profiles.length,
      totalTransactions: transactions.length,
      lowStockItems: stockItems.filter(item => item.quantity < 50).length,
    };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Settings className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage ration shop operations</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Stock</p>
                  <p className="text-2xl font-bold">{stats.totalStock} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold">{stats.lowStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === 'stock' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stock')}
          >
            Stock Management
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </Button>
        </div>

        {/* Stock Management Tab */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Stock Item
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="item">Item Name</Label>
                    <Input
                      id="item"
                      value={newStock.item}
                      onChange={(e) => setNewStock({ ...newStock, item: e.target.value })}
                      placeholder="e.g., Rice, Wheat"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity (kg)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newStock.quantity}
                      onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shop">Shop</Label>
                    <Select onValueChange={(value) => setNewStock({ ...newStock, shop_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Central Ration Shop</SelectItem>
                        <SelectItem value="2">North District Shop</SelectItem>
                        <SelectItem value="3">South Central Shop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddStock} className="w-full">
                      Add Stock
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-muted-foreground">{item.shop_name}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={item.quantity < 50 ? 'destructive' : 'default'}
                        >
                          {item.quantity} kg
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            defaultValue={item.quantity}
                            onBlur={(e) => {
                              const newQuantity = parseInt(e.target.value);
                              if (newQuantity !== item.quantity) {
                                updateStockQuantity(item.id, newQuantity);
                              }
                            }}
                            className="w-20"
                          />
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.phone_number} • {profile.ration_card_no}
                      </p>
                    </div>
                    <Badge className={getCardTypeColor(profile.card_type)}>
                      {profile.card_type.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{transaction.item}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.profile_name} • {transaction.shop_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {transaction.type.toUpperCase()}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};