import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n/i18n';

function Root() {
  const [dir, setDir] = React.useState(localStorage.getItem('i18nextLng')?.startsWith('ar') ? 'rtl' : 'ltr');

  React.useEffect(() => {
    const handler = () => {
      const lng = localStorage.getItem('i18nextLng') || 'en';
      setDir(lng.startsWith('ar') ? 'rtl' : 'ltr');
      document.documentElement.dir = lng.startsWith('ar') ? 'rtl' : 'ltr';
    };
    window.addEventListener('languageChanged', handler);
    document.documentElement.dir = dir;
    return () => window.removeEventListener('languageChanged', handler);
  }, []);

  return <div dir={dir}><App /></div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
