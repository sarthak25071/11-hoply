const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

const TOKEN_KEY = 'hoply-access-token';

function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) {
    throw new Error('Set VITE_API_BASE_URL to connect Hoply to your backend.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(init?.headers as Record<string, string> ?? {}),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.detail ?? `Request failed (${response.status})`;
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface UserResponse {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  age: number | null;
  gender: string;
  description: string | null;
  profession: string | null;
  hometown: string | null;
  profilePhoto: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  age?: number | null;
  gender?: string;
  description?: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  age?: number | null;
  gender?: string;
  description?: string | null;
  profession?: string | null;
  hometown?: string | null;
  profilePhoto?: string | null;
}

export const api = {
  login(email: string, password: string) {
    return request<TokenResponse>('/auth/token', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(payload: RegisterPayload) {
    return request<UserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProfile() {
    return request<UserResponse>('/users/me');
  },

  updateProfile(payload: UpdateProfilePayload) {
    return request<UserResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  createTravelRequest(payload: unknown) {
    return request('/travel-plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getTravellers() {
    return request<unknown[]>('/discovery/travellers');
  },

  getMatches() {
    return request<unknown[]>('/matches');
  },

  sendMatchRequest(travellerId: string) {
    return request('/matches', {
      method: 'POST',
      body: JSON.stringify({ travellerId }),
    });
  },

  respondToMatch(matchId: string, status: string) {
    return request(`/matches/${matchId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getNotifications() {
    return request<unknown[]>('/notifications');
  },

  getTrips() {
    return request<unknown[]>('/travel-plans');
  },

  sendMessage(matchId: string, message: string) {
    return request(`/matches/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};
