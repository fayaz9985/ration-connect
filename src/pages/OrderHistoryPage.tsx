import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { History, ShoppingCart, Banknote, RefreshCw, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  item: string;
  quantity: number;
  type: string;
  created_at: string;
  shop_name?: string;
}

interface Shop {
  id: string;
  shop_name: string;
}

export const OrderHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      fetchTransactions();
    }
  }, [profile]);

  const fetchTransactions = async () => {
    try {
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          id,
          item,
          quantity,
          type,
          created_at,
          shop_id
        `)
        .eq('profile_id', profile!.id)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch shop details for each transaction
      const shopIds = [...new Set(transactionData?.map(t => t.shop_id))];
      const { data: shopsData } = await supabase
        .from('shops')
        .select('id, shop_name')
        .in('id', shopIds);

      const shopsMap = new Map(shopsData?.map((shop: Shop) => [shop.id, shop.shop_name]));

      const enrichedTransactions = transactionData?.map(transaction => ({
        ...transaction,
        shop_name: shopsMap.get(transaction.shop_id) || 'Unknown Shop'
      })) || [];

      setTransactions(enrichedTransactions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ShoppingCart className="h-4 w-4" />;
      case 'sell':
        return <Banknote className="h-4 w-4" />;
      case 'convert':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sell':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'convert':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStats = () => {
    const stats = {
      total: transactions.length,
      purchases: transactions.filter(t => t.type === 'buy').length,
      sales: transactions.filter(t => t.type === 'sell').length,
      conversions: transactions.filter(t => t.type === 'convert').length,
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <History className="h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8 animate-fade-in">
          <History className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order History</h1>
            <p className="text-muted-foreground">Track all your transactions and activities</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
          <Card className="hover-scale">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.purchases}</div>
              <p className="text-sm text-muted-foreground">Purchases</p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.sales}</div>
              <p className="text-sm text-muted-foreground">Sales</p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.conversions}</div>
              <p className="text-sm text-muted-foreground">Conversions</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground">Start buying, selling, or converting items to see your history here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.id}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md animate-fade-in ${getTransactionColor(transaction.type)}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold capitalize">{transaction.type}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {transaction.type === 'buy' ? 'Purchase' : 
                               transaction.type === 'sell' ? 'Sale' : 'Conversion'}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{transaction.item}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Quantity: {transaction.quantity} {transaction.item === 'Oil' ? 'L' : 'kg'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Shop: {transaction.shop_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'hh:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};