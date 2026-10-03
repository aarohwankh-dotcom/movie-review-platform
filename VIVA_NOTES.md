# Viva & Oral Examination Mastery Guide
## Movie Review Platform — Case Study No. 118
**Student:** Aaroh Wankhade (Student ID: 150096726175)  
**Programme:** B.Tech Computer Science Engineering (2025–2029)  
**Course:** Semester 3 Backend Development — Node.js, Express.js & MongoDB  
**Institution:** School of FutureTech, ITM Skills University  

---

### Question 1: What is Node.js?
- **Technical Explanation:** Node.js is an open-source, cross-platform JavaScript runtime built on Chrome's V8 engine. It uses an event-driven, non-blocking I/O model that operates on a single-threaded event loop, making it highly efficient for building data-intensive network applications and REST APIs.
- **How I can explain this in viva:** *"Node.js lets us run JavaScript on the server rather than just in the browser. Because of its asynchronous event loop, it can handle multiple client requests concurrently without spawning heavy OS threads for each connection."*

---

### Question 2: Why do we use Express.js instead of native Node HTTP?
- **Technical Explanation:** Express.js is a minimalist, flexible Node.js web application framework. While Node's core `http` module requires manually parsing URLs, reading streaming buffers, and building routing trees, Express provides structured routing, middleware chaining, JSON body parsing, and standardized error handling.
- **How I can explain this in viva:** *"Native Node requires dozens of lines just to parse a POST request body or match URL parameters. Express organizes our backend into clean routes, controllers, and middleware, drastically reducing boilerplate and human error."*

---

### Question 3: What is MongoDB?
- **Technical Explanation:** MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like BSON (Binary JSON) documents. It eliminates rigid relational table constraints and offers horizontal scalability, high read/write throughput, and dynamic schema evolution.
- **How I can explain this in viva:** *"MongoDB stores information as flexible JSON-like documents inside collections rather than static rows and columns. This natural mapping makes it ideal for JavaScript full-stack development."*

---

### Question 4: What is Mongoose?
- **Technical Explanation:** Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a schema-based solution to model application data, enforcing typecasting, validation rules, query building, pre/post middleware hooks, and document referencing.
- **How I can explain this in viva:** *"MongoDB by itself is schema-less, which can lead to messy or corrupt data. Mongoose acts as a schema and validation layer on top of MongoDB, ensuring every movie and review strictly conforms to our required data types."*

---

### Question 5: What is a Mongoose Schema?
- **Technical Explanation:** A Mongoose schema defines the structural blueprint of documents within a MongoDB collection. It specifies the properties, their data types, default values, validators, custom getters/setters, and relationship references.
- **How I can explain this in viva:** *"A schema is the blueprint of our document. In our project, the Movie schema defines that a movie must have a title (String), genre (String), and releaseYear (Number between 1888 and 2100)."*

---

### Question 6: What is an ObjectId reference?
- **Technical Explanation:** In Mongoose, an `ObjectId` reference (`mongoose.Schema.Types.ObjectId` with `ref`) links documents across collections using their unique 12-byte BSON identifiers. This establishes normalized relationships and allows dynamic population of foreign documents via `.populate()`.
- **How I can explain this in viva:** *"Instead of duplicating all user and movie details inside every review, the Review document simply stores the `_id` of the Movie and the `_id` of the User. When needed, Mongoose dynamically populates the author's name and email."*

---

### Question 7: What does CRUD stand for?
- **Technical Explanation:** CRUD represents the four primitive persistent storage operations: Create (`POST`), Read (`GET`), Update (`PUT`/`PATCH`), and Delete (`DELETE`).
- **How I can explain this in viva:** *"CRUD stands for Create, Read, Update, and Delete. In our system, users can Create reviews, Read movie catalogs, Update their own critiques, and Delete their authored reviews."*

---

### Question 8: What is Express Middleware?
- **Technical Explanation:** Middleware functions are functions that have access to the request object (`req`), response object (`res`), and the `next` middleware function in the application’s request-response cycle. They execute tasks such as request body parsing, logging, authentication, and error trapping before control reaches the route controller.
- **How I can explain this in viva:** *"Middleware acts like a pipeline checkpoint. When a client sends a request, middleware inspects the incoming data—for example, verifying if a valid JWT token exists or checking if the user owns the review—before letting the request proceed."*

---

### Question 9: What is JSON Web Token (JWT)?
- **Technical Explanation:** JWT is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. It consists of three base64-encoded parts separated by dots: Header (algorithm & token type), Payload (claims/user ID), and Signature (cryptographic hash using a secret key).
- **How I can explain this in viva:** *"JWT is a digitally signed security token. When a user logs in, the backend signs a token containing their user ID using a secret key. The frontend includes this token in subsequent requests so the server knows exactly who made the request without needing server-side session memory."*

---

### Question 10: What is the difference between Authentication and Authorization?
- **Technical Explanation:** Authentication verifies *who* the user is (e.g. validating email and password credentials). Authorization determines *what permissions* the authenticated user has (e.g. checking whether User A has permission to modify Review #123).
- **How I can explain this in viva:** *"Authentication proves identity—'I am Aaroh'. Authorization checks access rights—'Can Aaroh edit this review, or was it written by someone else?'"*

---

### Question 11: What is Ownership-Based Authorization?
- **Technical Explanation:** Ownership authorization is a fine-grained access control pattern where resource mutations are restricted strictly to the user entity identified as the author or owner of that resource. In our backend, `authorizeReviewOwner` extracts `req.user._id` from the decoded JWT and verifies that it strictly equals `review.user.toString()`. If they differ, the server terminates the pipeline with HTTP `403 Forbidden`.
- **How I can explain this in viva:** *"Any registered user can post a review, but no user can touch someone else's critique. If User A tries to edit or delete User B's review, our backend immediately intercepts the request and returns a 403 Forbidden status."*

---

### Question 12: Why do we hash passwords with bcrypt?
- **Technical Explanation:** Storing plain-text passwords in databases creates catastrophic security vulnerabilities if storage is leaked or dumped. Bcrypt is an adaptive cryptographic hash function based on the Blowfish cipher. It incorporates a random salt to prevent rainbow table attacks and an adjustable work factor (salt rounds) to resist brute-force hardware cracking.
- **How I can explain this in viva:** *"We never store passwords in plain text. We use bcrypt with a salt factor of 10 in our Mongoose pre-save hook. Even if someone obtains read access to the database, they cannot reverse the hashes back into readable passwords."*

---

### Question 13: Why do we validate ratings strictly on the backend?
- **Technical Explanation:** Frontend form validation can be effortlessly bypassed using curl, Postman, or browser developer tools. Enforcing bounds (1 <= rating <= 5) in Express middleware and Mongoose schema definitions guarantees mathematical integrity and prevents anomalous data from poisoning aggregation pipelines.
- **How I can explain this in viva:** *"Frontend validation is only for UI convenience. A malicious user could send a raw POST request with rating 99 or -5. Our backend middleware and Mongoose validators strictly enforce that only numbers between 1 and 5 are accepted, rejecting anything else with a 400 Bad Request."*

---

### Question 14: How does the dynamic average rating calculation work?
- **Technical Explanation:** Instead of storing a static average rating counter on the Movie document—which risks synchronization errors on review edits or deletions—the average is computed dynamically on-demand from the Review collection using a MongoDB Aggregation Pipeline.
- **How I can explain this in viva:** *"We don't store a hardcoded average rating in the movie table. Whenever a user requests a movie, MongoDB runs an aggregation query over all reviews referencing that movie, calculating the live average in real time. If a review is updated or deleted, the displayed rating updates automatically."*

---

### Question 15: What is a MongoDB Aggregation Pipeline?
- **Technical Explanation:** An aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results (filtering, grouping, computing averages, project, and sort).
- **How I can explain this in viva:** *"A pipeline processes documents in sequential stages. First it filters the exact documents we want, then groups them together, and then computes mathematical statistics like averages or sums."*

---

### Question 16: What does the `$match` aggregation stage do?
- **Technical Explanation:** `$match` filters the document stream to allow only matching documents to pass unmodified into the next pipeline stage. It operates like a SQL `WHERE` clause.
- **How I can explain this in viva:** *"`$match` filters our Review collection so that only reviews belonging to the specified movie's ObjectId are passed to the next stage."*

---

### Question 17: What does the `$group` aggregation stage do?
- **Technical Explanation:** `$group` separates documents into groups according to a specified `_id` expression and applies accumulator expressions (such as `$avg`, `$sum`, `$min`, `$max`) to each group.
- **How I can explain this in viva:** *"`$group` bundles all the matched review documents together by movie ID and allows us to calculate summary values across the whole group."*

---

### Question 18: What does the `$avg` operator do?
- **Technical Explanation:** `$avg` is an accumulator operator within `$group` that computes the numerical mean of values across all incoming documents for the specified field, ignoring non-numeric values.
- **How I can explain this in viva:** *"`$avg` takes the 'rating' field from all the grouped reviews and calculates their arithmetic mean, giving us the dynamic platform score."*

---

### Question 19: Why use MongoDB Atlas?
- **Technical Explanation:** MongoDB Atlas is a fully-managed cloud database service. It provides automated provisioning, clustering, replication, high availability, backup snapshots, network isolation, and encryption in transit/at rest without requiring manual server administration.
- **How I can explain this in viva:** *"Atlas provides a managed, cloud-hosted MongoDB cluster. By setting `MONGODB_URI` in our `.env` file, our application seamlessly connects to the cloud database whether running locally or deployed on Render."*

---

### Question 20: Why do we use environment variables and `.env` files?
- **Technical Explanation:** The Twelve-Factor App methodology mandates strict separation of configuration from code. Secret credentials such as database URIs, port configurations, and JWT signing keys must never be hardcoded or checked into version control repositories.
- **How I can explain this in viva:** *"Hardcoding passwords or database URLs in source code is unsafe and prevents easy deployment across environments. Environment variables let us configure secrets in a local `.env` file or cloud dashboard without exposing them in Git."*

---

### Question 21: What is a REST API?
- **Technical Explanation:** Representational State Transfer (REST) is an architectural style for network applications. It uses standard HTTP methods, stateless client-server communication, resource-oriented URI endpoints, and standard data interchange formats (typically JSON).
- **How I can explain this in viva:** *"A REST API allows clients like our web browser or mobile app to communicate with our server using standard HTTP requests like GET, POST, PATCH, and DELETE, exchanging data formatted as clean JSON."*

---

### Question 22: What is the difference between GET, POST, PATCH, and DELETE?
- **Technical Explanation:**
  - `GET`: Safe, idempotent retrieval of resource representations without state modification.
  - `POST`: Creation of a subordinate resource, triggering server-side mutations.
  - `PATCH`: Partial modification of an existing resource (unlike `PUT` which replaces the entire entity).
  - `DELETE`: Permanent removal of the targeted resource.
- **How I can explain this in viva:** *"GET reads data; POST creates new records; PATCH updates specific fields of an existing record; and DELETE removes records."*

---

### Question 23: How does the frontend communicate with the backend?
- **Technical Explanation:** The frontend uses the browser's native JavaScript `fetch()` API to issue asynchronous HTTP requests to Express endpoints. Tokens stored in browser `localStorage` are attached to the `Authorization` request header in the format `Bearer <token>`.
- **How I can explain this in viva:** *"Our frontend JavaScript uses the native Fetch API. When a user logs in, the JWT token is saved in localStorage. Every time the user creates, edits, or deletes a review, our helper attaches that token in the Authorization header to authenticate the request."*

---

### Question 24: How does cloud deployment work for this application?
- **Technical Explanation:** The Node.js/Express backend is containerized/built on platforms like Render or Railway, reading its configuration (`PORT`, `JWT_SECRET`, `MONGODB_URI`) from environment variables. The frontend static files can be served directly by Express or hosted independently on Vercel/Netlify, communicating with the live backend over HTTPS.
- **How I can explain this in viva:** *"We deploy our Express backend on Render, connected to our cloud database on MongoDB Atlas. The frontend connects to the deployed backend's URL. Both communicate over secure HTTPS using environment-driven configuration."*

---

### Question 25: What happens when an unauthenticated or unauthorized user calls a protected endpoint?
- **Technical Explanation:**
  - If no token is provided: `authMiddleware` intercepts the request and responds with HTTP `401 Unauthorized` (`{ success: false, message: "Access denied: No authorization token provided" }`).
  - If a valid token is provided but belongs to User A, and User A attempts to edit User B's review: `authorizeReviewOwner` compares `review.user` with `req.user._id` and responds with HTTP `403 Forbidden` (`{ success: false, message: "Forbidden: You are only authorized to edit or delete reviews authored by you" }`).
- **How I can explain this in viva:** *"Missing or expired logins return 401 Unauthorized. If you are logged in but try to edit another student's review, our ownership middleware returns 403 Forbidden. This proves our security is fully enforced on the server."*
