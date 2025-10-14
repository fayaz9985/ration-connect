import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin,
  Calendar,
  Phone,
  RefreshCw
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface DeliveryTransaction {
  id: string;
  item: string;
  quantity: number;
  type: string;
  created_at: string;
  delivery_status: string;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  delivery_address: string | null;
  delivery_notes: string | null;
  shop_name?: string;
}

interface Shop {
  id: string;
  shop_name: string;
}

const deliveryStatuses = [
  { status: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, color: 'text-green-600' },
  { status: 'preparing', label: 'Preparing Order', icon: Package, color: 'text-blue-600' },
  { status: 'in_transit', label: 'In Transit', icon: Truck, color: 'text-orange-600' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin, color: 'text-purple-600' },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-green-600' },
];

export const DeliveryTrackingPage = () => {
  const [deliveries, setDeliveries] = useState<DeliveryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      fetchDeliveries();
      setupRealtimeSubscription();
    }
  }, [profile]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('delivery-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `profile_id=eq.${profile!.id}`
        },
        (payload) => {
          fetchDeliveries();
          
          // Show toast notification for status updates
          const newStatus = payload.new.delivery_status;
          const statusInfo = deliveryStatuses.find(s => s.status === newStatus);
          if (statusInfo) {
            toast({
              title: "Delivery Update",
              description: `Your order is now ${statusInfo.label.toLowerCase()}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchDeliveries = async () => {
    try {
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          id,
          item,
          quantity,
          type,
          created_at,
          delivery_status,
          estimated_delivery_date,
          actual_delivery_date,
          delivery_address,
          delivery_notes,
          shop_id
        `)
        .eq('profile_id', profile!.id)
        .in('type', ['buy', 'convert'])
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch shop details
      const shopIds = [...new Set(transactionData?.map(t => t.shop_id))];
      const { data: shopsData } = await supabase
        .from('shops')
        .select('id, shop_name')
        .in('id', shopIds);

      const shopsMap = new Map(shopsData?.map((shop: Shop) => [shop.id, shop.shop_name]));

      const enrichedDeliveries = transactionData?.map(transaction => ({
        ...transaction,
        shop_name: shopsMap.get(transaction.shop_id) || 'Unknown Shop',
        // Auto-generate estimated delivery if not set
        estimated_delivery_date: transaction.estimated_delivery_date || 
          format(addDays(new Date(transaction.created_at), Math.floor(Math.random() * 3) + 1), 'yyyy-MM-dd')
      })) || [];

      setDeliveries(enrichedDeliveries);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load delivery information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (currentStatus: string) => {
    const statusOrder = ['confirmed', 'preparing', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const getCurrentStatusInfo = (status: string) => {
    return deliveryStatuses.find(s => s.status === status) || deliveryStatuses[0];
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'preparing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in_transit':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'out_for_delivery':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Truck className="h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Delivery Tracking</h1>
              <p className="text-muted-foreground">Track your orders in real-time</p>
            </div>
          </div>
          <Button onClick={fetchDeliveries} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Active Deliveries */}
        <div className="space-y-6">
          {deliveries.length === 0 ? (
            <Card className="animate-fade-in">
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No deliveries to track</p>
                <p className="text-sm text-muted-foreground">Your orders will appear here once placed</p>
              </CardContent>
            </Card>
          ) : (
            deliveries.map((delivery, index) => {
              const statusInfo = getCurrentStatusInfo(delivery.delivery_status);
              const StatusIcon = statusInfo.icon;
              const progress = getStatusProgress(delivery.delivery_status);
              
              return (
                <Card 
                  key={delivery.id}
                  className={`animate-fade-in hover-scale transition-all duration-200 ${
                    delivery.delivery_status === 'delivered' ? 'opacity-75' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getDeliveryStatusColor(delivery.delivery_status)}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{delivery.item}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {delivery.quantity} {delivery.item === 'Oil' ? 'L' : 'kg'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From: {delivery.shop_name}
                          </p>
                        </div>
                      </div>
                      <Badge className={getDeliveryStatusColor(delivery.delivery_status)}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {deliveryStatuses.map((status, idx) => {
                        const isActive = deliveryStatuses.findIndex(s => s.status === delivery.delivery_status) >= idx;
                        const Icon = status.icon;
                        
                        return (
                          <div key={status.status} className="flex flex-col items-center space-y-1">
                            <div className={`p-2 rounded-full border-2 transition-all ${
                              isActive 
                                ? 'border-primary bg-primary text-white' 
                                : 'border-muted-foreground/30 bg-background text-muted-foreground'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className={`text-xs ${
                              isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                            }`}>
                              {status.label.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expected Delivery:</span>
                        <span className="font-medium">
                          {delivery.estimated_delivery_date ? 
                            format(new Date(delivery.estimated_delivery_date), 'MMM dd, yyyy') :
                            'To be determined'
                          }
                        </span>
                      </div>
                      
                      {delivery.actual_delivery_date && (
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-muted-foreground">Delivered on:</span>
                          <span className="font-medium text-green-600">
                            {format(new Date(delivery.actual_delivery_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}

                      {delivery.delivery_notes && (
                        <div className="flex items-start space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">Note:</span>
                          <span className="font-medium">{delivery.delivery_notes}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Order placed:</span>
                        <span className="font-medium">
                          {format(new Date(delivery.created_at), 'MMM dd, yyyy hh:mm a')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};