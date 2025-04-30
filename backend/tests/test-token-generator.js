/* 
Small helper test to generate a token for the api req
*/

require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Settings } = require('../src/config/settings');

// Secret key from settings
const SECRET_KEY = Settings.api.jwtSecret;

// User ID from settings
const TEST_USER_ID = Settings.api.testUserId;

// Create payload
const payload = {
  sub: TEST_USER_ID,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiration
};

// Generate token
const token = jwt.sign(payload, SECRET_KEY);

// Print the token
console.log('Authorization: Bearer ' + token);
console.log('For curl use: -H \'Authorization: Bearer ' + token + '\'\n');
