export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type LuggageSize = 'Small' | 'Medium' | 'Large';
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type NotificationType = 'match' | 'request' | 'trip' | 'safety' | 'reminder';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  age: number | null;
  gender: Gender;
  profession: string | null;
  hometown: string | null;
  bio: string;
  verified: boolean;
  languages: string[];
  preferredDestinations: string[];
  womenOnly: boolean;
}

export interface TravelRequest {
  id: string;
  currentLocation: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  bags: number;
  bagSize: LuggageSize;
  pickupPoint: string;
  genderPreference: string;
  languages: string;
}

export interface Traveller {
  id: string;
  name: string;
  avatar: string;
  destination: string;
  distanceKm: number;
  departureTime: string;
  languages: string[];
  luggageCount: number;
  luggageSize: LuggageSize;
  compatibility: number;
  rating: number;
  savings: string;
  verified: boolean;
  gender: Gender;
  verifiedWoman: boolean;
  bio: string;
  about: string;
  previousSharedRides: number;
  mutualDestination: boolean;
  nearby: boolean;
}

export interface MatchRequest {
  id: string;
  travellerId: string;
  travellerName: string;
  destination: string;
  time: string;
  compatibility: number;
  createdAt: string;
  status: RequestStatus;
  source: 'incoming' | 'sent';
}

export interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
  time: string;
}

export interface Trip {
  id: string;
  destination: string;
  companion: string;
  fare: string;
  split: string;
  eta: string;
  pickupPoint: string;
  bags: string;
  status: 'Active' | 'Completed' | 'Pending';
  timeline: Array<{ label: string; state: 'done' | 'active' | 'pending' }>;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface AppSettings {
  notifications: boolean;
  locationSharing: boolean;
  privacyMode: 'standard' | 'locked';
  language: string;
  theme: 'Light' | 'System' | 'Dark';
  womenOnlyMatching: boolean;
}

export interface AppState {
  authenticated: boolean;
  needsProfileSetup: boolean;
  profile: UserProfile | null;
  travelRequest: TravelRequest | null;
  womenOnly: boolean;
  travellers: Traveller[];
  matchRequests: MatchRequest[];
  messages: Record<string, Message[]>;
  trips: Trip[];
  notifications: NotificationItem[];
  settings: AppSettings;
}

export interface CreateProfileInput {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  languages: string;
  preferredDestinations: string;
  bio: string;
  verified: boolean;
  womenOnly: boolean;
}

export interface CreateTravelRequestInput {
  currentLocation: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  bags: number;
  bagSize: LuggageSize;
  pickupPoint: string;
  genderPreference: string;
  languages: string;
}