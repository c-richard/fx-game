import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import { v4 as uuidv4 } from 'uuid'

if (localStorage.getItem('id') == undefined)
    localStorage.setItem('id', uuidv4())

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
