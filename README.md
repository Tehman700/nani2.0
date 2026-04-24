# nani2.0 system

A smart queue-based pickup management system designed for Montessori and school branches to reduce congestion, improve security, and save parent/teacher time during student pickup hours.

## Problem

Traditional school pickup systems often cause:

- Traffic congestion outside schools
- Long waiting times for parents
- Manual confusion for teachers
- Unsafe or unverified student handovers
- No live coordination between parents and staff

## Solution

This platform digitizes the pickup process using a synchronized live queue system.

Parents can book pickup slots from mobile phones, teachers can view the real-time queue, and students are sent to the gate in order.

## Core Features

- Parent account with child management
- Pickup booking system
- Live synchronized queue
- Teacher mobile dashboard
- Real-time queue position updates
- Multi-child handling
- Guardian/Sub-user pickup access
- Push notifications
- Branch/Class/Section management
- Reduced congestion and faster handover

## Tech Stack

### Frontend
- React.js
- Vite
- Capacitor
- Tailwind CSS

### Backend
- FastAPI
- WebSockets
- Redis

### Database
- PostgreSQL

### Notifications
- Firebase Cloud Messaging

## User Roles

- Super Admin
- Branch Admin
- Teacher
- Parent
- Authorized Guardian

## Example Flow

1. Parent logs in
2. Selects child
3. Books pickup
4. Teacher sees live queue
5. Teacher sends child to gate
6. Parent receives child
7. Queue automatically updates

## Goal

To make school pickups:

- Faster
- Safer
- Organized
- Smart
- Stress-free

## Future Enhancements

- AI rush hour prediction
- Smart ETA system
- Geofencing arrival detection
- Analytics dashboard
- Attendance integration

## Team

Built for hackathons and real-world school operations.
