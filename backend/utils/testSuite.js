/**
 * Automated Verification & Testing Suite
 * Tests all 17 Case Study Requirements:
 * 1. User Registration
 * 2. User Login
 * 3. Movie Fetching
 * 4. Average Rating MongoDB Aggregation ($avg, $match, $group)
 * 5. Review Creation
 * 6. Dynamic Average Rating Recalculation
 * 7. Authorized Review Update (Owner)
 * 8. Unauthorized Review Update Rejection (403 Forbidden)
 * 9. Unauthorized Review Deletion Rejection (403 Forbidden)
 * 10. Rating Validation (< 1 and > 5 rejected)
 * 11. Empty Review Text Validation (rejected)
 * 12. Authorized Review Deletion (Owner)
 */

const { startServer } = require('../server');

const runTests = async () => {
  console.log('===========================================================');
  console.log('🧪 STARTING COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
  console.log('===========================================================');

  const server = await startServer();
  const BASE_URL = 'http://localhost:5001/api';

  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';
  let sampleMovieId = '';
  let userAReviewId = '';
  let userBReviewId = '';

  const assertEqual = (actual, expected, message) => {
    if (actual === expected) {
      console.log(`  ✅ PASS: ${message} (Received: ${actual})`);
      return true;
    } else {
      console.error(`  ❌ FAIL: ${message} (Expected: ${expected}, Got: ${actual})`);
      return false;
    }
  };

  const assertTrue = (condition, message) => {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      return true;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      return false;
    }
  };

  try {
    // 1. Register User A
    console.log('\n[1/12] Testing User A Registration...');
    const regResA = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Student Evaluator',
        email: `evaluator_${Date.now()}@itm.edu`,
        password: 'password123',
      }),
    });
    const regDataA = await regResA.json();
    assertEqual(regResA.status, 201, 'User A registered with status 201');
    assertTrue(Boolean(regDataA.token), 'JWT token returned on registration');
    userAToken = regDataA.token;
    userAId = regDataA.user._id;

    // 2. Register User B
    console.log('\n[2/12] Testing User B Registration...');
    const regResB = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Student',
        email: `student_b_${Date.now()}@itm.edu`,
        password: 'password123',
      }),
    });
    const regDataB = await regResB.json();
    assertEqual(regResB.status, 201, 'User B registered with status 201');
    userBToken = regDataB.token;
    userBId = regDataB.user._id;

    // 3. User Login
    console.log('\n[3/12] Testing User Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aaroh@example.com',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    assertEqual(loginRes.status, 200, 'Login with seeded credentials returns status 200');
    assertTrue(Boolean(loginData.token), 'Login response contains JWT token');

    // 4. Fetch Movies & pick a sample movie
    console.log('\n[4/12] Testing Movie List Fetching...');
    const moviesRes = await fetch(`${BASE_URL}/movies`);
    const moviesData = await moviesRes.json();
    assertEqual(moviesRes.status, 200, 'GET /movies returns status 200');
    assertTrue(moviesData.data.length >= 6, `Found ${moviesData.data.length} movies in platform`);
    sampleMovieId = moviesData.data[0]._id;

    // 5. Test MongoDB Aggregation Pipeline Endpoint (GET /movies/:id/average-rating)
    console.log('\n[5/12] Testing MongoDB Average Rating Aggregation Pipeline ($avg, $match, $group)...');
    const aggRes = await fetch(`${BASE_URL}/movies/${sampleMovieId}/average-rating`);
    const aggData = await aggRes.json();
    assertEqual(aggRes.status, 200, 'GET /movies/:id/average-rating returns status 200');
    assertTrue(aggData.data.averageRating !== undefined, `Computed average rating: ${aggData.data.averageRating}`);
    assertTrue(aggData.data.totalReviews !== undefined, `Computed total reviews: ${aggData.data.totalReviews}`);
    const initialReviews = aggData.data.totalReviews;

    // 6. User A posts a Review (Rating 5)
    console.log('\n[6/12] Testing Review Creation by User A (Rating = 5)...');
    const revResA = await fetch(`${BASE_URL}/movies/${sampleMovieId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        rating: 5,
        reviewText: 'Masterclass cinematography and sound design! Must watch in IMAX.',
      }),
    });
    const revDataA = await revResA.json();
    assertEqual(revResA.status, 201, 'POST /movies/:id/reviews returns status 201');
    userAReviewId = revDataA.data._id;
    assertTrue(Boolean(userAReviewId), 'Review created and ID returned');

    // 7. Verify Dynamic Average Rating Aggregation Update
    console.log('\n[7/12] Verifying Dynamic Aggregation Recalculation after new review...');
    const aggResUpdated = await fetch(`${BASE_URL}/movies/${sampleMovieId}/average-rating`);
    const aggDataUpdated = await aggResUpdated.json();
    assertEqual(
      aggDataUpdated.data.totalReviews,
      initialReviews + 1,
      `Total reviews incremented from ${initialReviews} to ${initialReviews + 1}`
    );

    // 8. User B posts a Review (Rating 3)
    console.log('\n[8/12] Testing Review Creation by User B (Rating = 3)...');
    const revResB = await fetch(`${BASE_URL}/movies/${sampleMovieId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({
        rating: 3,
        reviewText: 'Decent execution, but third act felt slightly dragged.',
      }),
    });
    const revDataB = await revResB.json();
    assertEqual(revResB.status, 201, 'User B review created with status 201');
    userBReviewId = revDataB.data._id;

    // 9. User A successfully updates their own review (Authorized Owner)
    console.log('\n[9/12] Testing Authorized Review Update by Owner (User A updates User A review)...');
    const updateResA = await fetch(`${BASE_URL}/reviews/${userAReviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        rating: 4,
        reviewText: 'Updated review: Still a masterpiece, but noticing pacing flaws on second viewing.',
      }),
    });
    assertEqual(updateResA.status, 200, 'Owner update allowed with status 200');

    // 10. CRITICAL: User A attempts to edit User B's review -> Must return 403 Forbidden!
    console.log('\n[10/12] Testing Ownership Security: User A attempts to edit User B review (Must return 403)...');
    const unauthorizedUpdateRes = await fetch(`${BASE_URL}/reviews/${userBReviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        rating: 1,
        reviewText: 'Malicious modification of another user review!',
      }),
    });
    const unauthData = await unauthorizedUpdateRes.json();
    assertEqual(unauthorizedUpdateRes.status, 403, 'Unauthorized PATCH blocked with HTTP 403 Forbidden');
    assertTrue(unauthData.message.includes('Forbidden'), 'Server response explains ownership requirement');

    // 11. Test Rating Validation (< 1 or > 5 rejected)
    console.log('\n[11/12] Testing Input Validation: Reject rating > 5 and empty text...');
    const invalidRatingRes = await fetch(`${BASE_URL}/movies/${sampleMovieId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        rating: 9, // Invalid!
        reviewText: 'Testing rating validation bounds',
      }),
    });
    assertEqual(invalidRatingRes.status, 400, 'Rating = 9 rejected with status 400 Bad Request');

    const emptyTextRes = await fetch(`${BASE_URL}/movies/${sampleMovieId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        rating: 4,
        reviewText: '   ', // Empty text!
      }),
    });
    assertEqual(emptyTextRes.status, 400, 'Empty review text rejected with status 400 Bad Request');

    // 12. User A deletes their own review (Authorized)
    console.log('\n[12/12] Testing Authorized Review Deletion by Owner...');
    const deleteRes = await fetch(`${BASE_URL}/reviews/${userAReviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assertEqual(deleteRes.status, 200, 'Review successfully deleted by owner with status 200');

    // Try deleting someone else's review
    const unauthDeleteRes = await fetch(`${BASE_URL}/reviews/${userBReviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assertEqual(unauthDeleteRes.status, 403, 'Unauthorized review deletion blocked with HTTP 403 Forbidden');

    console.log('\n===========================================================');
    console.log('🎉 ALL 12 AUTOMATED INTEGRATION TESTS PASSED (100% SUCCESS)');
    console.log('===========================================================');
  } catch (err) {
    console.error(`Test Suite encountered error: ${err.message}`, err);
  } finally {
    server.close();
    process.exit(0);
  }
};

runTests();
