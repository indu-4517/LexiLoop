import { useState, useEffect } from 'react';
import { VocabProvider, useVocab } from './context/VocabContext';
import LibraryPage from './pages/LibraryPage';
import ReviewPage from './pages/ReviewPage';
import './styles.css';

function AppInner() {
  const [tab, setTab] = useState('library');
  const [devMode, setDevMode] = useState(false);
  const { dueWords, fetchDueWords } = useVocab();

  // Refresh due count on mount and when switching to review tab
  useEffect(() => {
    fetchDueWords();
    const interval = setInterval(fetchDueWords, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchDueWords]);

  const dueCount = dueWords.length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo">
            <span className="app-logo__icon">◈</span>
            <span className="app-logo__text">LexiLoop</span>
          </div>

          <nav className="app-nav">
            <button
              className={`nav-tab ${tab === 'library' ? 'nav-tab--active' : ''}`}
              onClick={() => setTab('library')}
            >
              Library
            </button>
            <button
              className={`nav-tab ${tab === 'review' ? 'nav-tab--active' : ''}`}
              onClick={() => { setTab('review'); fetchDueWords(); }}
            >
              Review
              {dueCount > 0 && (
                <span className="nav-badge">{dueCount}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {tab === 'library' ? (
          <LibraryPage
            devMode={devMode}
            onToggleDevMode={() => setDevMode((d) => !d)}
          />
        ) : (
          <ReviewPage devMode={devMode} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <VocabProvider>
      <AppInner />
    </VocabProvider>
  );
}