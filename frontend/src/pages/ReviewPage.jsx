import { useEffect, useState } from 'react';
import { useVocab } from '../context/VocabContext';
import ReviewCard from '../components/ReviewCard';

export default function ReviewPage({ devMode }) {
  const { dueWords, reviewLoading, fetchDueWords } = useVocab();
  const [queueIndex, setQueueIndex] = useState(0);
  const [sessionQueue, setSessionQueue] = useState(null); // null = not loaded yet
  const [sessionDone, setSessionDone] = useState(false);

  // Load queue once when component mounts
  useEffect(() => {
    const load = async () => {
      await fetchDueWords();
    };
    load();
  }, [fetchDueWords]);

  // Once dueWords loads, initialize the session queue
  useEffect(() => {
    if (!reviewLoading && sessionQueue === null) {
      setSessionQueue([...dueWords]);
      setQueueIndex(0);
      setSessionDone(false);
    }
  }, [reviewLoading, dueWords, sessionQueue]);

  const handleNext = () => {
    const nextIndex = queueIndex + 1;
    if (nextIndex >= (sessionQueue?.length || 0)) {
      setSessionDone(true);
    } else {
      setQueueIndex(nextIndex);
    }
  };

  const handleRestartSession = async () => {
    setSessionQueue(null); // trigger reload
    setQueueIndex(0);
    setSessionDone(false);
    await fetchDueWords();
  };

  if (reviewLoading || sessionQueue === null) {
    return (
      <div className="page review-page">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading review queue…</span>
        </div>
      </div>
    );
  }

  const totalInSession = sessionQueue.length;

  if (totalInSession === 0) {
    return (
      <div className="page review-page">
        <div className="empty-review">
          <div className="empty-review__icon">🎉</div>
          <h2 className="empty-review__title">All caught up!</h2>
          <p className="empty-review__sub">
            No words are due for review right now.
            <br />
            Check back later or add new words to your library.
          </p>
          <button className="btn btn-ghost" onClick={handleRestartSession}>
            Refresh Queue
          </button>
        </div>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className="page review-page">
        <div className="empty-review">
          <div className="empty-review__icon">✨</div>
          <h2 className="empty-review__title">Session complete!</h2>
          <p className="empty-review__sub">
            You reviewed {totalInSession} word{totalInSession !== 1 ? 's' : ''}.
            <br />
            Great work — keep building that vocabulary!
          </p>
          <button className="btn btn-primary" onClick={handleRestartSession}>
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  const currentWord = sessionQueue[queueIndex];
  const remaining = totalInSession - queueIndex;

  return (
    <div className="page review-page">
      <ReviewCard
        key={currentWord._id}
        word={currentWord}
        devMode={devMode}
        onNext={handleNext}
        totalRemaining={remaining}
      />
    </div>
  );
}