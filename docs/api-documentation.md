# Movie Review Platform - REST API Documentation

**Course:** Semester 3 Backend Development  
**Student:** Aaroh Wankhade (Student ID: 150096726175)  
**Institution:** School of FutureTech, ITM Skills University  
**Case Study:** No. 118 — Movie Review Platform  

---

## 1. Overview
The Movie Review Platform exposes an Express.js RESTful API backed by MongoDB Atlas and Mongoose ODM. It enforces strict input validation, JWT bearer token authentication, ownership-based authorization for review modifications, and dynamic average rating calculations via MongoDB aggregation pipelines.

Base URL: `http://localhost:5001/api`

---

## 2. Authentication Endpoints

### 2.1 Register User
- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Aaroh Wankhade",
  "email": "aaroh@example.com",
  "password": "password123"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "_id": "6ac11b425dd15bdf3570587c",
    "name": "Aaroh Wankhade",
    "email": "aaroh@example.com",
    "createdAt": "2026-10-03T15:00:00.000Z"
  }
}
```

### 2.2 Login User
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "aaroh@example.com",
  "password": "password123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "_id": "6ac11b425dd15bdf3570587c",
    "name": "Aaroh Wankhade",
    "email": "aaroh@example.com"
  }
}
```

### 2.3 Get Current Authenticated Profile
- **Method:** `GET`
- **Endpoint:** `/users/me`
- **Access:** Private (`Authorization: Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "6ac11b425dd15bdf3570587c",
    "name": "Aaroh Wankhade",
    "email": "aaroh@example.com"
  }
}
```

---

## 3. Movie Endpoints

### 3.1 Get All Movies
- **Method:** `GET`
- **Endpoint:** `/movies`
- **Access:** Public
- **Description:** Returns all catalogued movies with dynamically aggregated average rating and total reviews.
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "6ac11b425dd15bdf3570587e",
      "title": "Inception",
      "description": "A thief who steals corporate secrets...",
      "genre": "Sci-Fi",
      "releaseYear": 2010,
      "posterUrl": "https://images.unsplash.com/...",
      "averageRating": 4.5,
      "totalReviews": 2
    }
  ]
}
```

### 3.2 Get Movie by ID
- **Method:** `GET`
- **Endpoint:** `/movies/:id`
- **Access:** Public
- **Description:** Returns single movie details, computed rating statistics, and populated review documents with author info.

### 3.3 Dynamic Average Rating Aggregation (Case Study Part 10)
- **Method:** `GET`
- **Endpoint:** `/movies/:id/average-rating`
- **Access:** Public
- **Pipeline Implementation:**
```javascript
Review.aggregate([
  { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
  {
    $group: {
      _id: '$movie',
      averageRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 }
    }
  }
]);
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Average rating calculated successfully via MongoDB aggregation pipeline",
  "data": {
    "movieId": "6ac11b425dd15bdf3570587e",
    "averageRating": 4.5,
    "totalReviews": 2
  }
}
```

### 3.4 Create Movie
- **Method:** `POST`
- **Endpoint:** `/movies`
- **Access:** Private (`Authorization: Bearer <token>`)
- **Request Body:**
```json
{
  "title": "Interstellar",
  "description": "A team of explorers travel through a wormhole in space...",
  "genre": "Sci-Fi",
  "releaseYear": 2014,
  "posterUrl": "https://images.unsplash.com/..."
}
```

---

## 4. Review Endpoints & Ownership Security

### 4.1 Post Review for Movie
- **Method:** `POST`
- **Endpoint:** `/movies/:id/reviews`
- **Access:** Private (`Authorization: Bearer <token>`)
- **Request Body:**
```json
{
  "rating": 5,
  "reviewText": "Masterclass in cinematography and sound engineering."
}
```
- **Validation Constraints:**
  - `rating`: Number between 1 and 5 (inclusive). Values < 1 or > 5 return `400 Bad Request`.
  - `reviewText`: Required, non-empty, minimum length 3 characters.

### 4.2 Update Review (Owner Only)
- **Method:** `PATCH`
- **Endpoint:** `/reviews/:id`
- **Access:** Private (`Authorization: Bearer <token>` + `authorizeReviewOwner`)
- **Description:** Verifies that `review.user.toString() === req.user._id.toString()`. If a non-author attempts this call, HTTP `403 Forbidden` is returned.
- **Request Body:**
```json
{
  "rating": 4,
  "reviewText": "Updated critique after second watch: Still brilliant but third act drags."
}
```

### 4.3 Delete Review (Owner Only)
- **Method:** `DELETE`
- **Endpoint:** `/reviews/:id`
- **Access:** Private (`Authorization: Bearer <token>` + `authorizeReviewOwner`)
- **Description:** Author can permanently remove their review document. Returns `403 Forbidden` if requester is not the author.

---

## 5. Centralized Error Responses

All error payloads follow a consistent schema:
```json
{
  "success": false,
  "message": "Validation Failed: Rating value must be between 1 and 5 (inclusive)",
  "statusCode": 400,
  "timestamp": "2026-10-03T15:20:00.000Z"
}
```
