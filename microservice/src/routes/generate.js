const express = require('express');
const { body } = require('express-validator');
const copyController = require('../controllers/copyController');
const socialController = require('../controllers/socialController');
const hashtagController = require('../controllers/hashtagController');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Validation Rules
const copyValidation = [
  body('product').notEmpty().trim().withMessage('product is required'),
  body('tone').notEmpty().isIn(['professional', 'playful', 'luxurious', 'bold', 'minimalist', 'inspirational', 'urgent', 'friendly'])
    .withMessage('tone must be a valid option'),
  body('platform').notEmpty().isIn(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'google', 'youtube'])
    .withMessage('platform must be a valid option'),
  body('word_limit').optional().isInt({ min: 50, max: 500 })
    .withMessage('word_limit must be between 50 and 500'),
];

const socialValidation = [
  body('platform').notEmpty().isIn(['instagram', 'twitter', 'linkedin', 'tiktok', 'facebook'])
    .withMessage('platform must be a valid option'),
  body('campaign_goal').notEmpty().trim().withMessage('campaign_goal is required'),
  body('brand_voice').notEmpty().trim().withMessage('brand_voice is required'),
];

const hashtagValidation = [
  body('content').notEmpty().trim().withMessage('content is required'),
  body('industry').notEmpty().trim().withMessage('industry is required'),
];

// POST /generate/copy
router.post('/copy', copyValidation, validate, copyController.generateAdCopy);

// POST /generate/social
router.post('/social', socialValidation, validate, socialController.generateSocial);

// POST /generate/hashtags
router.post('/hashtags', hashtagValidation, validate, hashtagController.generateHashtags);

module.exports = router;
