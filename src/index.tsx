import ReactDOM from 'react-dom/client';
import {App} from './components/App';
import './style.css';

ReactDOM
  .createRoot(document.getElementById('app') as HTMLElement)
    .render(<App/>);