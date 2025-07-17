import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ReactGA 'react-ga4'

ReactGA.initialize("G-8GVSSPRZXM");
ReactGA.send({ hitType: "pageview", page: window.location.pathname, title: "Custom Title" });

createRoot(document.getElementById("root")!).render(<App />);
