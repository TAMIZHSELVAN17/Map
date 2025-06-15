// src/components/Sidebar.js
import React, { useState } from 'react';
import SearchBox from './SearchBox';
import './Sidebar.css';

const Sidebar = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  branches,
  selectedBranch,
  onSelectBranch,
  onSearchAddress,
  onLocateMe
}) => {
  const [expandedDistrict, setExpandedDistrict] = useState(null);

  const handleDistrictClick = (district) => {
    setExpandedDistrict(expandedDistrict === district ? null : district);
    onSelectDistrict(district);
  };

  return (
    <div className="sidebar">
      <div className="header">Our Showrooms</div>
      <SearchBox onSearch={onSearchAddress} />
      <button className="locate-btn" onClick={onLocateMe}>LOCATE YOURSELF</button>
      <div className="district-list">
        {districts.map((d) => (
          <div key={d}>
            <button
              className={`district-btn ${d === selectedDistrict ? 'selected' : ''}`}
              onClick={() => handleDistrictClick(d)}
            >
              {d.toUpperCase()}
            </button>
            {expandedDistrict === d && (
              <div className="branch-list">
                {branches
                  .filter(b => b.district === d)
                  .map((branch, index) => (
                    <button
                      key={index}
                      className={`branch-btn ${selectedBranch && selectedBranch.name === branch.name ? 'selected' : ''}`}
                      onClick={() => onSelectBranch(branch)}
                    >
                      {branch.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;