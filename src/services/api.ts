const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) {
    throw new Error('Set VITE_API_BASE_URL to connect Hoply to your backend.');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Hoply API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  login(email: string, password: string) {
    return request<{ token: string; userId: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  getProfile() {
    return request('/profile/me');
  },
  upsertProfile(payload: unknown) {
    return request('/profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  createTravelRequest(payload: unknown) {
    return request('/travel-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getTravellers() {
    return request('/travellers');
  },
  getMatches() {
    return request('/matches');
  },
  sendMatchRequest(payload: unknown) {
    return request('/matches/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  respondToMatch(matchId: string, status: 'accepted' | 'declined') {
    return request(`/matches/${matchId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  getNotifications() {
    return request('/notifications');
  },
  getTrips() {
    return request('/trips');
  },
  sendMessage(matchId: string, message: string) {
    return request(`/matches/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};