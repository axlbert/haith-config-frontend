import React, { useState, useEffect } from 'react';
import './style.css';
import axios from 'axios';

function App() {
  const [selectedKeyword, setSelectedKeyword] = useState('conveyor');
  const [configurations, setConfigurations] = useState([]);
  const [projectNumber, setProjectNumber] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch initial configuration items for the default keyword
    fetchConfigurationItems(selectedKeyword);
  }, []); // Empty dependency array to run only once on mount


  // Fetch configuration items from the Flask backend
  const fetchConfigurationItems = async (keyword) => {
    try {
      const response = await axios.post('http://localhost:5000/fetch_configuration_items', {
        keyword
      });
      setItems(response.data.items);
    } catch (error) {
      console.error('Error fetching configuration items:', error);
    }
  };
  

  // Handle machine selection
  const selectMachine = (keyword) => {
    setSelectedKeyword(keyword);
    fetchConfigurationItems(keyword);
  };

  // Handle item selection
  const selectItem = (index) => {
    setItems(items.map((item, i) => {
      if (i === index) {
        return { ...item, selected: !item.selected };
      }
      return item;
    }));
  };

  // Handle complete configuration
  const completeConfiguration = () => {
    if (!selectedKeyword || !projectNumber || items.every(item => !item.selected)) {
      alert('Please enter a project number, select a machine, and configure items before completing.');
      return;
    }
    const configCount = configurations.filter(config => config.keyword === selectedKeyword).length + 1;
    const completedConfig = {
      keyword: selectedKeyword,
      items: items.filter(item => item.selected),
      projectNumber: projectNumber,
      configCount, // Item count for this keyword
    };
    setConfigurations([...configurations, completedConfig]);
  };

  // Render configuration items
  const renderConfigurationItems = () => {
    return items.map((item, index) => (
      <div key={index} className={`selectable result-item ${item.selected ? 'selected' : ''}`} onClick={() => selectItem(index)}>
        <span className="line-text">{item.text}</span>
        {item.hasPlaceholder && (
          <select onChange={(e) => handleSizeChange(e, index)}>
            <option value="default">Select Size</option>
            <option value="100mm">100mm</option>
            <option value="200mm">200mm</option>
            <option value="300mm">300mm</option>
          </select>
        )}
        <div className="count-info">(Count: 1/{items.length} - {(1 / items.length * 100).toFixed(2)}%)</div>
      </div>
    ));
  };

  const handleSizeChange = (e, index) => {
    // Handle size selection for an item
  };

  // Render completed configurations
  const renderCompletedConfigurations = () => {
    return configurations.map((config, index) => (
      <div key={index} className="accordion-item">
        <div className="accordion-header" onClick={() => toggleAccordion(index)}>
          {`${config.projectNumber}-${config.keyword}-${String(config.configCount).padStart(3, '0')}`}
        </div>
        <div className="accordion-content" style={{ display: 'none' }}>
          {/* Render config.items */}
        </div>
      </div>
    ));
  };

  // Toggle accordion
  const toggleAccordion = (index) => {
    // Implement accordion toggle logic
  };

  return (
    <div className="App">
      <header>
        <div className="container">
          <img src="logo.png" alt="Logo" style={{ height: '60px', verticalAlign: 'middle' }} />
          <h1 style={{ display: 'inline', marginLeft: '15px' }}>Machine Configuration Analysis</h1>
        </div>
      </header>

      <div className="container project-number-container">
        <label htmlFor="project-number-input">Project Number:</label>
        <input type="text" id="project-number-input" placeholder="Enter project number" value={projectNumber} onChange={(e) => setProjectNumber(e.target.value)} />
      </div>

      {/* Card elements for machine selection */}
      <div className="container card-container">
        {/* Render machine selection cards */}
      </div>

      <div className="container split-screen">
        <div className="left-side">
          {/* Render configuration items */}
          {renderConfigurationItems()}
        </div>
        <div className="right-side">
          <h2 id="selected-configuration-title">Selected Configuration</h2>
          <div id="configuration" className="configuration">
            {/* Render selected configuration items */}
          </div>
          <button onClick={completeConfiguration} className="complete-item-btn">Complete Item</button>
        </div>
      </div>

      {/* Accordion for completed configurations */}
      <div id="accordion" className="accordion">
        {renderCompletedConfigurations()}
      </div>
      </div>
  );
}

export default App;
