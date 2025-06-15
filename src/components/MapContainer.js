import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapContainer.css';

const defaultPosition = [12.9675, 79.1325];

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

const branchIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', // blue icon
  iconSize: [36, 52],
  iconAnchor: [18, 52],
  popupAnchor: [0, -45]
});

const highlightIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png',
  iconSize: [50, 60],
  iconAnchor: [25, 60],
  popupAnchor: [0, -52]
});

const selectedBranchIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png',
  iconSize: [60, 75],
  iconAnchor: [30, 75],
  popupAnchor: [0, -60]
});

const Recenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14);
  }, [position]);
  return null;
};

const BranchMap = ({ branches, selectedBranch, userLocation, selectedDistrict }) => {
  const mapRef = useRef();
  const markerRefs = useRef({});
  const center = userLocation || defaultPosition;

  // Handle map transitions for district and branch selection
  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;

    if (selectedBranch) {
      console.log(`%cSelected Branch: ${selectedBranch.name}`, 'color: white; background: black; padding: 6px 10px; font-size: 16px; font-weight: bold; border-radius: 4px;');
      mapInstance.flyTo([selectedBranch.lat, selectedBranch.lng], 16, {
        animate: true,
        duration: 2
      });
    } else if (selectedDistrict) {
      const districtBranches = branches.filter(b => b.district === selectedDistrict);
      if (districtBranches.length > 0) {
        const avgLat = districtBranches.reduce((sum, b) => sum + b.lat, 0) / districtBranches.length;
        const avgLng = districtBranches.reduce((sum, b) => sum + b.lng, 0) / districtBranches.length;
        mapInstance.flyTo([avgLat, avgLng], 13, {
          animate: true,
          duration: 2.5
        });
      }
    }
  }, [selectedBranch, selectedDistrict, branches]);

  // Handle popup opening for the selected branch
  useEffect(() => {
    if (selectedBranch) {
      const marker = markerRefs.current[selectedBranch.name];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedBranch]);

  const mapMarkers = branches
    .filter(b => !selectedDistrict || b.district === selectedDistrict)
    .map((branch, index) => {
      const isHighlighted = branch.name.includes("DAAS COMPUTERS");
      const isSelected = selectedBranch && branch.name === selectedBranch.name;

      const iconToUse = isSelected
        ? selectedBranchIcon
        : isHighlighted
        ? highlightIcon
        : branchIcon;

      // Handle the "Get Directions" link click
      const handleGetDirections = (e) => {
        if (!userLocation) {
          e.preventDefault();
          alert('Please use "Locate Me" or search for your address to set your location before getting directions.');
        }
      };

      return (
        <Marker
          key={index}
          position={[branch.lat, branch.lng]}
          icon={iconToUse}
          ref={(ref) => {
            if (ref) markerRefs.current[branch.name] = ref;
          }}
          eventHandlers={{
            add: (e) => {
              if (isSelected) {
                const markerEl = e.target._icon;
                if (markerEl) {
                  markerEl.classList.add('bounce-animation');
                  setTimeout(() => markerEl.classList.remove('bounce-animation'), 1500);
                }
              }
            }
          }}
        >
          <Popup>
            <div style={{
              fontFamily: 'Segoe UI, Roboto, sans-serif',
              fontSize: '14px',
              padding: '10px',
              borderRadius: '8px',
              color: '#333',
              backgroundColor: '#fefefe',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              maxWidth: '280px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', marginBottom: '6px' }}>{branch.name}</div>
              <div style={{ marginBottom: '4px' }}>📍 {branch.address}</div>
              <div style={{ marginBottom: '4px' }}>📞 {branch.phone}</div>
              {branch.email && <div style={{ marginBottom: '6px' }}>✉️ {branch.email}</div>}
              <a
                href={userLocation ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${branch.lat},${branch.lng}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGetDirections}
                style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '6px 12px',
                  backgroundColor: userLocation ? '#3498db' : '#cccccc',
                  color: '#fff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'background 0.3s ease',
                  cursor: userLocation ? 'pointer' : 'not-allowed'
                }}
                onMouseEnter={e => userLocation && (e.target.style.backgroundColor = '#2980b9')}
                onMouseLeave={e => userLocation && (e.target.style.backgroundColor = '#3498db')}
              >
                🧭 Get Directions
              </a>
            </div>
          </Popup>
        </Marker>
      );
    });

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      style={{ height: '100vh', width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
      ref={(ref) => {
        if (ref) mapRef.current = ref;
      }}
    >
      <Recenter position={center} />
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div style={{
              fontFamily: 'Segoe UI, Roboto, sans-serif',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#007bff'
            }}>
              You are here 🚶
            </div>
          </Popup>
        </Marker>
      )}

      {mapMarkers}
    </MapContainer>
  );
};

export default BranchMap;