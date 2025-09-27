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
  Clock, 
  CheckCircle, 
  MapPin, 
  Calendar,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

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

export const DeliveryTrackingPage = () => {
  const [deliveries, setDeliveries] = useState<DeliveryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      fetchDeliveries();
      subscribeToDeliveryUpdates();
    }
  }, [profile]);

  const fetchDeliveries = async () => {
    try {
      const { data: transactionData, error } = await supabase
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
        .neq('delivery_status', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch shop names
      const shopIds = [...new Set(transactionData?.map(t => t.shop_id))];
      const { data: shopsData } = await supabase
        .from('shops')
        .select('id, shop_name')
        .in('id', shopIds);

      const shopsMap = new Map(shopsData?.map(shop => [shop.id, shop.shop_name]));

      const enrichedDeliveries = transactionData?.map(transaction => ({
        ...transaction,
        shop_name: shopsMap.get(transaction.shop_id) || 'Unknown Shop'
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

  const subscribeToDeliveryUpdates = () => {
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
          console.log('Delivery status updated:', payload);
          toast({
            title: "Delivery Update",
            description: "Your delivery status has been updated!",
          });
          fetchDeliveries(); // Refresh the data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusSteps = () => [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'in_transit', label: 'In Transit', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getStatusIndex = (status: string) => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.key === status);
  };

  const getStatusColor = (status: string) => {
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
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
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
          <Button 
            onClick={fetchDeliveries}
            variant="outline"
            className="hover-scale"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {deliveries.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No deliveries found</p>
              <p className="text-sm text-muted-foreground">Your orders will appear here once placed</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {deliveries.map((delivery, index) => (
              <Card 
                key={delivery.id} 
                className="animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="capitalize">{delivery.type}</span>
                        <Badge variant="outline">{delivery.item}</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantity: {delivery.quantity} {delivery.item === 'Oil' ? 'L' : 'kg'} • 
                        Shop: {delivery.shop_name}
                      </p>
                    </div>
                    <Badge 
                      className={`${getStatusColor(delivery.delivery_status)} capitalize`}
                    >
                      {delivery.delivery_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Status Timeline */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between relative">
                      {getStatusSteps().map((step, stepIndex) => {
                        const isActive = stepIndex <= getStatusIndex(delivery.delivery_status);
                        const isCurrent = stepIndex === getStatusIndex(delivery.delivery_status);
                        const Icon = step.icon;
                        
                        return (
                          <div key={step.key} className="flex flex-col items-center relative z-10">
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                              ${isActive 
                                ? 'bg-primary text-primary-foreground shadow-md' 
                                : 'bg-muted text-muted-foreground'
                              }
                              ${isCurrent ? 'ring-4 ring-primary/30 animate-pulse' : ''}
                            `}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <p className={`text-xs text-center max-w-16 ${
                              isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                            }`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                      
                      {/* Progress Line */}
                      <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-10">
                        <div 
                          className="h-full bg-primary transition-all duration-500 ease-out"
                          style={{ 
                            width: `${(getStatusIndex(delivery.delivery_status) / (getStatusSteps().length - 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Order Date:</span>
                      <span>{format(new Date(delivery.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    {delivery.estimated_delivery_date && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expected:</span>
                        <span>{format(new Date(delivery.estimated_delivery_date), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    
                    {delivery.actual_delivery_date && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Delivered:</span>
                        <span className="text-green-600 font-medium">
                          {format(new Date(delivery.actual_delivery_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {delivery.delivery_address && (
                      <div className="flex items-start space-x-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <p className="text-foreground">{delivery.delivery_address}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {delivery.delivery_notes && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Notes:</span> {delivery.delivery_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};