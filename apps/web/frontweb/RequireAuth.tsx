import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const isLogged = !!localStorage.getItem('usuario_data');
  if (!isLogged) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
