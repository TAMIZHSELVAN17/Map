// src/App.js
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import BranchMap from './components/MapContainer';
import branchesData from './data/branches';
import './styles.css';

function App() {
  const districts = useMemo(() => {
    const set = new Set(branchesData.map(b => b.district));
    return Array.from(set);
  }, []);

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const filteredBranches = useMemo(() => {
    if (!selectedDistrict) return branchesData;
    return branchesData.filter(b => b.district === selectedDistrict);
  }, [selectedDistrict]);

  const handleSearchAddress = async (address) => {
    const normalizedAddress = address.trim().toLowerCase();
    if (normalizedAddress === "vellore") {
      setSelectedDistrict("Vellore");
      setUserLocation(null);
      setSelectedBranch(null);
      return;
    } else if (normalizedAddress === "arni") {
      setSelectedDistrict("Arni");
      setUserLocation(null);
      setSelectedBranch(null);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setUserLocation([parseFloat(lat), parseFloat(lon)]);
        setSelectedDistrict(null);
        setSelectedBranch(null);
      } else {
        alert('Address not found.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      alert('Error finding address.');
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setSelectedDistrict(null);
          setSelectedBranch(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    setUserLocation(null);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Find Your Nearest Dass Computer Store</h1>
      <div className="app-content">
        <Sidebar
          districts={districts}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={setSelectedDistrict}
          branches={filteredBranches}
          selectedBranch={selectedBranch}
          onSelectBranch={handleSelectBranch}
          onSearchAddress={handleSearchAddress}
          onLocateMe={handleLocateMe}
        />
        <BranchMap
          branches={filteredBranches}
          userLocation={userLocation}
          selectedDistrict={selectedDistrict}
          selectedBranch={selectedBranch}
        />
      </div>
    </div>
  );
}

export default App;