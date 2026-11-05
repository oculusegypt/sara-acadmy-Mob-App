import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './styles/theme.css';
import { initPWA } from './services/pwa';

initPWA();
createRoot(document.getElementById('root')!).render(<App />);
