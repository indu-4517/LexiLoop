const express = require('express');
const router = express.Router();
const {
  addWord,
  getAllWords,
  getDueWords,
  submitReview,
  deleteWord,
  resetWordReview,
  advanceTime,
} = require('../controllers/vocabController');

// Word management
router.get('/', getAllWords);
router.post('/', addWord);
router.delete('/:id', deleteWord);

// Review queue
router.get('/review', getDueWords);
router.patch('/:id/review', submitReview);

// Dev mode utilities
router.patch('/:id/reset', resetWordReview);
router.post('/advance-time', advanceTime);

module.exports = router;