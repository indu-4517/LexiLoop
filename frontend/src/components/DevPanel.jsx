import { useState } from 'react';
import { useVocab } from '../context/VocabContext';

export default function DevPanel({ devMode, onToggleDevMode }) {
  const { advanceTime, fetchDueWords } = useVocab();
  const [advancing, setAdvancing] = useState(false);
  const [message, setMessage] = useState('');

  const handleAdvance = async (days) => {
    setAdvancing(true);
    await advanceTime(days);
    await fetchDueWords();
    setMessage(`⚡ Advanced time by ${days} day${days > 1 ? 's' : ''}`);
    setAdvancing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className={`dev-panel ${devMode ? 'dev-panel--active' : ''}`}>
      <div className="dev-panel__header">
        <div className="dev-panel__title">
          <span className="dev-panel__icon">⚡</span>
          Dev Mode
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={devMode}
            onChange={onToggleDevMode}
          />
          <span className="toggle__slider" />
        </label>
      </div>

      {devMode && (
        <div className="dev-panel__body">
          <p className="dev-panel__desc">
            Intervals shrink to <strong>minutes</strong> instead of days.
            Got it right → 3 min · Needs work → 1 min.
          </p>
          <div className="dev-panel__actions">
            <span className="dev-panel__label">Advance all review dates:</span>
            <div className="dev-panel__btns">
              {[1, 3, 7].map((d) => (
                <button
                  key={d}
                  className="btn btn-dev btn-sm"
                  onClick={() => handleAdvance(d)}
                  disabled={advancing}
                >
                  {advancing ? '...' : `−${d}d`}
                </button>
              ))}
            </div>
          </div>
          {message && <p className="dev-panel__message">{message}</p>}
        </div>
      )}
    </div>
  );
}