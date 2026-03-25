// src/services/authAPI.ts
import axios, { AxiosResponse } from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/api/auth';

interface LoginPayload {
  email: string;
  password: string;
}

interface OtpPayload {
  email: string;
  otp: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  requiresOtp?: boolean;
}

interface UserData {
  id: number;
  email: string;
  name?: string;
  token?: string;
  accessToken?: string;
}

export const authAPI = {
  // Login with email/password
  login: (payload: LoginPayload): Promise<AxiosResponse<ApiResponse<UserData>>> =>
    axios.post(`${API_URL}/login`, payload),

  // Verify OTP for 2FA
  verifyOtp: (email: string, otp: string): Promise<AxiosResponse<ApiResponse<UserData>>> =>
    axios.post(`${API_URL}/verify-otp`, { email, otp }),

  // Resend OTP
  resendOtp: (email: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    axios.post(`${API_URL}/resend-otp`, { email }),
};