import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BackendView } from './views/BackendView';
import './index.css';

function getRoute(): string {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return hash;
}

function Root() {
  const [route, setRoute] = React.useState(getRoute());

  React.useEffect(() => {
    const onChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  if (route === 'backend') {
    return <BackendView />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
