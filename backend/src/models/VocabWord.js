const mongoose = require('mongoose');

const definitionSchema = new mongoose.Schema({
  partOfSpeech: { type: String, default: '' },
  definition: { type: String, required: true },
  example: { type: String, default: '' },
}, { _id: false });

const vocabWordSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: 'test-user',
      index: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phonetic: {
      type: String,
      default: '',
    },
    definitions: {
      type: [definitionSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one definition is required',
      },
    },
    // Spaced repetition fields
    reviewInterval: {
      type: Number,
      default: 0, // days until next review (0 = due now / new)
    },
    nextReviewAt: {
      type: Date,
      default: () => new Date(), // due immediately when first added
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    // Dev mode: when true, intervals shrink to minutes instead of days
    devModeActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one word per user
vocabWordSchema.index({ userId: 1, word: 1 }, { unique: true });

// Index for efficient "due for review" queries
vocabWordSchema.index({ userId: 1, nextReviewAt: 1 });

const VocabWord = mongoose.model('VocabWord', vocabWordSchema);

module.exports = VocabWord;