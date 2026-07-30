import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell, AuthFrame } from './components';
import { AppStateProvider, useAppState } from './state/AppState';
import {
  ChatScreen,
  CreateRequestScreen,
  DashboardScreen,
  DiscoveryScreen,
  EmptyStatesScreen,
  LoginScreen,
  MatchRequestsScreen,
  NotificationsScreen,
  ProfileSetupModal,
  SettingsScreen,
  TripsScreen,
  TravellerProfileScreen,
  UserProfileScreen,
} from './screens';

function AppRoutes() {
  const { state } = useAppState();

  if (!state.authenticated) {
    return (
      <AuthFrame>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthFrame>
    );
  }

  return (
    <AppShell>
      <ProfileSetupModal />
      <Routes>
        <Route path="/app/dashboard" element={<DashboardScreen />} />
        <Route path="/app/create-request" element={<CreateRequestScreen />} />
        <Route path="/app/discovery" element={<DiscoveryScreen />} />
        <Route path="/app/profile/:travellerId" element={<TravellerProfileScreen />} />
        <Route path="/app/matches" element={<MatchRequestsScreen />} />
        <Route path="/app/chat/:matchId" element={<ChatScreen />} />
        <Route path="/app/trips" element={<TripsScreen />} />
        <Route path="/app/notifications" element={<NotificationsScreen />} />
        <Route path="/app/profile" element={<UserProfileScreen />} />
        <Route path="/app/settings" element={<SettingsScreen />} />
        <Route path="/app/empty-states" element={<EmptyStatesScreen />} />
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppRoutes />
    </AppStateProvider>
  );
}