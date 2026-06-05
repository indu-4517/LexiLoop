import { useState } from 'react';
import { useVocab } from '../context/VocabContext';

export default function ReviewCard({ word, devMode, onNext, totalRemaining }) {
  const { submitReview } = useVocab();
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // 'correct' | 'incorrect'

  const handleReveal = () => setRevealed(true);

  const handleAnswer = async (correct) => {
    if (submitting) return;
    setSubmitting(true);
    setResult(correct ? 'correct' : 'incorrect');

    await submitReview(word._id, correct, devMode);

    // Brief pause to show feedback, then advance
    setTimeout(() => {
      setSubmitting(false);
      setResult(null);
      setRevealed(false);
      onNext();
    }, 600);
  };

  return (
    <div className={`review-card ${result ? `review-card--${result}` : ''}`}>
      <div className="review-card__progress">
        <span className="review-card__count">
          {totalRemaining} word{totalRemaining !== 1 ? 's' : ''} remaining
        </span>
        {devMode && (
          <span className="dev-badge">⚡ DEV MODE — intervals in minutes</span>
        )}
      </div>

      <div className="review-card__word-section">
        <h1 className="review-card__word">{word.word}</h1>
        {word.phonetic && (
          <p className="review-card__phonetic">{word.phonetic}</p>
        )}
      </div>

      {!revealed ? (
        <div className="review-card__hidden">
          <div className="review-card__cover">
            <span className="review-card__hint">Do you know this word?</span>
          </div>
          <button className="btn btn-reveal" onClick={handleReveal}>
            Reveal Definition
          </button>
        </div>
      ) : (
        <div className="review-card__revealed">
          <div className="review-card__definitions">
            {word.definitions.slice(0, 2).map((def, i) => (
              <div key={i} className="review-def">
                {def.partOfSpeech && (
                  <span className="review-def__pos">{def.partOfSpeech}</span>
                )}
                <p className="review-def__text">{def.definition}</p>
                {def.example && (
                  <p className="review-def__example">"{def.example}"</p>
                )}
              </div>
            ))}
          </div>

          <div className="review-card__actions">
            <button
              className="btn btn-incorrect"
              onClick={() => handleAnswer(false)}
              disabled={submitting}
            >
              {submitting && result === 'incorrect' ? '...' : '✗ Needs Work'}
            </button>
            <button
              className="btn btn-correct"
              onClick={() => handleAnswer(true)}
              disabled={submitting}
            >
              {submitting && result === 'correct' ? '...' : '✓ Got It'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}