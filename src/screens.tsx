import { useMemo, useRef, useState, type FormEvent } from 'react';
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

function travellerBadgeLabel(traveller: Traveller) {
  if (traveller.gender === 'female' && traveller.verifiedWoman) {
    return 'Verified woman';
  }

  return traveller.verified ? 'Verified traveller' : 'Traveller';
}

export function LoginScreen() {
  const { login, register, state } = useAppState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('rahul@hoply.app');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register({ name, email, password, phoneNumber, gender });
      setSuccess('Account created! Let us complete your profile...');
      setTimeout(() => navigate('/app/profile-setup'), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
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
        <div className="tabs" role="tablist">
          <button type="button" className={`tab ${mode === 'login' ? 'tab-active' : ''}`} onClick={() => setMode('login')} role="tab" aria-selected={mode === 'login'}>Log in</button>
          <button type="button" className={`tab ${mode === 'register' ? 'tab-active' : ''}`} onClick={() => setMode('register')} role="tab" aria-selected={mode === 'register'}>Sign up</button>
        </div>

        {error ? <div className="banner banner-error">{error}</div> : null}
        {success ? <div className="banner banner-success">{success}</div> : null}

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <Input label="Email address" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={event => setPassword(event.target.value)} required />
            <Button type="submit" disabled={loading}>
              {loading ? <span className="btn-loading"><span className="spinner" /> Logging in...</span> : 'Log in'}
            </Button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <Input label="Full name" value={name} onChange={event => setName(event.target.value)} required />
            <Input label="Email address" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
            <Input label="Phone number" type="tel" value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} required placeholder="+919876543210" />
            <Input label="Password" type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={8} />
            <Select label="Gender" value={gender} onChange={event => setGender(event.target.value)}>
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </Select>
            <Button type="submit" disabled={loading}>
              {loading ? <span className="btn-loading"><span className="spinner" /> Creating account...</span> : 'Create account'}
            </Button>
          </form>
        )}
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

    return filtered.filter(traveller => traveller.gender === 'female' && traveller.verifiedWoman);
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
                  <Badge tone={traveller.verifiedWoman ? 'success' : 'info'}>{travellerBadgeLabel(traveller)}</Badge>
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
            <Avatar initials={profile?.avatar ?? 'RS'} className="avatar-large" />
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

export function ProfileSetupScreen() {
  const { state, updateProfile } = useAppState();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(state.profile?.name ?? '');
  const [age, setAge] = useState(state.profile?.age?.toString() ?? '');
  const [gender, setGender] = useState(state.profile?.gender ?? 'prefer_not_to_say');
  const [profession, setProfession] = useState(state.profile?.profession ?? '');
  const [hometown, setHometown] = useState(state.profile?.hometown ?? '');
  const [bio, setBio] = useState(state.profile?.bio ?? '');
  const [photoPreview, setPhotoPreview] = useState(state.profile?.avatar ?? '');
  const [photoFile, setPhotoFile] = useState<string | null>(null);

  if (!state.authenticated || !state.needsProfileSetup) {
    return (
      <div className="page-grid narrow-page">
        <PageHeader title="Profile Setup" subtitle="Complete your profile to get started." />
        <p>You are already set up. <Link to="/app/dashboard">Go to dashboard</Link></p>
      </div>
    );
  }

  function handlePhotoClick() {
    fileRef.current?.click();
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      setPhotoPreview(dataUrl);
      setPhotoFile(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await updateProfile({
        name,
        age: age ? parseInt(age, 10) : null,
        gender,
        profession: profession || null,
        hometown: hometown || null,
        bio: bio || null,
        profilePhoto: photoFile,
      });
      navigate('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="brand brand-large">
          <span className="brand-mark">H</span>
          <span>
            Hoply
            <small>Complete your profile</small>
          </span>
        </div>

        <p className="setup-intro">
          One last step. Fill in your details so travellers can discover and trust you.
        </p>

        {error ? <div className="banner banner-error">{error}</div> : null}

        <form className="setup-form" onSubmit={handleSubmit}>
          <div className="setup-photo-section">
            <button type="button" className="setup-photo-btn" onClick={handlePhotoClick} title="Upload photo">
              {photoFile || state.profile?.avatar?.match(/^data:/) ? (
                <img src={photoFile ?? state.profile!.avatar} alt="Preview" className="setup-photo-img" />
              ) : (
                <span className="setup-photo-placeholder">{initials}</span>
              )}
              <span className="setup-photo-hint">Tap to upload</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="setup-photo-input" onChange={handlePhotoChange} />
          </div>

          <div className="setup-fields">
            <Input label="Full name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Age" type="number" min={13} max={120} value={age} onChange={e => setAge(e.target.value)} />
            <Select label="Gender" value={gender} onChange={e => setGender(e.target.value as typeof gender)}>
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </Select>
            <Input label="Profession" value={profession} onChange={e => setProfession(e.target.value)} placeholder="e.g. Software Engineer" />
            <Input label="Hometown" value={hometown} onChange={e => setHometown(e.target.value)} placeholder="e.g. Bengaluru" />
            <TextArea label="Bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell travellers a bit about yourself..." />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? <span className="btn-loading"><span className="spinner" /> Saving...</span> : 'Complete profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
