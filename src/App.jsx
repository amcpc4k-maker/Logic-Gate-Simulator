import { useState, useEffect } from 'react';
import { validateInput } from './logicHandler';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [rules, setRules] = useState({ 
    digits: false, 
    boolean: false, 
    percent: false, 
    decimal: false 
  });
  
  // Load saved history from localStorage on startup in Vercel 
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('logic_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('logic_history', JSON.stringify(history));
  }, [history]);

  const handleExecute = (e) => {
    e.preventDefault();
    const output = validateInput(inputText, rules);
    // Keep history at top, limited to 10 entries for cleanliness
    setHistory([output, ...history].slice(0, 10));
    setInputText(''); // Clears text area after execution
  };

  const toggleRule = (rule) => setRules(prev => ({ ...prev, [rule]: !prev[rule] }));


  return (
    <div className="container">
      <h1 className='HeaderTxt'> 🐉 LOGIC GATE SIMULATOR [V 1.0]</h1>
      
      <form onSubmit={handleExecute} className="control-panel">
        <p>Input Validation Parameters:</p>
        <div className="checkbox-row">
          <label><input type='checkbox' checked={rules.chars} onChange={() => toggleRule('chars')} /> A-Z</label>
          <label><input type='checkbox' checked={rules.digits} onChange={() => toggleRule('digits')} /> 0-9</label>
          <label><input type='checkbox' checked={rules.boolean} onChange={() => toggleRule('boolean')} /> T/F</label>
          <label><input type='checkbox' checked={rules.percent} onChange={() => toggleRule('percent')} /> %</label>
          <label><input type='checkbox' checked={rules.decimal} onChange={() => toggleRule('decimal')} /> 00.00</label>
        </div>
        
        <textarea 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter test data..."
        />
        <br />
        <button type="submit" className="exec-btn">EXECUTE</button>
      </form>

      <div className="log-container">
        <h3>Input History (Saved)</h3>
        <div className="log-list">
          {history.length === 0 ? (
            <p className="placeholder">System idle. Awaiting data...</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="log-item">
                <span className="log-time">[{item.time}]</span> 
                <span className="log-input">"{item.input}"</span>
                <span className="log-result">➔ {item.result}</span>
              </div>
            ))
          )}
        </div>
        {history.length > 0 && (
          <button className="clear-btn" onClick={() => setHistory([])}>Clear History</button>
        )}
      </div>
    </div>
  );
}

export default App;
