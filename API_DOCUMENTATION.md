# API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 0,
    "verified": false,
    "createdAt": "2025-11-23T..."
  }
}
```

### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 4.5,
    "verified": true
  }
}
```

## Rides

### GET /rides
List all rides or search by criteria.

**Query Parameters:**
- `from` (optional): Search by origin city
- `to` (optional): Search by destination city
- `date` (optional): Filter by date (YYYY-MM-DD)

**Example:** `/api/rides?from=Delhi&to=Mumbai`

**Response (200):**
```json
{
  "rides": [
    {
      "id": "uuid",
      "from": "Delhi",
      "fromDetail": "Connaught Place",
      "to": "Mumbai",
      "toDetail": "Bandra",
      "date": "2025-11-25T00:00:00.000Z",
      "time": "10:00 AM",
      "seats": 3,
      "price": 1500,
      "status": "active",
      "driver": {
        "id": "uuid",
        "name": "John Doe",
        "rating": 4.8,
        "verified": true
      }
    }
  ]
}
```

### POST /rides
Create a new ride.

**Request Body:**
```json
{
  "driverId": "user-uuid",
  "from": "Delhi",
  "fromDetail": "Connaught Place",
  "to": "Mumbai",
  "toDetail": "Bandra West",
  "date": "2025-11-25",
  "time": "10:00 AM",
  "seats": 3,
  "price": 1500,
  "amenities": ["ac", "music", "charger"]
}
```

**Response (201):**
```json
{
  "message": "Ride created successfully",
  "ride": { /* ride object */ }
}
```

### GET /rides/[id]
Get details of a specific ride.

**Response (200):**
```json
{
  "ride": {
    "id": "uuid",
    /* ride details */,
    "driver": { /* driver info */ },
    "bookings": [ /* array of bookings */ ],
    "reviews": [ /* array of reviews */ ]
  }
}
```

### PATCH /rides/[id]
Update a ride (status or seats).

**Request Body:**
```json
{
  "status": "completed",
  "seats": 2
}
```

### DELETE /rides/[id]
Delete a ride.

## Bookings

### GET /bookings
List bookings for a user.

**Query Parameters:**
- `userId` (required): User ID
- `type` (optional): "passenger" or "driver"

**Example:** `/api/bookings?userId=uuid&type=passenger`

**Response (200):**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "rideId": "uuid",
      "passengerId": "uuid",
      "seats": 2,
      "status": "confirmed",
      "ride": { /* ride details */ },
      "passenger": { /* passenger info */ }
    }
  ]
}
```

### POST /bookings
Create a new booking.

**Request Body:**
```json
{
  "rideId": "ride-uuid",
  "passengerId": "user-uuid",
  "seats": 2
}
```

**Response (201):**
```json
{
  "message": "Booking created successfully",
  "booking": { /* booking object */ }
}
```

### PATCH /bookings/[id]
Update booking status.

**Request Body:**
```json
{
  "status": "cancelled"
}
```

## Reviews

### POST /reviews
Create a review for a ride.

**Request Body:**
```json
{
  "rideId": "ride-uuid",
  "reviewerId": "user-uuid",
  "rating": 5,
  "comment": "Great ride!"
}
```

**Response (201):**
```json
{
  "message": "Review created successfully",
  "review": { /* review object */ }
}
```

### GET /reviews
Get reviews for a ride or user.

**Query Parameters:**
- `rideId` (optional): Get reviews for a specific ride
- `userId` (optional): Get reviews for a driver

**Example:** `/api/reviews?rideId=uuid`

## Users

### GET /users/[id]
Get user profile and statistics.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "rating": 4.8,
    "verified": true,
    "stats": {
      "ridesAsDriver": 15,
      "ridesAsPassenger": 23,
      "totalRides": 38
    }
  }
}
```

### PATCH /users/[id]
Update user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567890"
}
```

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `400`: Bad Request (missing or invalid parameters)
- `401`: Unauthorized (invalid credentials)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error
