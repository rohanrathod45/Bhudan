/**
 * auth.test.js - Verification test for signup and login flow using Node.js built-in fetch
 */
const express = require('express');
const authRoutes = require('../routes/authRoutes');
const { seed, users } = require('../dataAccess');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

async function runTests() {
  console.log('--- Starting Auth Verification Tests ---');

  await seed();

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/auth`;

  try {
    const testEmail = `test_user_${Date.now()}@bhudan.gov.in`;
    const testPassword = 'SecurePassword@123';
    const testName = 'Dr. Vikram Sharma';
    const testRole = 'analyst';

    // 1. Register a new user
    console.log('1. Testing User Registration (Name, Who are you / Role, Email, Password)...');
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        role: testRole,
        email: testEmail,
        password: testPassword,
      }),
    });
    const regData = await regRes.json();

    if (regRes.status !== 201 || !regData.success) {
      throw new Error(`Registration failed: ${regRes.status} ${JSON.stringify(regData)}`);
    }
    console.log(`✓ Registered successfully! ID: ${regData.user.id}, Role: ${regData.user.role}`);

    // 2. Duplicate registration check
    console.log('2. Testing Duplicate Email Prevention...');
    const dupRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        role: testRole,
        email: testEmail,
        password: testPassword,
      }),
    });
    if (dupRes.status !== 409) {
      throw new Error(`Duplicate registration expected 409, got ${dupRes.status}`);
    }
    console.log('✓ Duplicate registration correctly rejected with 409 Conflict');

    // 3. Login with newly registered credentials
    console.log('3. Testing Login with Registered Credentials (saved in database)...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginData)}`);
    }
    console.log('✓ Logged in successfully! Received JWT token for user:', loginData.user.name);
    const token = loginData.token;

    // 4. Login with invalid password
    console.log('4. Testing Invalid Password Rejection...');
    const badLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'IncorrectPassword',
      }),
    });
    if (badLoginRes.status !== 401) {
      throw new Error(`Invalid password expected 401, got ${badLoginRes.status}`);
    }
    console.log('✓ Invalid password correctly rejected with 401 Unauthorized');

    // 5. Test /api/auth/me with JWT token
    console.log('5. Testing /api/auth/me with JWT session token...');
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.user.email !== testEmail) {
      throw new Error(`/api/auth/me failed: ${meRes.status} ${JSON.stringify(meData)}`);
    }
    console.log(`✓ /api/auth/me authenticated successfully: ${meData.user.name} (${meData.user.role})`);

    // 6. Test that /api/auth/demo is removed (404)
    console.log('6. Testing that demo endpoint is removed...');
    const demoRes = await fetch(`${baseUrl}/demo`);
    if (demoRes.status !== 404) {
      throw new Error(`Expected /api/auth/demo to be 404, got ${demoRes.status}`);
    }
    console.log('✓ Demo endpoint correctly returns 404 Not Found');

    console.log('\n--- ALL AUTH TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
