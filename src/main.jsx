import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// global.Buffer = global.Buffer || require('buffer').Buffer;

import { Buffer } from 'buffer';
window.Buffer = Buffer;


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
