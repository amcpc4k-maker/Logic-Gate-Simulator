import { useState } from 'react'
import './App.css'



function App() {
  return (
    <div >
      <div className='HeaderTxt'>
      <h1> &#128009;LOGIC GATE SIMULATOR [V 1.0]</h1>
      </div>
      <p>Check Input Validation:</p>
      <label>0-9:</label>
      <input type='checkbox'></input>
      <label>T/F:</label>
      <input type='checkbox'></input>
      <label>%:</label>
      <input type='checkbox'></input>
      <label>00.00:</label>
      <input type='checkbox'></input><br></br>
      <textarea>eg. SET A = 1</textarea><br></br>
      <button>EXECUTE</button>
    </div>
  );
}

export default App;
