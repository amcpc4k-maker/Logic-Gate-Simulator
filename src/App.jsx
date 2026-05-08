import { useState } from 'react';
import { validateInput } from './logicHandler';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [rules, setRules] = useState({ digits: false, boolean: false, percent: false, decimal: false });
  
  // This state holds the list of all results
  const [history, setHistory] = useState([]);

  const handleExecute = (e) => {
    e.preventDefault();
    const output = validateInput(inputText, rules);
    
    // This "spits out" the new result at the TOP of the list
    setHistory([output, ...history]);
  };

  const toggleRule = (ruleName) => {
    setRules(prev => ({ ...prev, [ruleName]: !prev[ruleName] }));
  };

  return (
    <div className="container">
      <h1 className='HeaderTxt'> 🐉 LOGIC GATE SIMULATOR [V 1.0]</h1>
      
      <form onSubmit={handleExecute}>
        <p>Check Input Validation:</p>
        <div className="checkbox-group">
          <label>0-9: <input type='checkbox' onChange={() => toggleRule('digits')} /></label>
          <label>T/F: <input type='checkbox' onChange={() => toggleRule('boolean')} /></label>
          <label>%: <input type='checkbox' onChange={() => toggleRule('percent')} /></label>
          <label>00.00: <input type='checkbox' onChange={() => toggleRule('decimal')} /></label>
        </div>
        
        <br />
        <textarea 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter test data..."
        />
        <br />
        <button type="submit">EXECUTE</button>
      </form>

      <hr />

      {/* THE OUTPUT LOG */}
      <div className="log-container">
        <h3>Execution History</h3>
        {history.length === 0 ? (
          <p className="placeholder">Waiting for input...</p>
        ) : (
          <div className="log-list">
            {history.map((item, index) => (
              <div key={index} className="log-item">
                <span className="log-time">[{item.time}]</span> 
                <span className="log-input"> Input: "{item.input}" </span> 
                <span className="log-status">→ {item.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
