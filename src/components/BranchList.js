import React from 'react';

const BranchList = ({ branches, selectedBranch, onSelectBranch }) => (
  <ul className="branch-list">
    {branches.map((branch, index) => (
      <li
        key={index}
        className={selectedBranch && selectedBranch.name === branch.name ? 'selected' : ''}
        onClick={() => onSelectBranch(branch)}
      >
        {branch.name}
      </li>
    ))}
  </ul>
);

export default BranchList;