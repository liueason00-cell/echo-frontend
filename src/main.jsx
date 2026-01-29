// src/main.jsx 或项目入口
import './index.css'  // ← 这一行必须存在！
import App from './app.jsx'
import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)