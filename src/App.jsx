import { useState } from 'react'
import './App.css'



function App() {
  return (
    <div >
      <div className='HeaderTxt'>
      <h1>LOGIC GATE SIMULATOR [V 1.0]</h1>
      </div>
      <p>Check Input Validation:</p>
      <textarea>eg. SET A = 1</textarea><br></br>
      <button>EXECUTE</button>
    </div>
  );
}

export default App;
