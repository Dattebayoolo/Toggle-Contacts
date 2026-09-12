export type AuthScreen = 'login' | 'signup';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
