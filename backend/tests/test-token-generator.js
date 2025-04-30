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


// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwiaWF0IjoxNzQ2MDA5NDgzLCJleHAiOjE3NDYwOTU4ODN9.eXw-i9PWQQxrS3spj01j2G_YXbWPBlbMUcJR-6wlK3c
