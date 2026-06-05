/**
 * Spaced Repetition Engine
 *
 * Normal mode intervals:
 *   "Got it right"  → next review in 3 days
 *   "Needs work"    → next review in 1 day
 *
 * Dev mode intervals (for fast testing):
 *   "Got it right"  → next review in 3 minutes
 *   "Needs work"    → next review in 1 minute
 */

const INTERVALS = {
    normal: {
      correct: 3,    // days
      incorrect: 1,  // days
    },
    dev: {
      correct: 3,    // minutes
      incorrect: 1,  // minutes
    },
  };
  
  /**
   * Calculates the next review date based on performance and dev mode setting.
   * @param {boolean} isCorrect - Whether the user got the word right
   * @param {boolean} devMode   - Whether dev mode (minutes) is active
   * @returns {{ nextReviewAt: Date, reviewInterval: number }}
   */
  const calculateNextReview = (isCorrect, devMode = false) => {
    const now = new Date();
    const nextReviewAt = new Date(now);
  
    if (devMode) {
      const minutes = isCorrect ? INTERVALS.dev.correct : INTERVALS.dev.incorrect;
      nextReviewAt.setMinutes(nextReviewAt.getMinutes() + minutes);
      return { nextReviewAt, reviewInterval: minutes };
    } else {
      const days = isCorrect ? INTERVALS.normal.correct : INTERVALS.normal.incorrect;
      nextReviewAt.setDate(nextReviewAt.getDate() + days);
      return { nextReviewAt, reviewInterval: days };
    }
  };
  
  /**
   * Returns a MongoDB filter object for words due for review NOW.
   * @param {string} userId
   * @returns {object} Mongoose query filter
   */
  const getDueReviewFilter = (userId) => ({
    userId,
    nextReviewAt: { $lte: new Date() },
  });
  
  module.exports = { calculateNextReview, getDueReviewFilter, INTERVALS };