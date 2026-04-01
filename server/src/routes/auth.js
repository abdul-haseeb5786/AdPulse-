const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');

const router = express.Router();

// POST /login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.login
);

module.exports = router;
