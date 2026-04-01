const express = require('express');
const { body } = require('express-validator');
const campaignController = require('../controllers/campaignController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { rateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Apply rateLimiter and auth to all campaign routes
router.use(rateLimiter);
router.use(auth);

// Validation rules for POST/PUT
const campaignValidation = [
  body('name').notEmpty().trim().isLength({ max: 255 }).withMessage('Name must be 1-255 characters'),
  body('budget').isNumeric().isFloat({ min: 1 }).withMessage('Budget must be a number >= 1'),
  body('status').optional().isIn(['active', 'paused', 'ended', 'draft']).withMessage('Invalid status'),
  body('client_id').isUUID().withMessage('Valid client_id (UUID) is required'),
];

// GET /
router.get('/', campaignController.getAll);

// POST /
router.post('/', campaignValidation, validate, campaignController.create);

// GET /:id
router.get('/:id', campaignController.getOne);

// PUT /:id
router.put('/:id', campaignValidation, validate, campaignController.update);

// DELETE /:id
router.delete('/:id', campaignController.softDelete);

module.exports = router;
