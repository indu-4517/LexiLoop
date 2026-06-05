import { createContext, useContext, useReducer, useCallback } from 'react';
import { vocabApi } from '../services/api';

const VocabContext = createContext(null);

const initialState = {
  words: [],
  dueWords: [],
  loading: false,
  reviewLoading: false,
  error: null,
  addLoading: false,
  addError: null,
  addSuccess: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_REVIEW_LOADING':
      return { ...state, reviewLoading: action.payload };
    case 'SET_ADD_LOADING':
      return { ...state, addLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ADD_ERROR':
      return { ...state, addError: action.payload, addLoading: false };
    case 'SET_ADD_SUCCESS':
      return { ...state, addSuccess: action.payload };
    case 'CLEAR_ADD_STATUS':
      return { ...state, addError: null, addSuccess: null };
    case 'SET_WORDS':
      return { ...state, words: action.payload, loading: false };
    case 'SET_DUE_WORDS':
      return { ...state, dueWords: action.payload, reviewLoading: false };
    case 'ADD_WORD':
      return {
        ...state,
        words: [action.payload, ...state.words],
        dueWords: [action.payload, ...state.dueWords],
        addLoading: false,
      };
    case 'REMOVE_WORD':
      return {
        ...state,
        words: state.words.filter((w) => w._id !== action.payload),
        dueWords: state.dueWords.filter((w) => w._id !== action.payload),
      };
    case 'UPDATE_WORD': {
      const updated = action.payload;
      const now = new Date();
      const isDue = new Date(updated.nextReviewAt) <= now;
      return {
        ...state,
        words: state.words.map((w) => (w._id === updated._id ? updated : w)),
        dueWords: isDue
          ? state.dueWords.map((w) => (w._id === updated._id ? updated : w))
          : state.dueWords.filter((w) => w._id !== updated._id),
      };
    }
    default:
      return state;
  }
}

export function VocabProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchAllWords = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const words = await vocabApi.getAllWords();
      dispatch({ type: 'SET_WORDS', payload: words });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const fetchDueWords = useCallback(async () => {
    dispatch({ type: 'SET_REVIEW_LOADING', payload: true });
    try {
      const words = await vocabApi.getDueWords();
      dispatch({ type: 'SET_DUE_WORDS', payload: words });
    } catch (err) {
      dispatch({ type: 'SET_REVIEW_LOADING', payload: false });
    }
  }, []);

  const addWord = useCallback(async (word) => {
    dispatch({ type: 'SET_ADD_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ADD_STATUS' });
    try {
      const newWord = await vocabApi.addWord(word);
      dispatch({ type: 'ADD_WORD', payload: newWord });
      dispatch({ type: 'SET_ADD_SUCCESS', payload: `"${newWord.word}" added successfully!` });
      setTimeout(() => dispatch({ type: 'CLEAR_ADD_STATUS' }), 3000);
      return newWord;
    } catch (err) {
      dispatch({ type: 'SET_ADD_ERROR', payload: err.message });
      return null;
    }
  }, []);

  const deleteWord = useCallback(async (id) => {
    try {
      await vocabApi.deleteWord(id);
      dispatch({ type: 'REMOVE_WORD', payload: id });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const submitReview = useCallback(async (id, correct, devMode) => {
    try {
      const updated = await vocabApi.submitReview(id, correct, devMode);
      dispatch({ type: 'UPDATE_WORD', payload: updated });
      return updated;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return null;
    }
  }, []);

  const advanceTime = useCallback(async (days) => {
    try {
      await vocabApi.advanceTime(days);
      await fetchDueWords();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [fetchDueWords]);

  const resetWord = useCallback(async (id) => {
    try {
      const updated = await vocabApi.resetWord(id);
      dispatch({ type: 'UPDATE_WORD', payload: updated });
      await fetchDueWords();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [fetchDueWords]);

  return (
    <VocabContext.Provider
      value={{
        ...state,
        fetchAllWords,
        fetchDueWords,
        addWord,
        deleteWord,
        submitReview,
        advanceTime,
        resetWord,
      }}
    >
      {children}
    </VocabContext.Provider>
  );
}

export const useVocab = () => {
  const ctx = useContext(VocabContext);
  if (!ctx) throw new Error('useVocab must be used within VocabProvider');
  return ctx;
};