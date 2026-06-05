import { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { useCountdown } from '../hooks/useCountdown';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function WordCard({ word, devMode }) {
  const { deleteWord, resetWord } = useVocab();
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const countdown = useCountdown(word.nextReviewAt);

  const isDue = new Date(word.nextReviewAt) <= new Date();

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    await deleteWord(word._id);
  };

  const handleReset = async (e) => {
    e.stopPropagation();
    await resetWord(word._id);
  };

  return (
    <div
      className={`word-card ${expanded ? 'word-card--expanded' : ''} ${deleting ? 'word-card--deleting' : ''}`}
      onClick={() => setExpanded((x) => !x)}
    >
      <div className="word-card__header">
        <div className="word-card__left">
          <span className="word-card__word">{word.word}</span>
          {word.phonetic && (
            <span className="word-card__phonetic">{word.phonetic}</span>
          )}
        </div>
        <div className="word-card__right">
          <span className={`review-badge ${isDue ? 'review-badge--due' : 'review-badge--upcoming'}`}>
            {isDue ? 'Due now' : countdown}
          </span>
          <button
            className="icon-btn icon-btn--delete"
            onClick={handleDelete}
            title="Delete word"
          >
            ×
          </button>
        </div>
      </div>

      {expanded && (
        <div className="word-card__body" onClick={(e) => e.stopPropagation()}>
          {word.definitions.slice(0, 2).map((def, i) => (
            <div key={i} className="word-card__definition">
              {def.partOfSpeech && (
                <span className="word-card__pos">{def.partOfSpeech}</span>
              )}
              <p className="word-card__def-text">{def.definition}</p>
              {def.example && (
                <p className="word-card__example">"{def.example}"</p>
              )}
            </div>
          ))}

          <div className="word-card__meta">
            <span>✓ {word.correctCount} correct</span>
            <span>✗ {word.incorrectCount} incorrect</span>
            <span>Added {formatDate(word.createdAt)}</span>
          </div>

          {devMode && (
            <button
              className="btn btn-dev btn-sm"
              onClick={handleReset}
              title="Reset next review to now"
            >
              ⚡ Reset to Due Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}