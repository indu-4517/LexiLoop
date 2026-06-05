import { useState } from 'react';
import { useVocab } from '../context/VocabContext';

export default function AddWordForm() {
  const [input, setInput] = useState('');
  const { addWord, addLoading, addError, addSuccess } = useVocab();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const result = await addWord(input.trim());
    if (result) setInput('');
  };

  return (
    <div className="add-word-section">
      <div className="section-label">Add a word</div>
      <form onSubmit={handleSubmit} className="add-word-form">
        <div className="input-row">
          <input
            type="text"
            className="word-input"
            placeholder="e.g. ephemeral"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={addLoading}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={addLoading || !input.trim()}
          >
            {addLoading ? (
              <span className="spinner-inline" />
            ) : (
              '+ Add'
            )}
          </button>
        </div>

        {addError && (
          <div className="status-message status-error">
            <span className="status-icon">⚠</span> {addError}
          </div>
        )}
        {addSuccess && (
          <div className="status-message status-success">
            <span className="status-icon">✓</span> {addSuccess}
          </div>
        )}
      </form>
    </div>
  );
}