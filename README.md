# Movie Review Platform — Case Study No. 118
### Semester 3 Backend Development Capstone Project
**Student:** Aaroh Wankhade (Student ID: 150096726175)  
**Programme:** B.Tech Computer Science Engineering (2025–2029)  
**Institution:** School of FutureTech, ITM Skills University  
**Live Cloud Platform:** [https://movie-review-platform-1dv6.onrender.com](https://movie-review-platform-1dv6.onrender.com)  
**Live Backend REST API:** [https://movie-review-platform-1dv6.onrender.com/api](https://movie-review-platform-1dv6.onrender.com/api)  
**GitHub Repository:** [https://github.com/aarohwankh-dotcom/movie-review-platform](https://github.com/aarohwankh-dotcom/movie-review-platform)  

---

## 1. Project Overview
The **Movie Review Platform** is a full-stack web application designed to allow cinema enthusiasts to browse films, read authentic critiques, and contribute ratings and reviews. The platform calculates movie ratings on-demand using native **MongoDB Aggregation Pipelines** (`$avg`, `$match`, `$group`) and strictly enforces **ownership-based authorization** to ensure reviewers can modify or delete only the critiques they personally authored.

Built strictly within the scope of the **Semester 3 Backend Development Syllabus**, the project demonstrates core industry patterns: Express.js RESTful API design, Mongoose schema modeling and document referencing, JWT sessionless authentication, bcrypt password hashing, input validation, and centralized error handling.

---

## 2. Problem Statement
Many contemporary digital platforms suffer from data desynchronization when computing aggregated statistics (such as average ratings) through client-side loops or flat column counters. Furthermore, insufficient server-side authorization often allows unauthorized users to manipulate or delete reviews authored by other members of the community. 

This project solves these challenges by:
1. Enforcing **data normalization and document references** between `User`, `Movie`, and `Review` collections.
2. Dynamically computing average movie ratings directly within MongoDB using aggregation pipelines.
3. Establishing **ownership-based authorization middleware** that blocks non-authors from editing or deleting reviews with HTTP `403 Forbidden`.
4. Enforcing strict schema and middleware validation on rating bounds ($1.0 \le \text{rating} \le 5.0$) and required fields.

---

## 3. Objectives & Outcomes
- **Design Schemas:** Implement Mongoose schemas for `User`, `Movie`, and `Review` with strict types and `ObjectId` references.
- **RESTful CRUD Operations:** Implement clean REST endpoints for movies and reviews.
- **Ownership Authorization:** Create custom Express middleware to verify review ownership before executing mutations.
- **Dynamic Aggregation:** Calculate average ratings dynamically per movie using MongoDB's `$avg` accumulator.
- **Validation:** Reject ratings outside 1–5 and empty critique texts at both middleware and schema layers.

---

## 4. Technology Stack (Syllabus-Bounded)
| Layer | Technology | Syllabus Module Reference |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v20 LTS) | Module 2: Node.js Fundamentals & Event Loop |
| **API Framework** | Express.js (v4.21) | Module 3 & 4: Express.js Fundamentals & API Design |
| **Database** | MongoDB Atlas / Local MongoDB | Module 5: NoSQL Databases & MongoDB Concepts |
| **Object Modeling** | Mongoose (v8.7) | Module 5: Mongoose Schemas, Validation & References |
| **Authentication** | JSON Web Tokens (JWT) | Module 5: JWT Authentication & Route Protection |
| **Security** | bcryptjs | Module 5: Password Hashing using bcrypt |
| **Frontend UI** | HTML5, Vanilla CSS3, JavaScript | Module 1: ES6, Fetch API, DOM Events & Asynchronous JS |
| **Testing** | Postman Collection / Native Test Suite | Module 5: API Testing & Environment Variables |

*Note: In accordance with the academic constraints of the Semester 3 syllabus, no unnecessary libraries (Next.js, TypeScript, Redux, Docker, GraphQL) have been introduced.*

---

## 5. System Architecture
The application is structured into four distinct decoupled layers:
```
┌────────────────────────────────────────────────────────┐
│  Presentation Layer: Cinematic Console (HTML5/CSS3/JS) │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON (REST + JWT Bearer)
┌───────────────────────────▼────────────────────────────┐
│  Application Layer: Express.js REST API & Controllers  │
│  (authController.js, movieController.js, reviewCtrl)   │
└───────────────────────────┬────────────────────────────┘
                            │ Middleware Pipeline
┌───────────────────────────▼────────────────────────────┐
│  Security & Validation Layer                           │
│  - authMiddleware (JWT Verification)                   │
│  - ownershipMiddleware (Author Check -> 403 Forbidden) │
│  - validationMiddleware (1-5 Rating Bounds & Trim)    │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM Operations
┌───────────────────────────▼────────────────────────────┐
│  Database Layer: MongoDB Atlas / In-Memory MongoDB     │
│  - Referenced Collections: users, movies, reviews      │
│  - Dynamic Aggregation Pipeline ($match, $group, $avg) │
└────────────────────────────────────────────────────────┘
```

---

## 6. Database Design & Entity Relationships

### 6.1 Collections & Fields
1. **`User` Collection (`models/User.js`):**
   - `_id`: Unique `ObjectId` (Primary Key)
   - `name`: String (Required, minlength 2)
   - `email`: String (Required, Unique, Regex validated)
   - `password`: String (Bcrypt hashed with 10 salt rounds)
   - `createdAt`: Date timestamp
2. **`Movie` Collection (`models/Movie.js`):**
   - `_id`: Unique `ObjectId` (Primary Key)
   - `title`: String (Required, trimmed)
   - `description`: String (Required)
   - `genre`: String (Required)
   - `releaseYear`: Number (1888–2100)
   - `posterUrl`: String (Image URI)
   - `createdBy`: `ObjectId` referencing `User`
3. **`Review` Collection (`models/Review.js`):**
   - `_id`: Unique `ObjectId` (Primary Key)
   - `movie`: `ObjectId` referencing `Movie` (Required, Indexed)
   - `user`: `ObjectId` referencing `User` (Required, Indexed)
   - `rating`: Number (Required, Min: 1, Max: 5)
   - `reviewText`: String (Required, Min: 3 chars, Max: 2000)
   - `createdAt` & `updatedAt`: Timestamps

### 6.2 Entity-Relationship Model
- **User to Review:** $1 : M$ (One user authors multiple reviews).
- **Movie to Review:** $1 : M$ (One movie receives multiple reviews).
- Storing `ObjectId` references avoids duplication and ensures normalization.

---

## 7. Dynamic Average Rating Aggregation (Case Study Part 10)
Rather than maintaining a precarious counter column, average ratings are computed deterministically on-demand:
```javascript
const stats = await Review.aggregate([
  // Stage 1: Filter reviews for this movie
  {
    $match: { movie: new mongoose.Types.ObjectId(movieId) }
  },
  // Stage 2: Group and compute average rating and review tally
  {
    $group: {
      _id: '$movie',
      averageRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 }
    }
  }
]);
```
**Endpoint:** `GET /api/movies/:id/average-rating`  
**Output:**
```json
{
  "movieId": "6ac11b425dd15bdf3570587e",
  "averageRating": 4.5,
  "totalReviews": 2
}
```

---

## 8. Ownership-Based Authorization (Case Study Part 8)
When an author attempts to edit or delete a review, `authorizeReviewOwner` intercepts the request:
```javascript
const review = await Review.findById(req.params.id);
if (review.user.toString() !== req.user._id.toString()) {
  return res.status(403).json({
    success: false,
    message: "Forbidden: You are only authorized to edit or delete reviews authored by you"
  });
}
```
If User A sends a `PATCH` or `DELETE` targeting User B's critique, the backend strictly returns **403 Forbidden**.

---

## 9. API Endpoints Reference
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/users/me` | Fetch authenticated user profile | Private (JWT) |
| `GET` | `/api/movies` | Fetch all movies with aggregated ratings | Public |
| `GET` | `/api/movies/:id` | Fetch movie details with reviews | Public |
| `GET` | `/api/movies/:id/average-rating` | Compute average rating via MongoDB aggregation | Public |
| `POST` | `/api/movies` | Catalogue a new movie | Private (JWT) |
| `PATCH`| `/api/movies/:id` | Update movie metadata | Private (JWT) |
| `DELETE`| `/api/movies/:id` | Delete movie & cascade delete reviews | Private (JWT) |
| `POST` | `/api/movies/:id/reviews` | Post critique (Rating 1–5, text required) | Private (JWT) |
| `GET` | `/api/movies/:id/reviews` | List all reviews for movie | Public |
| `PATCH`| `/api/reviews/:id` | Edit review (Rating & commentary) | Private (Owner Only) |
| `DELETE`| `/api/reviews/:id` | Delete review document | Private (Owner Only) |

---

## 10. Project Directory Structure
```
movie-review-platform/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & offline in-memory fallback
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, JWT token issuance
│   │   ├── movieController.js    # Movie CRUD & MongoDB aggregation pipelines
│   │   └── reviewController.js   # Review CRUD & ownership enforcement
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token authentication guard
│   │   ├── ownershipMiddleware.js# 403 Forbidden author ownership validator
│   │   ├── validationMiddleware.js# 1-5 rating & required text payload guards
│   │   └── errorMiddleware.js    # Centralized JSON error exception handler
│   ├── models/
│   │   ├── User.js               # Mongoose schema with bcrypt password hashing
│   │   ├── Movie.js              # Mongoose schema with type validation
│   │   └── Review.js             # Referenced schema with 1-5 rating constraints
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── seedData.js           # Sample users, movies & initial reviews
│   │   ├── testSuite.js          # 12 automated integration tests
│   │   └── captureScreenshots.js # Headless Chrome screenshot automation
│   ├── server.js                 # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── index.html                # Movie catalog & KPI statistics dashboard
│   ├── login.html                # User login with demo account quick-fill
│   ├── register.html             # User account registration
│   ├── movie-details.html        # Dynamic aggregation score, review form & list
│   ├── add-movie.html            # Catalogue new movies with pre-fill helper
│   ├── css/
│   │   └── style.css             # Cinematic dark theme styling
│   └── js/
│       ├── config.js             # API base URL configuration
│       ├── api.js                # Fetch API wrapper with JWT Bearer injection
│       ├── auth.js               # Session & navigation manager
│       ├── movies.js             # Catalog rendering & genre filters
│       └── reviews.js            # Review CRUD & live aggregation updates
│
├── postman/
│   ├── Movie-Review-Platform.postman_collection.json
│   └── Movie-Review-Platform.postman_environment.json
│
├── docs/
│   ├── api-documentation.md      # Complete REST API specification
│   ├── architecture.png          # System architecture diagram
│   ├── workflow.png              # Workflow pipelines
│   └── er-diagram.png            # Referenced database entity model
│
├── screenshots/
│   ├── screenshot_1_dashboard.png
│   ├── screenshot_2_login.png
│   ├── screenshot_3_register.png
│   ├── screenshot_4_movie_details.png
│   ├── screenshot_5_review_form.png
│   ├── screenshot_6_review_owner_actions.png
│   ├── screenshot_7_edit_modal.png
│   ├── screenshot_8_add_movie.png
│   ├── screenshot_9_terminal_runner.png
│   └── screenshot_10_postman_403.png
│
├── VIVA_NOTES.md                 # 25 viva questions & student-friendly answers
├── Movie_Review_Platform_Report.pdf # 14-page university submission PDF report
├── run.sh                        # One-click execution runner script
└── README.md
```

---

## 11. Local Setup & Execution Guide

### Prerequisites
- Node.js (v18 or higher) and npm installed.

### Option 1: One-Click Runner (Recommended)
```bash
chmod +x run.sh
./run.sh
```
This script automatically verifies dependencies, runs the automated test suite, launches the Express backend on port 5001, and opens `http://localhost:5001/index.html` in your default browser.

### Option 2: Manual Setup
1. Clone the repository and navigate into the `backend` folder:
   ```bash
   cd backend
   npm install
   ```
2. Configure `.env` (optional — an automatic in-memory MongoDB instance will be used if left blank):
   ```bash
   cp .env.example .env
   ```
3. Run the automated integration test suite:
   ```bash
   node utils/testSuite.js
   ```
4. Start the application server:
   ```bash
   npm start
   ```
5. Open `http://localhost:5001` in your browser.

---

## 12. MongoDB Atlas Cloud Configuration
To connect to a production MongoDB Atlas cluster:
1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user under **Database Access**.
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
4. Copy the connection string and paste it into `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/movie_review_db?retryWrites=true&w=majority
   ```
5. Restart the server. The connection handler will automatically connect to Atlas.

---

## 13. Case Study Requirement Mapping
| Case Study Requirement | Implementation in Project | Verification Evidence |
| :--- | :--- | :--- |
| **Movie & Review Schemas** | Mongoose models with `ObjectId` references | `models/Movie.js`, `models/Review.js` |
| **CRUD Operations** | Express REST endpoints for movies & reviews | Test Suite tests 1–12, Postman collection |
| **Ownership Authorization** | `authorizeReviewOwner` custom middleware | 403 Forbidden verified when User A edits User B's review |
| **Average Rating Aggregation**| MongoDB `$avg`, `$match`, `$group` pipeline | `GET /api/movies/:id/average-rating` endpoint |
| **Rating Validation (1–5)** | Express validation middleware + Mongoose validators | `400 Bad Request` returned on rating = 9 |
| **Review Text Validation** | Non-empty string constraint ($\ge 3$ chars) | `400 Bad Request` returned on empty text |
| **JWT Authentication** | Signed tokens via `jsonwebtoken`, Bearer header | `authMiddleware.js`, `POST /api/auth/login` |
| **Password Security** | `bcryptjs` salt rounds pre-save hook | `User.js` pre-save middleware |
| **MongoDB Atlas Config** | Configurable via `process.env.MONGODB_URI` | `config/db.js`, `.env.example` |

---

## 14. Academic & Viva Demonstration Sequence
Follow this simple 5-minute walkthrough during faculty viva evaluation:
1. Run `./run.sh` to show clean terminal execution and 12/12 passing integration tests.
2. Open `http://localhost:5001/index.html` to display the Movie Dashboard and live KPI counters.
3. Click **Login** and use the quick-fill button for **User A: Aaroh** (`aaroh@example.com`).
4. Select **Inception** and show the dynamic average rating box computed via MongoDB aggregation.
5. Post a review with 5 stars: observe the rating recalculate dynamically and the review appear with the **YOU** badge and **Edit / Delete** buttons.
6. Open the **Edit Review** modal and update the commentary.
7. Log out, then log in as **User B: Priya** (`priya@example.com`).
8. Return to Inception: observe that User A's review does **not** have edit/delete buttons for User B.
9. Open Postman or terminal: attempt a `PATCH` to User A's review with User B's token to demonstrate server-side **403 Forbidden**.
10. Attempt a review with rating 9 to demonstrate **400 Bad Request** validation rejection.

---

## 15. Student & Course Details
- **Student Name:** Aaroh Wankhade
- **Student ID:** 150096726175
- **Degree:** B.Tech Computer Science Engineering
- **Academic Year:** 2025–2029
- **Course:** Semester 3 Backend Development — Node.js, Express.js & MongoDB
- **Institution:** School of FutureTech, ITM Skills University
