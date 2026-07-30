import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppState } from './state/AppState';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyStateCard,
  Input,
  Modal,
  PageHeader,
  Select,
  StatTile,
  TextArea,
  Toggle,
} from './components';
import type { CreateProfileInput, CreateTravelRequestInput, Traveller } from './types';

function travellerEmoji(traveller: Traveller) {
  if (traveller.gender === 'woman' && traveller.verifiedWoman) {
    return 'Verified woman';
  }

  return traveller.verified ? 'Verified traveller' : 'Traveller';
}

export function LoginScreen() {
  const { login, state } = useAppState();
  const navigate = useNavigate();
  const [email, setEmail] = useState('rahul@hoply.app');
  const [password, setPassword] = useState('password');

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login(email, password);
    navigate('/app/dashboard');
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="brand brand-large">
          <span className="brand-mark">H</span>
          <span>
            Hoply
            <small>Find your travel companion</small>
          </span>
        </div>
        <div className="hero-copy">
          <Badge tone="success">Travel buddy platform</Badge>
          <h1>Find your travel buddy. Share the journey. Save more.</h1>
          <p>
            Hoply connects verified travellers going to the same destination before the taxi is booked, so rides are safer,
            cheaper and easier to coordinate.
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate('/app/create-request')}>Create Trip</Button>
            <Button variant="secondary" onClick={() => navigate('/app/discovery')}>Browse Travellers</Button>
          </div>
          <div className="hero-metrics">
            <StatTile label="Trusted travellers" value="10,000+" />
            <StatTile label="Average savings" value="45%" accent="blue" />
            <StatTile label="Verified women" value="Safety first" accent="dark" />
          </div>
        </div>
        <div className="hero-illustration">
          <div className="plane plane-a" />
          <div className="plane plane-b" />
          <div className="airport-card">
            <div className="airport-roof" />
            <div className="airport-tower" />
            <div className="traveller traveller-a">RS</div>
            <div className="traveller traveller-b">PK</div>
            <div className="airport-road" />
          </div>
        </div>
      </section>

      <section className="auth-card">
        <h2>Welcome back</h2>
        <p>Log in to continue.</p>
        <div className="stack">
          <Button variant="secondary">Continue with Google</Button>
          <Button variant="secondary">Continue with Apple</Button>
        </div>
        <div className="divider">or</div>
        <form className="stack" onSubmit={handleLogin}>
          <Input label="Email address" value={email} onChange={event => setEmail(event.target.value)} />
          <Input label="Password" type="password" value={password} onChange={event => setPassword(event.target.value)} />
          <Button type="submit">Log in</Button>
        </form>
        <p className="auth-note">
          {state.profile ? 'A profile already exists in this session.' : 'After login, Hoply will prompt you to create a profile if one does not exist.'}
        </p>
      </section>
    </div>
  );
}

export function DashboardScreen() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const profileName = state.profile?.name ?? 'Rahul';
  const upcomingTrip = state.trips.find(trip => trip.status === 'Active') ?? state.trips[0];
  const recentMatches = state.matchRequests.slice(0, 4);

  return (
    <div className="page-grid">
      <PageHeader
        title={`Good morning, ${profileName.split(' ')[0]}.`}
        subtitle="Your airport travel companion dashboard. Review trips, match requests and quick actions from one place."
        actions={<Button variant="secondary" onClick={() => navigate('/app/create-request')}>Create Trip</Button>}
      />

      <div className="dashboard-grid">
        <Card className="hero-panel">
          <div className="card-head">
            <div>
              <p className="eyebrow">Upcoming trip</p>
              <h3>{upcomingTrip.destination}</h3>
            </div>
            <Badge tone="success">Confirmed</Badge>
          </div>
          <div className="trip-route">
            <span>Airport</span>
            <div className="trip-line" />
            <span>{upcomingTrip.destination}</span>
          </div>
          <div className="inline-kpis">
            <StatTile label="ETA" value={upcomingTrip.eta} />
            <StatTile label="Fare split" value={upcomingTrip.split} accent="blue" />
            <StatTile label="Pickup" value={upcomingTrip.pickupPoint} accent="dark" />
          </div>
          <div className="card-actions">
            <Button onClick={() => navigate('/app/chat/match-1')}>Open chat</Button>
            <Button variant="secondary" onClick={() => navigate('/app/trips')}>View trip details</Button>
          </div>
        </Card>

        <Card className="quick-actions-card">
          <p className="eyebrow">Quick actions</p>
          <div className="quick-actions-list">
            <button type="button" className="quick-action" onClick={() => navigate('/app/create-request')}>Create Trip</button>
            <button type="button" className="quick-action" onClick={() => navigate('/app/discovery')}>Find Travellers</button>
            <button type="button" className="quick-action" onClick={() => navigate('/app/matches')}>My Requests</button>
            <button type="button" className="quick-action" onClick={() => navigate('/app/notifications')}>Notifications</button>
          </div>
          <div className="invite-card">
            <strong>Invite a friend</strong>
            <p>Share your request link and connect faster.</p>
            <Button variant="secondary">Copy invite</Button>
          </div>
        </Card>

        <Card className="section-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Recent matches</p>
              <h3>Compatible travellers</h3>
            </div>
            <Link to="/app/discovery">View all</Link>
          </div>
          <div className="avatar-row">
            {recentMatches.map(match => {
              const traveller = state.travellers.find(entry => entry.id === match.travellerId);
              return (
                <div key={match.id} className="mini-profile" onClick={() => navigate(`/app/profile/${match.travellerId}`)} role="button" tabIndex={0}>
                  <Avatar initials={traveller?.avatar ?? match.travellerName.slice(0, 2)} />
                  <strong>{match.travellerName}</strong>
                  <span>{match.destination}</span>
                  <Badge tone="success">{match.compatibility}%</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="section-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">System summary</p>
              <h3>Backend-ready structure</h3>
            </div>
          </div>
          <div className="summary-list">
            <div><strong>Profile status</strong><span>{state.profile ? 'Profile saved' : 'Needs setup'}</span></div>
            <div><strong>Women-only mode</strong><span>{state.womenOnly ? 'Enabled' : 'Off'}</span></div>
            <div><strong>Notifications</strong><span>{state.notifications.filter(note => !note.read).length} unread</span></div>
            <div><strong>Travel request</strong><span>{state.travelRequest ? 'Active' : 'None'}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function CreateRequestScreen() {
  const { createTravelRequest, state } = useAppState();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateTravelRequestInput>({
    currentLocation: 'Kempegowda International Airport, BLR',
    destination: 'Whitefield, Bengaluru',
    date: '24 May 2024',
    time: '08:30 PM',
    passengers: 2,
    bags: 2,
    bagSize: 'Medium',
    pickupPoint: 'Main Exit Gate 1',
    genderPreference: 'No Preference',
    languages: 'English, Hindi',
  });

  function updateField<K extends keyof CreateTravelRequestInput>(field: K, value: CreateTravelRequestInput[K]) {
    setForm(previous => ({ ...previous, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createTravelRequest(form);
    setOpen(true);
  }

  return (
    <div className="page-grid narrow-page">
      <PageHeader title="Create Travel Request" subtitle="Fill in your trip details so nearby travellers can discover you instantly." />
      <Card>
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input label="Current location" value={form.currentLocation} onChange={event => updateField('currentLocation', event.target.value)} />
          <Input label="Destination" value={form.destination} onChange={event => updateField('destination', event.target.value)} />
          <Input label="Date" value={form.date} onChange={event => updateField('date', event.target.value)} />
          <Input label="Time" value={form.time} onChange={event => updateField('time', event.target.value)} />
          <Input label="Passengers" type="number" value={form.passengers} onChange={event => updateField('passengers', Number(event.target.value))} />
          <Input label="Number of bags" type="number" value={form.bags} onChange={event => updateField('bags', Number(event.target.value))} />
          <Select label="Bag size" value={form.bagSize} onChange={event => updateField('bagSize', event.target.value as CreateTravelRequestInput['bagSize'])}>
            <option>Small</option>
            <option>Medium</option>
            <option>Large</option>
          </Select>
          <Input label="Preferred pickup point" value={form.pickupPoint} onChange={event => updateField('pickupPoint', event.target.value)} />
          <Input label="Preferred gender (optional)" value={form.genderPreference} onChange={event => updateField('genderPreference', event.target.value)} />
          <Input label="Languages spoken" value={form.languages} onChange={event => updateField('languages', event.target.value)} />
          <div className="form-footer">
            <Button type="submit">Publish Request</Button>
          </div>
        </form>
      </Card>

      <Modal open={open} title="Travel request created" onClose={() => setOpen(false)}>
        <p>Your request is now live. Nearby travellers can see it and match by destination, time and luggage compatibility.</p>
        <div className="modal-actions">
          <Button onClick={() => navigate('/app/discovery')}>See matching profiles</Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>Stay here</Button>
        </div>
        {state.travelRequest ? <div className="modal-summary">Current request: {state.travelRequest.destination}</div> : null}
      </Modal>
    </div>
  );
}

export function DiscoveryScreen() {
  const { state, toggleWomenOnly, sendMatchRequest } = useAppState();
  const navigate = useNavigate();
  const travellers = useMemo(() => {
    const filtered = state.travellers.filter(traveller => traveller.nearby);
    if (!state.womenOnly) {
      return filtered;
    }

    return filtered.filter(traveller => traveller.gender === 'woman' && traveller.verifiedWoman);
  }, [state.travellers, state.womenOnly]);

  return (
    <div className="page-grid split-page">
      <div>
        <PageHeader
          title="Nearby Traveller Discovery"
          subtitle="Browse compatible travellers nearby. Filter for verified women-only matching when safety-first discovery matters."
        />
        <div className="filter-bar">
          <Toggle checked={state.womenOnly} onChange={toggleWomenOnly} label="Verified women only" hint="Only show verified women profiles" />
          <Badge tone="info">Nearby first</Badge>
          <Badge tone="success">Compatibility sorted</Badge>
        </div>

        <div className="traveller-list">
          {travellers.map(traveller => (
            <Card key={traveller.id} className="traveller-card">
              <div className="traveller-card-top">
                <Avatar initials={traveller.avatar} />
                <div>
                  <h3>{traveller.name}</h3>
                  <p>{traveller.destination}</p>
                  <Badge tone={traveller.verifiedWoman ? 'success' : 'info'}>{travellerEmoji(traveller)}</Badge>
                </div>
                <div className="compatibility-pill">{traveller.compatibility}% match</div>
              </div>
              <div className="traveller-meta">
                <span>{traveller.distanceKm} km away</span>
                <span>{traveller.departureTime}</span>
                <span>{traveller.luggageCount} bags</span>
                <span>{traveller.luggageSize}</span>
              </div>
              <p className="muted">{traveller.bio}</p>
              <div className="traveller-tags">
                {traveller.languages.map(language => <Badge key={language}>{language}</Badge>)}
                <Badge tone="warning">Save {traveller.savings}</Badge>
              </div>
              <div className="card-actions">
                <Button variant="secondary" onClick={() => navigate(`/app/profile/${traveller.id}`)}>View profile</Button>
                <Button onClick={() => sendMatchRequest(traveller.id)}>Send request</Button>
              </div>
            </Card>
          ))}

          {travellers.length === 0 ? (
            <EmptyStateCard
              title="No verified women travellers right now"
              description="Try switching off the women-only filter or wait for more nearby profiles to appear."
              action={<Button variant="secondary" onClick={() => toggleWomenOnly(false)}>Show all travellers</Button>}
            />
          ) : null}
        </div>
      </div>

      <Card className="map-panel">
        <p className="eyebrow">Discovery map</p>
        <div className="map-illustration">
          <div className="map-pin pin-a" />
          <div className="map-pin pin-b" />
          <div className="map-route" />
        </div>
        <div className="map-summary">
          <div><strong>Nearby travellers</strong><span>{travellers.length}</span></div>
          <div><strong>Women-only mode</strong><span>{state.womenOnly ? 'On' : 'Off'}</span></div>
          <div><strong>Average savings</strong><span>₹420</span></div>
        </div>
      </Card>
    </div>
  );
}

export function TravellerProfileScreen() {
  const { travellerId } = useParams();
  const navigate = useNavigate();
  const { state, sendMatchRequest } = useAppState();
  const traveller = state.travellers.find(entry => entry.id === travellerId) ?? state.travellers[0];
  const [open, setOpen] = useState(false);

  return (
    <div className="page-grid split-page">
      <div>
        <PageHeader title={traveller.name} subtitle={traveller.about} actions={<Button variant="secondary" onClick={() => navigate('/app/discovery')}>Back</Button>} />
        <Card className="profile-hero">
          <div className="profile-top">
            <Avatar initials={traveller.avatar} className="avatar-large" />
            <div>
              <div className="profile-title-row">
                <h2>{traveller.name}</h2>
                {traveller.verified ? <Badge tone="success">Verified</Badge> : null}
              </div>
              <p className="muted">{traveller.destination}</p>
            </div>
            <div className="profile-match">{traveller.compatibility}% compatible</div>
          </div>
          <div className="profile-grid">
            <StatTile label="Distance" value={`${traveller.distanceKm} km`} />
            <StatTile label="Departure" value={traveller.departureTime} accent="blue" />
            <StatTile label="Previous shared rides" value={`${traveller.previousSharedRides}`} accent="dark" />
          </div>
          <div className="profile-section">
            <h3>About</h3>
            <p>{traveller.about}</p>
          </div>
          <div className="profile-section">
            <h3>Languages</h3>
            <div className="traveller-tags">{traveller.languages.map(language => <Badge key={language}>{language}</Badge>)}</div>
          </div>
          <div className="profile-section">
            <h3>Luggage</h3>
            <p>{traveller.luggageCount} bags, {traveller.luggageSize}</p>
          </div>
          <div className="profile-section">
            <h3>Ratings</h3>
            <p>{traveller.rating} / 5 from shared journeys</p>
          </div>
          <div className="card-actions">
            <Button onClick={() => { sendMatchRequest(traveller.id); setOpen(true); }}>Send request</Button>
            <Button variant="secondary" onClick={() => navigate('/app/matches')}>Track request</Button>
          </div>
        </Card>
      </div>

      <Card className="profile-side-card">
        <p className="eyebrow">Mutual destination</p>
        <h3>{traveller.mutualDestination ? 'Same route' : 'Compatible route'}</h3>
        <p>{traveller.mutualDestination ? 'This traveller is going to the same destination and can share a taxi.' : 'Not the same exact destination, but still a compatible airport route.'}</p>
        <div className="route-snapshot">
          <span>Airport</span>
          <div className="trip-line" />
          <span>{traveller.destination}</span>
        </div>
        <div className="sidebar-stack">
          <div><strong>Verified women ready</strong><span>{traveller.verifiedWoman ? 'Yes' : 'No'}</span></div>
          <div><strong>Estimated savings</strong><span>{traveller.savings}</span></div>
          <div><strong>Shared rides</strong><span>{traveller.previousSharedRides}</span></div>
        </div>
        <Button variant="secondary" onClick={() => navigate('/app/chat/match-1')}>Open chat</Button>
      </Card>

      <Modal open={open} title="Request sent" onClose={() => setOpen(false)}>
        <p>Your request has been sent. You can track the status from Match Requests while the other traveller reviews it.</p>
        <div className="modal-actions">
          <Button onClick={() => navigate('/app/matches')}>Track request</Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}

export function MatchRequestsScreen() {
  const { state, respondToRequest } = useAppState();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'incoming' | 'sent' | 'history'>('incoming');

  const filtered = state.matchRequests.filter(request => {
    if (tab === 'history') {
      return request.status !== 'pending';
    }

    return request.source === tab && request.status === 'pending';
  });

  return (
    <div className="page-grid narrow-page">
      <PageHeader title="Match Requests" subtitle="Review incoming requests, track sent requests, and keep the matching flow transparent." />
      <div className="tabs">
        {(['incoming', 'sent', 'history'] as const).map(value => (
          <button key={value} className={`tab ${tab === value ? 'tab-active' : ''}`} onClick={() => setTab(value)} type="button">{value}</button>
        ))}
      </div>
      <div className="stack">
        {filtered.map(request => (
          <Card key={request.id} className="request-card">
            <div className="card-head">
              <div>
                <h3>{request.travellerName}</h3>
                <p>{request.destination}</p>
              </div>
              <Badge tone={request.status === 'pending' ? 'warning' : request.status === 'accepted' ? 'success' : 'danger'}>{request.status}</Badge>
            </div>
            <div className="request-meta">
              <span>{request.time}</span>
              <span>{request.compatibility}% compatible</span>
              <span>{request.createdAt}</span>
            </div>
            {request.status === 'pending' && request.source === 'incoming' ? (
              <div className="card-actions">
                <Button onClick={() => respondToRequest(request.id, 'accepted')}>Accept</Button>
                <Button variant="secondary" onClick={() => respondToRequest(request.id, 'declined')}>Decline</Button>
              </div>
            ) : null}
            {request.status === 'accepted' ? <Button variant="secondary" onClick={() => navigate('/app/chat/match-1')}>Open chat</Button> : null}
          </Card>
        ))}

        {filtered.length === 0 ? (
          <EmptyStateCard title="No requests here yet" description="Incoming, sent and history tabs will fill up as you match with travellers." action={<Button variant="secondary" onClick={() => navigate('/app/discovery')}>Browse travellers</Button>} />
        ) : null}
      </div>
    </div>
  );
}

export function ChatScreen() {
  const { matchId } = useParams();
  const { state, sendMessage } = useAppState();
  const navigate = useNavigate();
  const conversation = state.messages[matchId ?? 'match-1'] ?? [];
  const traveller = state.travellers[0];
  const [draft, setDraft] = useState('');

  return (
    <div className="page-grid split-page">
      <div>
        <PageHeader title={`Chat with ${traveller.name}`} subtitle="Use chat to confirm pickup, split fare and coordinate before the ride starts." actions={<Button variant="secondary" onClick={() => navigate('/app/trips')}>Trip details</Button>} />
        <Card className="chat-card">
          <div className="chat-summary">
            <div><strong>Trip</strong><span>{state.trips[0]?.destination}</span></div>
            <div><strong>Fare split</strong><span>{state.trips[0]?.split}</span></div>
            <div><strong>Pickup</strong><span>{state.trips[0]?.pickupPoint}</span></div>
          </div>
          <div className="chat-thread">
            {conversation.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                <p>{message.text}</p>
                <span>{message.time}</span>
              </div>
            ))}
          </div>
          <form
            className="chat-compose"
            onSubmit={event => {
              event.preventDefault();
              sendMessage(matchId ?? 'match-1', draft);
              setDraft('');
            }}
          >
            <Input placeholder="Type a message..." value={draft} onChange={event => setDraft(event.target.value)} />
            <Button type="submit">Send</Button>
          </form>
        </Card>
      </div>

      <Card className="chat-side-card">
        <p className="eyebrow">Shared trip summary</p>
        <h3>{state.trips[0]?.destination}</h3>
        <div className="sidebar-stack">
          <div><strong>Fare estimate</strong><span>{state.trips[0]?.fare}</span></div>
          <div><strong>Share per person</strong><span>{state.trips[0]?.split}</span></div>
          <div><strong>Location sharing</strong><span>Enabled</span></div>
        </div>
        <Button variant="secondary" onClick={() => navigate('/app/trips')}>Mark ride confirmed</Button>
      </Card>
    </div>
  );
}

export function TripsScreen() {
  const { state } = useAppState();
  const activeTrip = state.trips.find(trip => trip.status === 'Active') ?? state.trips[0];

  return (
    <div className="page-grid split-page">
      <div>
        <PageHeader title="Trip Details & Past Trips" subtitle="Track the active ride, review your fare split and revisit completed journeys." />
        <Card className="trip-detail-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Active trip</p>
              <h3>{activeTrip.destination}</h3>
            </div>
            <Badge tone="success">{activeTrip.status}</Badge>
          </div>
          <div className="trip-map" />
          <div className="sidebar-stack">
            <div><strong>Companion</strong><span>{activeTrip.companion}</span></div>
            <div><strong>Fare</strong><span>{activeTrip.fare}</span></div>
            <div><strong>Split</strong><span>{activeTrip.split}</span></div>
            <div><strong>ETA</strong><span>{activeTrip.eta}</span></div>
            <div><strong>Pickup</strong><span>{activeTrip.pickupPoint}</span></div>
            <div><strong>Luggage</strong><span>{activeTrip.bags}</span></div>
          </div>
          <div className="timeline">
            {activeTrip.timeline.map(step => (
              <div key={step.label} className={`timeline-step timeline-${step.state}`}>
                <span className="timeline-dot" />
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.state === 'active' ? 'In progress' : step.state === 'done' ? 'Completed' : 'Pending'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="trip-history-card">
        <p className="eyebrow">Past trips</p>
        <div className="stack">
          {state.trips.filter(trip => trip.status === 'Completed').map(trip => (
            <div key={trip.id} className="past-trip-item">
              <strong>{trip.destination}</strong>
              <span>{trip.split}</span>
              <Badge tone="success">Completed</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function NotificationsScreen() {
  const { state, markAllNotificationsRead, markNotificationRead } = useAppState();
  return (
    <div className="page-grid narrow-page">
      <PageHeader title="Notifications" subtitle="Match alerts, request updates and trip reminders arrive here." actions={<Button variant="secondary" onClick={markAllNotificationsRead}>Mark all as read</Button>} />
      <div className="stack">
        {state.notifications.map(notification => (
          <Card key={notification.id} className={`notification-card ${notification.read ? 'notification-read' : ''}`}>
            <div className="card-head">
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
              </div>
              <Badge tone={notification.type === 'match' ? 'success' : notification.type === 'request' ? 'info' : 'warning'}>{notification.time}</Badge>
            </div>
            {!notification.read ? <Button variant="secondary" onClick={() => markNotificationRead(notification.id)}>Mark read</Button> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

export function UserProfileScreen() {
  const { state } = useAppState();
  const profile = state.profile;

  return (
    <div className="page-grid split-page">
      <div>
        <PageHeader title="User Profile" subtitle="Personal information, travel preferences, languages and ride history in one place." />
        <Card className="profile-hero">
          <div className="profile-top">
            <Avatar initials={profile?.photo ?? 'RS'} className="avatar-large" />
            <div>
              <div className="profile-title-row">
                <h2>{profile?.name ?? 'Rahul Sharma'}</h2>
                {profile?.verified ? <Badge tone="success">Verified</Badge> : null}
              </div>
              <p className="muted">{profile?.email}</p>
            </div>
          </div>
          <div className="profile-grid">
            <StatTile label="Trips saved" value="12" />
            <StatTile label="Matches" value="8" accent="blue" />
            <StatTile label="Rating" value="4.8" accent="dark" />
          </div>
          <div className="profile-section">
            <h3>Travel preferences</h3>
            <p>{profile?.bio}</p>
          </div>
          <div className="profile-section">
            <h3>Languages</h3>
            <div className="traveller-tags">{profile?.languages.map(language => <Badge key={language}>{language}</Badge>)}</div>
          </div>
          <div className="profile-section">
            <h3>Saved destinations</h3>
            <div className="traveller-tags">{profile?.preferredDestinations.map(destination => <Badge key={destination} tone="info">{destination}</Badge>)}</div>
          </div>
        </Card>
      </div>

      <Card className="profile-side-card">
        <p className="eyebrow">Ride history</p>
        <div className="stack">
          {state.trips.map(trip => (
            <div key={trip.id} className="past-trip-item">
              <strong>{trip.destination}</strong>
              <span>{trip.status}</span>
              <Badge tone={trip.status === 'Completed' ? 'success' : 'info'}>{trip.split}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function SettingsScreen() {
  const { state, updateSettings } = useAppState();
  return (
    <div className="page-grid narrow-page">
      <PageHeader title="Settings" subtitle="Notifications, privacy, location permissions and theme preferences." />
      <Card className="stack">
        <Toggle checked={state.settings.notifications} onChange={value => updateSettings({ notifications: value })} label="Notifications" hint="Travel request and match alerts" />
        <Toggle checked={state.settings.locationSharing} onChange={value => updateSettings({ locationSharing: value })} label="Location sharing" hint="Share pickup area only after consent" />
        <Toggle checked={state.settings.womenOnlyMatching} onChange={value => updateSettings({ womenOnlyMatching: value })} label="Women-only matching" hint="Prefer verified women profiles in discovery" />
        <Select label="Language" value={state.settings.language} onChange={event => updateSettings({ language: event.target.value })}>
          <option>English</option>
          <option>Hindi</option>
          <option>Kannada</option>
        </Select>
        <Select label="Theme" value={state.settings.theme} onChange={event => updateSettings({ theme: event.target.value as 'Light' | 'System' | 'Dark' })}>
          <option>Light</option>
          <option>System</option>
          <option>Dark</option>
        </Select>
      </Card>
    </div>
  );
}

export function EmptyStatesScreen() {
  return (
    <div className="page-grid">
      <PageHeader title="Empty States" subtitle="Designed so the app still feels helpful when there are no travellers, requests or trips yet." />
      <div className="empty-grid">
        <EmptyStateCard title="No travellers nearby" description="We could not find compatible travellers in your current area yet." />
        <EmptyStateCard title="No requests yet" description="Incoming or sent requests will appear here once you start matching." />
        <EmptyStateCard title="No trips yet" description="Confirmed rides and trip history will show up after your first match." />
      </div>
    </div>
  );
}

export function ProfileSetupModal() {
  const { state, saveProfile } = useAppState();
  const [form, setForm] = useState<CreateProfileInput>({
    name: state.profile?.name ?? '',
    email: state.profile?.email ?? '',
    phone: state.profile?.phone ?? '',
    gender: state.profile?.gender ?? 'prefer-not-to-say',
    languages: state.profile?.languages.join(', ') ?? 'English, Hindi',
    preferredDestinations: state.profile?.preferredDestinations.join(', ') ?? 'Whitefield, Electronic City',
    bio: state.profile?.bio ?? 'Frequent traveller looking for safe, compatible cab companions.',
    verified: state.profile?.verified ?? true,
    womenOnly: state.settings.womenOnlyMatching,
  });

  if (!state.authenticated || !state.needsProfileSetup) {
    return null;
  }

  function handleChange<K extends keyof CreateProfileInput>(field: K, value: CreateProfileInput[K]) {
    setForm(previous => ({ ...previous, [field]: value }));
  }

  return (
    <Modal open title="Create your Hoply profile" onClose={() => undefined}>
      <p>Hoply needs a profile before discovery so matching can happen safely and cleanly.</p>
      <form
        className="form-grid modal-form"
        onSubmit={event => {
          event.preventDefault();
          saveProfile(form);
        }}
      >
        <Input label="Name" value={form.name} onChange={event => handleChange('name', event.target.value)} />
        <Input label="Email" value={form.email} onChange={event => handleChange('email', event.target.value)} />
        <Input label="Phone" value={form.phone} onChange={event => handleChange('phone', event.target.value)} />
        <Select label="Gender" value={form.gender} onChange={event => handleChange('gender', event.target.value as CreateProfileInput['gender'])}>
          <option value="woman">Woman</option>
          <option value="man">Man</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </Select>
        <Input label="Languages" value={form.languages} onChange={event => handleChange('languages', event.target.value)} />
        <Input label="Preferred destinations" value={form.preferredDestinations} onChange={event => handleChange('preferredDestinations', event.target.value)} />
        <TextArea label="Bio" value={form.bio} onChange={event => handleChange('bio', event.target.value)} rows={4} />
        <Toggle checked={form.verified} onChange={value => handleChange('verified', value)} label="Verified profile" hint="Helps with trust and safety" />
        <Toggle checked={form.womenOnly} onChange={value => handleChange('womenOnly', value)} label="Women-only matching" hint="Surface verified women profiles in discovery" />
        <Button type="submit">Save profile</Button>
      </form>
    </Modal>
  );
}
