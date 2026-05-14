# Smart Gym API Endpoints Overview

## Gateway

- Frontend: `/`
- User: `/api/users`
- Membership: `/api/membership`
- Workout: `/api/workout`
- Facility: `/api/facility`
- Chatbot: `/api/chatbot`
- Payment: `/api/payment`
- Intelligence: `/api/intelligence`

## Frontend Routes

- `/`
- `/login`
- `/register`
- `/packages`
- `/customer`
- `/customer/profile`
- `/customer/subscription`
- `/customer/workout-plan`
- `/customer/workout-plan/full`
- `/customer/workout-history`
- `/customer/notifications`
- `/customer/chatbot`
- `/admin`
- `/admin/intelligence`

## Smart Routes

- `GET /api/intelligence/user/{user_id}/summary`
- `GET /api/intelligence/user/{user_id}/notifications`
- `GET /api/intelligence/admin/overview`
- `POST /api/intelligence/notifications/email`
- `POST /api/intelligence/notifications/task`

## Service Docs

- [user_service/API_ENDPOINTS.md](user_service/API_ENDPOINTS.md)
- [membership_service/API_ENDPOINTS.md](membership_service/API_ENDPOINTS.md)
- [workout_service/API_ENDPOINTS.md](workout_service/API_ENDPOINTS.md)
- [facility_service/API_ENDPOINTS.md](facility_service/API_ENDPOINTS.md)
- [chatbot_service/API_ENDPOINTS.md](chatbot_service/API_ENDPOINTS.md)
- [payment_service/API_ENDPOINTS.md](payment_service/API_ENDPOINTS.md)
- [intelligence_service/API_ENDPOINTS.md](intelligence_service/API_ENDPOINTS.md)
