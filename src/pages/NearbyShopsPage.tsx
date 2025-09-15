import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Navigation, Phone, Clock, Store } from 'lucide-react';

interface Shop {
  id: string;
  shop_name: string;
  owner_name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

export const NearbyShopsPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    fetchShops();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && shops.length > 0) {
      calculateDistances();
    }
  }, [userLocation, shops]);

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('shop_name');

      if (error) throw error;
      setShops(data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Showing all shops.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  };

  const calculateDistances = () => {
    if (!userLocation) return;
    
    const shopsWithDistance = shops.map(shop => ({
      ...shop,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        shop.latitude,
        shop.longitude
      ),
    }));

    // Sort by distance
    shopsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setShops(shopsWithDistance);
  };

  const openInMaps = (shop: Shop) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  const getDistanceBadge = (distance?: number) => {
    if (!distance) return null;
    
    if (distance < 2) {
      return <Badge className="bg-green-100 text-green-800">Very Near ({distance} km)</Badge>;
    } else if (distance < 5) {
      return <Badge className="bg-blue-100 text-blue-800">Nearby ({distance} km)</Badge>;
    } else {
      return <Badge variant="secondary">{distance} km away</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading nearby shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <MapPin className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nearby Ration Shops</h1>
            <p className="text-muted-foreground">Find ration shops in your area</p>
          </div>
        </div>

        {locationError && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Navigation className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800">{locationError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {userLocation && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Navigation className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800">
                  Location detected. Shops are sorted by distance from your location.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Store className="h-6 w-6 text-primary mr-2" />
                    <CardTitle className="text-lg">{shop.shop_name}</CardTitle>
                  </div>
                  {getDistanceBadge(shop.distance)}
                </div>
                <p className="text-muted-foreground">Owner: {shop.owner_name}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    Lat: {shop.latitude}, Lng: {shop.longitude}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    Open: Mon-Sat, 9:00 AM - 6:00 PM
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => openInMaps(shop)}
                    className="flex-1"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">Available Services:</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">Rice</Badge>
                    <Badge variant="outline" className="text-xs">Wheat</Badge>
                    <Badge variant="outline" className="text-xs">Sugar</Badge>
                    <Badge variant="outline" className="text-xs">Oil</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {shops.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Shops Found</h3>
            <p className="text-muted-foreground">
              No ration shops are currently registered in the system.
            </p>
          </div>
        )}

        {/* Map Integration Notice */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Map Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  For a full interactive map experience with Google Maps integration, 
                  click "Get Directions" to open the location in your default maps application.
                  This will provide turn-by-turn navigation to your selected ration shop.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};