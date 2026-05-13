import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClientLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login/client', { replace: true });
  }, [navigate]);

  return null;
}
