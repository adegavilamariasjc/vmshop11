
import { createRoot } from 'react-dom/client'
import React from 'react' // Important: Make sure React is imported
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
