export type UserRole = 'admin' | 'seller';

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

// Simulación de usuario autenticado (reemplazar por lógica real de auth)
export const currentUser: User = {
  id: 1,
  name: 'Administrador',
  role: 'admin', // Cambia a 'seller' para probar restricciones
};

// Exportar tipos solo para import type
export type { User as UserType, UserRole as UserRoleType };
