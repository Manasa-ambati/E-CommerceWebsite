export interface AuthResponse {
  token?: string;
  accessToken?: string;
  user?: any;
  requiresOtp?: boolean;
  isNewUser?: boolean;
  email?: string;
  data?: {
    token?: string;
    accessToken?: string;
    user?: any;
    requiresOtp?: boolean;
    isNewUser?: boolean;
    email?: string;
  };
}

export interface LoginPayload {
  email: string;
  password?: string; // Optional for OTP-based login
}
