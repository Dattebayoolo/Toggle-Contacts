export type AuthScreen = 'login';

export interface ToggleSessionUser {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
