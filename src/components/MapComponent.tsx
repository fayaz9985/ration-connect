import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.divIcon({
  html: `<div style="background-color: #dc2626; width: 25px; height: 41px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #991b1b;"></div>`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: 'custom-div-icon'
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Shop {
  id: string;
  shop_name: string;
  owner_name: string;
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export const MapComponent = ({ 
  center = [17.385, 78.486], // Hyderabad coordinates
  zoom = 10,
  height = "400px"
}: MapComponentProps) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id, shop_name, owner_name, latitude, longitude');

      if (error) {
        console.error('Error fetching shops:', error);
        return;
      }

      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="bg-muted animate-pulse rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.latitude, shop.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{shop.shop_name}</h3>
                <p className="text-xs text-gray-600">Owner: {shop.owner_name}</p>
                <p className="text-xs text-gray-500">
                  Lat: {shop.latitude.toFixed(4)}, Lng: {shop.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};