import { useEffect, useState } from 'react';
import { useVocab } from '../context/VocabContext';
import AddWordForm from '../components/AddWordForm';
import WordCard from '../components/WordCard';
import DevPanel from '../components/DevPanel';

export default function LibraryPage({ devMode, onToggleDevMode }) {
  const { words, loading, error, fetchAllWords } = useVocab();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllWords();
  }, [fetchAllWords]);

  const filtered = words.filter((w) =>
    w.word.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <AddWordForm />

      <DevPanel devMode={devMode} onToggleDevMode={onToggleDevMode} />

      <div className="library-header">
        <div className="section-label">
          Your words
          {words.length > 0 && (
            <span className="count-badge">{words.length}</span>
          )}
        </div>
        {words.length > 4 && (
          <input
            className="search-input"
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading your words…</span>
        </div>
      ) : error ? (
        <div className="error-state">
          <span>⚠ {error}</span>
          <button className="btn btn-ghost" onClick={fetchAllWords}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {words.length === 0 ? (
            <>
              <div className="empty-state__icon">📖</div>
              <p className="empty-state__title">No words yet</p>
              <p className="empty-state__sub">
                Add your first word above to get started.
              </p>
            </>
          ) : (
            <>
              <div className="empty-state__icon">🔍</div>
              <p className="empty-state__title">No matches</p>
              <p className="empty-state__sub">Try a different search.</p>
            </>
          )}
        </div>
      ) : (
        <div className="word-list">
          {filtered.map((w) => (
            <WordCard key={w._id} word={w} devMode={devMode} />
          ))}
        </div>
      )}
    </div>
  );
}