import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, User as UserIcon } from 'lucide-react';
import { useEffect } from 'react';

// Custom Markers
const userIcon = new L.DivIcon({
  html: `<div style="background: #38bdf8; color: white; padding: 10px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(56, 189, 248, 0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const mechanicIcon = new L.DivIcon({
  html: `<div style="background: #ef4444; color: white; padding: 10px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.5); transform: rotate(0deg);" class="mechanic-marker-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Auto-center map when locations change
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function TrackingMap({ userLocation, mechanicLocation }) {
  const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [28.6139, 77.2090];

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Aapki Location</Popup>
          </Marker>
        )}

        {mechanicLocation && (
          <Marker position={[mechanicLocation.lat, mechanicLocation.lng]} icon={mechanicIcon}>
            <Popup>Mechanic On The Way</Popup>
          </Marker>
        )}

        {mechanicLocation && <ChangeView center={[mechanicLocation.lat, mechanicLocation.lng]} />}
      </MapContainer>
      
      <style>{`
        .mechanic-marker-pulse {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
