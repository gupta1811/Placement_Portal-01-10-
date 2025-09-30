// const express = require('express');
// const { register, login, getMe } = require('../controllers/authController');
// const router = express.Router();

// console.log('🛣️ Auth routes loaded');

// router.post('/register', (req, res, next) => {
//   console.log('📝 POST /register hit');
//   register(req, res, next);
// });

// router.post('/login', (req, res, next) => {
//   console.log('🔐 POST /login hit');
//   login(req, res, next);
// });

// const protect = require('../middleware/auth');
// // const { register, login, getMe } = require('../controllers/authController');
// router.get('/me', protect, getMe);

// module.exports = router;



const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

console.log('Auth routes loaded');

// Public routes
router.post('/register', (req, res, next) => {
  console.log('POST /register hit');
  register(req, res, next);
});

router.post('/login', (req, res, next) => {
  console.log('POST /login hit');
  login(req, res, next);
});

// Protected routes
router.get('/me', protect, (req, res, next) => {
  console.log('GET /me hit');
  getMe(req, res, next);
});

module.exports = router;
