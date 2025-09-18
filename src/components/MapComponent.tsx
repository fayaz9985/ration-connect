import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Create a custom red marker icon
const redIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path fill="#dc2626" stroke="#991b1b" stroke-width="2" d="M12.5,1 C19.4,1 25,6.6 25,13.5 C25,23.5 12.5,40 12.5,40 C12.5,40 0,23.5 0,13.5 C0,6.6 5.6,1 12.5,1 Z"/>
      <circle fill="#fff" cx="12.5" cy="13.5" r="5"/>
    </svg>
  `),
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fix leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

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
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // Initialize Leaflet map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);
  }, [center, zoom]);

  // Update markers when shops data changes
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    markersRef.current.clearLayers();

    shops.forEach((shop) => {
      const marker = L.marker([shop.latitude, shop.longitude], { icon: redIcon });
      marker.bindPopup(
        `<div class="p-2">
          <strong class="text-sm">${shop.shop_name}</strong><br/>
          <span class="text-xs">Owner: ${shop.owner_name}</span><br/>
          <span class="text-xs text-muted-foreground">Lat: ${shop.latitude.toFixed(4)}, Lng: ${shop.longitude.toFixed(4)}</span>
        </div>`
      );
      marker.addTo(markersRef.current!);
    });
  }, [shops]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

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
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};