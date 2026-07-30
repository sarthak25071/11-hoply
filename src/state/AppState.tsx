import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  demoMatchRequests,
  demoMessages,
  demoNotifications,
  demoProfile,
  demoSettings,
  demoTravelRequest,
  demoTravellers,
  demoTrips,
} from '../data/mock';
import type {
  AppSettings,
  AppState,
  CreateProfileInput,
  CreateTravelRequestInput,
  MatchRequest,
  Message,
  NotificationItem,
  UserProfile,
} from '../types';

type AppStateContextValue = {
  state: AppState;
  login: (email: string, password: string) => void;
  logout: () => void;
  saveProfile: (input: CreateProfileInput) => void;
  createTravelRequest: (input: CreateTravelRequestInput) => void;
  toggleWomenOnly: (value: boolean) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  sendMatchRequest: (travellerId: string) => void;
  respondToRequest: (matchId: string, status: 'accepted' | 'declined') => void;
  sendMessage: (matchId: string, text: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

const STORAGE_KEYS = {
  authenticated: 'hoply-authenticated',
  profile: 'hoply-profile',
  settings: 'hoply-settings',
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

function readStoredProfile(): UserProfile | null {
  const raw = localStorage.getItem(STORAGE_KEYS.profile);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

function readStoredSettings(): AppSettings {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  return raw ? ({ ...demoSettings, ...(JSON.parse(raw) as Partial<AppSettings>) }) : demoSettings;
}

function readAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEYS.authenticated) === 'true';
}

function buildNotification(type: NotificationItem['type'], title: string, message: string): NotificationItem {
  return {
    id: `note-${Date.now()}`,
    type,
    title,
    message,
    time: 'Just now',
    read: false,
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    authenticated: readAuthenticated(),
    needsProfileSetup: !readStoredProfile(),
    profile: readStoredProfile(),
    travelRequest: demoTravelRequest,
    womenOnly: readStoredSettings().womenOnlyMatching,
    travellers: demoTravellers,
    matchRequests: demoMatchRequests,
    messages: demoMessages,
    trips: demoTrips,
    notifications: demoNotifications,
    settings: readStoredSettings(),
  }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.authenticated, String(state.authenticated));
  }, [state.authenticated]);

  useEffect(() => {
    if (state.profile) {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.profile));
    }
  }, [state.profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }, [state.settings]);

  const value = useMemo<AppStateContextValue>(() => ({
    state,
    login(email: string) {
      setState(previous => ({
        ...previous,
        authenticated: true,
        needsProfileSetup: !previous.profile,
        profile: previous.profile ?? {
          ...demoProfile,
          email,
        },
      }));
    },
    logout() {
      setState(previous => ({ ...previous, authenticated: false }));
    },
    saveProfile(input: CreateProfileInput) {
      const profile: UserProfile = {
        id: `user-${Date.now()}`,
        name: input.name,
        email: input.email,
        phone: input.phone,
        photo: input.name
          .split(' ')
          .map(part => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        gender: input.gender,
        verified: input.verified,
        languages: input.languages.split(',').map(language => language.trim()).filter(Boolean),
        preferredDestinations: input.preferredDestinations.split(',').map(destination => destination.trim()).filter(Boolean),
        bio: input.bio,
        womenOnly: input.womenOnly,
      };

      setState(previous => ({
        ...previous,
        profile,
        needsProfileSetup: false,
        womenOnly: input.womenOnly,
        settings: {
          ...previous.settings,
          womenOnlyMatching: input.womenOnly,
        },
      }));
    },
    createTravelRequest(input: CreateTravelRequestInput) {
      setState(previous => ({
        ...previous,
        travelRequest: {
          id: `request-${Date.now()}`,
          ...input,
        },
        notifications: [
          buildNotification('match', 'Travel request created', 'Your request is live. Nearby travellers can now see you.'),
          ...previous.notifications,
        ],
      }));
    },
    toggleWomenOnly(value: boolean) {
      setState(previous => ({
        ...previous,
        womenOnly: value,
        settings: {
          ...previous.settings,
          womenOnlyMatching: value,
        },
      }));
    },
    updateSettings(patch: Partial<AppSettings>) {
      setState(previous => ({
        ...previous,
        settings: {
          ...previous.settings,
          ...patch,
        },
      }));
    },
    sendMatchRequest(travellerId: string) {
      const traveller = state.travellers.find(entry => entry.id === travellerId);
      if (!traveller) {
        return;
      }

      const request: MatchRequest = {
        id: `sent-${Date.now()}`,
        travellerId: traveller.id,
        travellerName: traveller.name,
        destination: traveller.destination,
        time: traveller.departureTime,
        compatibility: traveller.compatibility,
        createdAt: 'Just now',
        status: 'pending',
        source: 'sent',
      };

      setState(previous => ({
        ...previous,
        matchRequests: [request, ...previous.matchRequests],
        notifications: [
          buildNotification('request', 'Request sent', `Your request to ${traveller.name} is waiting for a response.`),
          ...previous.notifications,
        ],
      }));
    },
    respondToRequest(matchId: string, status: 'accepted' | 'declined') {
      const request = state.matchRequests.find(entry => entry.id === matchId);
      if (!request) {
        return;
      }

      setState(previous => ({
        ...previous,
        matchRequests: previous.matchRequests.map(entry =>
          entry.id === matchId ? { ...entry, status } : entry,
        ),
        notifications: [
          buildNotification(
            status === 'accepted' ? 'match' : 'request',
            status === 'accepted' ? 'Match confirmed' : 'Request declined',
            status === 'accepted'
              ? `${request.travellerName} accepted your travel request. Chat is now open.`
              : `${request.travellerName} declined the request. You can keep browsing nearby travellers.`,
          ),
          ...previous.notifications,
        ],
        trips:
          status === 'accepted'
            ? [
                {
                  id: `trip-${Date.now()}`,
                  destination: request.destination,
                  companion: request.travellerName,
                  fare: '₹980',
                  split: '₹490 each',
                  eta: '42 mins',
                  pickupPoint: 'Main Exit Gate 1',
                  bags: '2 bags, Medium',
                  status: 'Active',
                  timeline: [
                    { label: 'Request created', state: 'done' },
                    { label: 'Match accepted', state: 'done' },
                    { label: 'Pickup confirmed', state: 'active' },
                    { label: 'Ride completed', state: 'pending' },
                  ],
                },
                ...previous.trips,
              ]
            : previous.trips,
      }));
    },
    sendMessage(matchId: string, text: string) {
      if (!text.trim()) {
        return;
      }

      const message: Message = {
        id: `msg-${Date.now()}`,
        sender: 'me',
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setState(previous => ({
        ...previous,
        messages: {
          ...previous.messages,
          [matchId]: [...(previous.messages[matchId] ?? []), message],
        },
      }));
    },
    markNotificationRead(id: string) {
      setState(previous => ({
        ...previous,
        notifications: previous.notifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification,
        ),
      }));
    },
    markAllNotificationsRead() {
      setState(previous => ({
        ...previous,
        notifications: previous.notifications.map(notification => ({ ...notification, read: true })),
      }));
    },
  }), [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }

  return context;
}