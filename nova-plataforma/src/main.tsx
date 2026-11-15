import {createRoot} from 'react-dom/client';import App from './App';import '../../fontes/kit/kit_ds.css';import './style.css';import './design/brand.css';import {aplicarMarca} from './design/marca';
aplicarMarca();
createRoot(document.getElementById('root')!).render(<App/>);
