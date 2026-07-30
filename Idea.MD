
Context:
===============================================================================
# Hoply 🚖🤝

> **Tagline:** *Find your travel companion. Share the ride. Save money. Meet people.*

---

# Phase 1 — Product Definition

## Problem Statement

Every day, thousands of people arrive at airports, railway stations, bus terminals, and metro stations with the exact same destination.

Yet everyone books separate taxis.

At places like **Kempegowda International Airport (Bengaluru)**, it is common to see:

- Long taxi queues
- High taxi fares
- One passenger occupying an entire cab
- Empty seats travelling the exact same route
- Increased traffic congestion

Two strangers travelling to **Electronic City**, **Whitefield**, or **Koramangala** often never know the other exists.

The result is:

- More money spent
- Longer waiting times
- More traffic
- Higher carbon emissions
- Missed opportunities for efficient travel

Current ride-sharing services like Uber Share or Rapido Share match passengers **after booking a ride**. They do not help people intentionally discover compatible travellers before taking a taxi.

There is currently no dedicated platform that connects travellers based on destination, timing and luggage compatibility before the ride begins.

This is the gap that **Hoply** aims to solve.

---

# 1. Vision

Hoply is a web application that helps travellers discover nearby people travelling towards the same destination so they can safely share a taxi.

Instead of everyone travelling alone, Hoply enables users to create a travel request, browse compatible travellers, compare luggage and travel details, and mutually agree to share a ride.

Hoply focuses on reducing travel costs, decreasing waiting times, improving sustainability and creating safer, community-driven travel experiences without replacing existing taxi services.

> **This is a success if a user can arrive at an airport, find a compatible travel companion within a few minutes, mutually agree to share a taxi, and reduce both travel cost and waiting time.**

---

# 2. Why Hoply?

Modern transportation has become increasingly collaborative.

People today are comfortable with:

- Ride sharing
- Co-working
- Co-living
- Community marketplaces
- Peer-to-peer services

However, airport transportation remains highly individual despite many passengers travelling to identical locations.

Hoply bridges this gap by enabling travellers to discover each other before booking a taxi.

---

# 3. Target Users

## Persona 1 — Corporate Traveller

**Name:** Rahul

- Age: 27
- Software Engineer
- Frequently travels for work

### Goals

- Reduce airport taxi costs
- Reach destination faster
- Find reliable travel companions

### Pain Points

- Airport taxi fares are expensive
- Long taxi queues
- Travelling alone every time

### Technical Skill

High

---

## Persona 2 — Student

**Name:** Priya

- Age: 20
- University Student

### Goals

- Save money
- Travel safely
- Meet fellow students

### Pain Points

- Limited budget
- Unfamiliar with local transport
- High airport taxi fares

### Technical Skill

High

---

## Persona 3 — Tourist

**Name:** Alex

- Age: 32
- International Traveller

### Goals

- Travel affordably
- Avoid taxi scams
- Feel safer travelling

### Pain Points

- Doesn't know local transport
- Doesn't know taxi prices
- Language barriers

### Technical Skill

Medium

---

# 4. Unique Value Proposition

Hoply is **not another taxi booking application.**

Hoply helps users discover **people**, not vehicles.

It intelligently matches travellers using:

- Destination
- Current location
- Travel time
- Luggage compatibility

Users then decide whether they want to travel together before booking any taxi.

A simple analogy:

- Uber finds your ride.
- Tinder finds your match.
- **Hoply finds your travel companion.**

---

# 5. Core User Flow

```text
Open Hoply
      │
      ▼
Create Travel Request
      │
      ▼
Enter Destination
      │
      ▼
Enter Travel Time
      │
      ▼
Enter Luggage Details
      │
      ▼
Allow Location
      │
      ▼
Nearby Travellers Found
      │
      ▼
View Traveller Profiles
      │
      ▼
Send Match Request
      │
      ▼
Traveller Accepts
      │
      ▼
Contact Details Shared
      │
      ▼
Share Taxi
```

---

# 6. Core Features

## 1. Create Travel Request

Users provide:

- Destination
- Current Location
- Travel Time
- Number of Travellers
- Luggage Count
- Luggage Size

---

## 2. Smart Matching

Hoply recommends travellers using:

- Similar destination
- Nearby location
- Similar departure time
- Luggage compatibility

---

## 3. Traveller Profiles

Each profile displays:

- Name
- Profile Picture
- Destination
- Languages Spoken

---

## 4. Match Requests

Users can

- Send Request
- Accept Request
- Reject Request

Only after mutual acceptance are contact details shared.

---

## 5. Fare Split Estimate

Displays estimated

- Taxi Fare
- Individual Share

---

## 6. Match Confirmation

Displays

- Companion Details
- Suggested Pickup Point
- Fare Split
- Contact Information

---

# 7. User Stories (Priority Order)

## US-1

**As a traveller, I want to create a travel request so that nearby travellers can discover me.**

### Done When

- Destination entered
- Travel time selected
- Luggage details saved
- Request becomes visible

---

## US-2

**As a traveller, I want to browse nearby travellers so that I can find compatible companions.**

### Done When

- Traveller cards displayed
- Destination shown
- Distance shown
- Travel time displayed

---

## US-3

**As a traveller, I want to view compatibility scores so that I know who is the best match.**

### Done When

- Match percentage displayed
- Destination similarity shown
- Timing similarity shown

---

## US-4

**As a traveller, I want to send a travel request so that I can invite another traveller to share a ride.**

### Done When

- Request sent
- Pending status visible
- Notification created

---

## US-5

**As a traveller, I want to accept or reject requests so that only mutual matches proceed.**

### Done When

- Accept button works
- Reject button works
- Status updates correctly

---

## US-6

**As a traveller, I want to see luggage information so that I know whether sharing a cab is practical.**

### Done When

- Bag count visible
- Bag size visible

---

## US-7

**As a traveller, I want to view traveller profiles so that I feel comfortable travelling together.**

### Done When

- Name shown
- Destination shown
- Languages shown
- Profile picture shown

---

## US-8

**As a traveller, I want to view estimated fare split so that I know how much money I can save.**

### Done When

- Total fare displayed
- Split amount displayed

---

## US-9

**As a traveller, I want my contact information to remain private until both users accept the match.**

### Done When

- Contact hidden before acceptance
- Contact visible after acceptance

---

## US-10

**As a traveller, I want to cancel my travel request so that outdated requests disappear.**

### Done When

- Cancel button available
- Request removed from listings

---

# 8. Scope

## Must Have (MVP)

- Create travel request
- Browse travellers
- Smart traveller recommendations
- View traveller profiles
- Send travel requests
- Accept / Reject requests
- Fare split estimate
- Match confirmation

---

## Nice to Have

- Built-in chat
- Ratings
- User verification
- Women-only matching
- Google Maps integration
- AI compatibility scoring
- Group travel
- Flight integration
- Push notifications

---

## Non Goals

Hoply will **not** include:

- Taxi booking
- Online payments
- Government ID verification
- GPS tracking
- Hotel booking
- Route navigation
- Travel insurance
- Customer support

---

# 9. Data Model

## User

| Field | Type |
|--------|------|
| userId | UUID |
| name | String |
| profilePhoto | URL |
| phone | String |
| languages | List |

---

## Travel Request

| Field | Type |
|--------|------|
| requestId | UUID |
| destination | String |
| currentLocation | String |
| travelTime | DateTime |
| luggageCount | Integer |
| luggageSize | Small / Medium / Large |
| passengerCount | Integer |

---

## Match

| Field | Type |
|--------|------|
| matchId | UUID |
| requesterId | UUID |
| receiverId | UUID |
| compatibilityScore | Integer |
| status | Pending / Accepted / Rejected |

---

## Notification

| Field | Type |
|--------|------|
| notificationId | UUID |
| receiverId | UUID |
| requestId | UUID |
| status | Read / Unread |

---

# 10. Business Rules

- Users only see nearby travellers.
- Contact details remain hidden until both users accept.
- Duplicate requests are not allowed.
- Travel requests expire after a configurable duration.
- Users can only have one confirmed active travel match.
- Compatibility is calculated using destination, timing and luggage.

---

# 11. MVP Scope (1.5-Day Development)

The objective is to demonstrate the core idea rather than build a production-ready platform.

## Included

- Create travel requests
- Traveller discovery
- Compatibility recommendations
- Traveller profiles
- Match requests
- Accept / Reject flow
- Fare split estimation
- Responsive web interface

---

## Excluded

- Authentication
- Real-time messaging
- GPS tracking
- Google Maps
- Taxi booking
- Payment gateway
- Push notifications
- Production security

---

# 12. Key Screens

## 1. Landing Page

- Hero Section
- Find Travel Buddy
- Create Travel Request
- Browse Travellers

---

## 2. Create Travel Request

Fields

- Destination
- Current Location
- Travel Time
- Passenger Count
- Luggage Count
- Luggage Size

---

## 3. Traveller Discovery

Displays

- Traveller Cards
- Destination
- Compatibility %
- Estimated Savings
- Send Request Button

---

## 4. Traveller Profile

Displays

- Name
- Languages
- Destination
- Luggage
- Send Request

---

## 5. Requests Page

Displays

- Incoming Requests
- Outgoing Requests
- Accept
- Reject

---

## 6. Match Confirmation

Displays

- Companion Details
- Fare Split
- Contact Information
- Suggested Pickup Point

---

# 13. Success Metrics

The MVP is considered successful if users can:

- Create a travel request in under 2 minutes.
- Find compatible travellers in under 30 seconds.
- Successfully send and accept travel requests.
- View estimated savings before sharing a ride.
- Complete the matching process without external assistance.

---

# 14. Three-Minute Pitch

Imagine walking out of Bengaluru Airport after a long flight.

Hundreds of people are waiting for taxis, and many are travelling to the exact same destination. Despite this, everyone books separate cabs, paying full fare and adding to traffic congestion.

Hoply solves this problem.

Hoply is a web application that connects travellers heading in the same direction so they can share a taxi together.

Users simply create a travel request, enter their destination, travel time and luggage details, and Hoply recommends nearby travellers with similar routes. If both users accept the match, their contact information is shared and they can travel together.

Unlike Uber or Rapido, Hoply does not book taxis. Instead, it helps people find the right travel companion before booking any ride.

For our MVP, we focus on creating travel requests, intelligent traveller matching, profile viewing, mutual acceptance and fare split estimation.

Hoply makes airport travel more affordable, more sustainable and more social—one shared journey at a time.

==============================================================

I need to create MYSQL tables as a senior DB enginner:
An app to connect people travelling from on location to another 
i.e Airport to somelocation within 3-4kms 

A simple users table:
- user name
- email
- password 
- phone number
- Age
- Gender 
- Descriptiom


Locations:
- Name:
- Coordinates Optional:
- Region: like city 
- Type of place: Locality or Airport or Busdepo
I want this table to contain loation data I dont have any idea how we can implement this yiu have cretive freedom 


Travel Plan:
- Id:
- user-id: 
- Source location
- destination
- time range 
- Landmakr option 
- map coordinates of destination
- Other info as text 
- luggage type
- luggage quanlity 



You can add other supporting tables or other feilds but tell me when u add them  tables

