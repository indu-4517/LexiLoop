const VocabWord = require('../models/VocabWord');
const { fetchWordDefinition } = require('../services/dictionaryService');
const { calculateNextReview, getDueReviewFilter } = require('../services/spacedRepetitionService');

const USER_ID = 'test-user'; // Auth skipped per spec

/**
 * POST /api/words
 * Fetch definition from dictionary API and save to MongoDB.
 */
const addWord = async (req, res) => {
  const { word } = req.body;

  if (!word || typeof word !== 'string' || word.trim().length === 0) {
    return res.status(400).json({ error: 'A non-empty word is required.' });
  }

  const normalizedWord = word.trim().toLowerCase();

  // Check for duplicate
  const existing = await VocabWord.findOne({ userId: USER_ID, word: normalizedWord });
  if (existing) {
    return res.status(409).json({ error: `"${normalizedWord}" is already in your vocabulary list.` });
  }

  // Fetch definition from external API (service layer)
  let wordData;
  try {
    wordData = await fetchWordDefinition(normalizedWord);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }

  // Save to MongoDB
  try {
    const newWord = await VocabWord.create({
      userId: USER_ID,
      word: wordData.word,
      phonetic: wordData.phonetic,
      definitions: wordData.definitions,
      nextReviewAt: new Date(), // due immediately
    });

    return res.status(201).json(newWord);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: `"${normalizedWord}" is already in your vocabulary list.` });
    }
    console.error('DB save error:', err);
    return res.status(500).json({ error: 'Failed to save word to database.' });
  }
};

/**
 * GET /api/words
 * Returns all words for the user, sorted by creation date desc.
 */
const getAllWords = async (req, res) => {
  try {
    const words = await VocabWord.find({ userId: USER_ID }).sort({ createdAt: -1 });
    return res.json(words);
  } catch (err) {
    console.error('getAllWords error:', err);
    return res.status(500).json({ error: 'Failed to retrieve words.' });
  }
};

/**
 * GET /api/words/review
 * Returns all words currently due for review (nextReviewAt <= now).
 */
const getDueWords = async (req, res) => {
  try {
    const filter = getDueReviewFilter(USER_ID);
    const dueWords = await VocabWord.find(filter).sort({ nextReviewAt: 1 });
    return res.json(dueWords);
  } catch (err) {
    console.error('getDueWords error:', err);
    return res.status(500).json({ error: 'Failed to retrieve review queue.' });
  }
};

/**
 * PATCH /api/words/:id/review
 * Submit a review result: { correct: boolean, devMode: boolean }
 * Updates SR schedule accordingly.
 */
const submitReview = async (req, res) => {
  const { id } = req.params;
  const { correct, devMode = false } = req.body;

  if (typeof correct !== 'boolean') {
    return res.status(400).json({ error: '"correct" (boolean) is required.' });
  }

  try {
    const word = await VocabWord.findOne({ _id: id, userId: USER_ID });
    if (!word) {
      return res.status(404).json({ error: 'Word not found.' });
    }

    const { nextReviewAt, reviewInterval } = calculateNextReview(correct, devMode);

    word.nextReviewAt = nextReviewAt;
    word.reviewInterval = reviewInterval;
    word.lastReviewedAt = new Date();
    word.devModeActive = devMode;

    if (correct) {
      word.correctCount += 1;
    } else {
      word.incorrectCount += 1;
    }

    await word.save();
    return res.json(word);
  } catch (err) {
    console.error('submitReview error:', err);
    return res.status(500).json({ error: 'Failed to update review schedule.' });
  }
};

/**
 * DELETE /api/words/:id
 * Remove a word from the user's vocabulary list.
 */
const deleteWord = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await VocabWord.findOneAndDelete({ _id: id, userId: USER_ID });
    if (!result) {
      return res.status(404).json({ error: 'Word not found.' });
    }
    return res.json({ message: 'Word deleted successfully.', id });
  } catch (err) {
    console.error('deleteWord error:', err);
    return res.status(500).json({ error: 'Failed to delete word.' });
  }
};

/**
 * PATCH /api/words/:id/reset
 * Dev utility: reset a word's nextReviewAt to now (make it due immediately).
 */
const resetWordReview = async (req, res) => {
  const { id } = req.params;
  try {
    const word = await VocabWord.findOneAndUpdate(
      { _id: id, userId: USER_ID },
      { nextReviewAt: new Date(), reviewInterval: 0 },
      { new: true }
    );
    if (!word) {
      return res.status(404).json({ error: 'Word not found.' });
    }
    return res.json(word);
  } catch (err) {
    console.error('resetWordReview error:', err);
    return res.status(500).json({ error: 'Failed to reset word.' });
  }
};

/**
 * POST /api/words/advance-time
 * Dev utility: advance all word nextReviewAt times back by X days/minutes.
 * Body: { days: number }
 */
const advanceTime = async (req, res) => {
  const { days = 1 } = req.body;
  try {
    const words = await VocabWord.find({ userId: USER_ID });
    const msToSubtract = days * 24 * 60 * 60 * 1000;

    const updates = words.map((w) => {
      const newDate = new Date(w.nextReviewAt.getTime() - msToSubtract);
      return VocabWord.findByIdAndUpdate(w._id, { nextReviewAt: newDate }, { new: true });
    });

    await Promise.all(updates);
    return res.json({ message: `Advanced time by ${days} day(s) for all words.`, affected: words.length });
  } catch (err) {
    console.error('advanceTime error:', err);
    return res.status(500).json({ error: 'Failed to advance time.' });
  }
};

module.exports = {
  addWord,
  getAllWords,
  getDueWords,
  submitReview,
  deleteWord,
  resetWordReview,
  advanceTime,
};