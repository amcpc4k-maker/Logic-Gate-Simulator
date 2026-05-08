import { useState } from 'react';
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
  const [status, setStatus] = useState('System Idle...');

  const handleExecute = (e) => {
    e.preventDefault(); // Prevents page refresh
    const result = validateInput(inputText, rules);
    setStatus(result);
  };

  const toggleRule = (ruleName) => {
    setRules(prev => ({ ...prev, [ruleName]: !prev[ruleName] }));
  };

  return (
    <div className="container">
      <h1 className='HeaderTxt'> 🐉 LOGIC GATE SIMULATOR [V 1.0]</h1>
      
      <form onSubmit={handleExecute}>
        <p>Check Input Validation:</p>
        
        <label>0-9:</label>
        <input type='checkbox' onChange={() => toggleRule('digits')} />
        
        <label>T/F:</label>
        <input type='checkbox' onChange={() => toggleRule('boolean')} />
        
        <label>%:</label>
        <input type='checkbox' onChange={() => toggleRule('percent')} />
        
        <label>00.00:</label>
        <input type='checkbox' onChange={() => toggleRule('decimal')} />
        
        <br /><br />
        
        <textarea 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to validate..."
        />
        
        <br />
        <button type="submit">EXECUTE</button>
      </form>

      <div className="status-box">
        <p><strong>Result:</strong> {status}</p>
      </div>
    </div>
  );
}

export default App;
