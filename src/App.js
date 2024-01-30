import React, { useState, useEffect } from 'react';
import './style.css';
import axios from 'axios';

function App() {
  const [selectedKeyword, setSelectedKeyword] = useState('conveyor');
  const [configurations, setConfigurations] = useState([]);
  const [projectNumber, setProjectNumber] = useState('');
  const [items, setItems] = useState([]);

  const keywords = ['conveyor', 'washer', 'tipper']; // Example keywords


  useEffect(() => {
    // Fetch initial configuration items for the default keyword
    fetchConfigurationItems(selectedKeyword);
  }, []); // Empty dependency array to run only once on mount


  // Fetch configuration items from the Flask backend
  const fetchConfigurationItems = async (keyword) => {
    try {
      const response = await axios.post('http://localhost:4555/fetch_configuration_items', {
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
        // If the item is an object, toggle its 'selected' property
        if (typeof item === 'object' && item !== null) {
          return { ...item, selected: !item.selected };
        }
        // If the item is a string, convert it to an object with a 'selected' property
        else if (typeof item === 'string') {
          return { text: item, selected: true };
        }
      }
      return item;
    }));
  };

  // Handle complete configuration
  const completeConfiguration = () => {
    if (!selectedKeyword || !projectNumber || items.every(item => !(typeof item === 'object' && item.selected))) {
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
    // Clear selected items
    setItems(items.map(item => (typeof item === 'object' ? { ...item, selected: false } : item)));
  };

  // Render configuration items
  const renderConfigurationItems = () => {
    return items.map((item, index) => {
      // Check if item is an object with a 'text' property
      const isObjectWithText = typeof item === 'object' && 'text' in item;
      // Use 'text' property if available, otherwise use item directly if it's a string
      const text = isObjectWithText ? item.text : (typeof item === 'string' ? item : '');
  
      return (
        <div key={index} className={`selectable result-item ${isObjectWithText && item.selected ? 'selected' : ''}`} onClick={() => selectItem(index)}>
          <span className="line-text">{text}</span>
          {isObjectWithText && item.hasPlaceholder && (
            <select onChange={(e) => handleSizeChange(e, index)}>
              <option value="default">Select Size</option>
              <option value="100mm">100mm</option>
              <option value="200mm">200mm</option>
              <option value="300mm">300mm</option>
            </select>
          )}
          <div className="count-info">(Count: 1/{items.length} - {(1 / items.length * 100).toFixed(2)}%)</div>
        </div>
      );
    });
  };

  const handleSizeChange = (e, index) => {
    // Handle size selection for an item
  };

  const renderSelectedConfigurationItems = () => {
    return items
      .filter(item => item.selected)
      .map((item, index) => {
        const text = typeof item === 'object' ? item.text : item;
        return (
          <div key={index} className="selected-configuration-item">
            {text}
          </div>
        );
      });
  };

  // Render completed configurations
  const renderCompletedConfigurations = () => {
    return configurations.map((config, index) => (
      <div key={index} className="accordion-item">
        <div className="accordion-header" onClick={() => toggleAccordion(index)}>
          {`${config.projectNumber}-${config.keyword}-${String(config.configCount).padStart(3, '0')}`}
        </div>
        <div className="accordion-content" style={{ display: config.isOpen ? 'block' : 'none' }}>
          {config.items.map((item, itemIndex) => (
            <div key={itemIndex} className="configuration-item">
              {typeof item === 'object' ? item.text : item}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  // Toggle accordion
  const toggleAccordion = (index) => {
    // Update state to re-render the accordion with the open/closed state
    setConfigurations(configurations.map((config, configIndex) => {
      if (configIndex === index) {
        return { ...config, isOpen: !config.isOpen };
      }
      return config;
    }));
  };

  const MachineCard = ({ keyword, onSelect }) => {
    return (
      <div className="card" onClick={() => onSelect(keyword)}>
        <img src={`${keyword}.png`} alt={keyword} className="card-image" />
        <div className="card-title">{keyword}</div>
      </div>
    );
  };

  return (
    <div className="App">
      <header>
        <div className="container">
          <img src="logo.png" alt="Logo" style={{ height: '60px', verticalAlign: 'middle' }} />
          <h1 style={{ display: 'inline', marginLeft: '15px' }}>Machine Configuration Analysis</h1>
        </div>
      </header>

      <div className="container card-container">
    {keywords.map(keyword => (
      <MachineCard key={keyword} keyword={keyword} onSelect={selectMachine} />
    ))}
  </div>

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
    {renderSelectedConfigurationItems()}
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
