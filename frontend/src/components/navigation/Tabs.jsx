/**
 * Tabs Component
 * Underlined tabbed section header with active tab indicator.
 */
import React from 'react';

const Tabs = ({ tabs = [], activeTab, onChange }) => {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
