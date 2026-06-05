const axios = require('axios');

const DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * Fetches word data from the Free Dictionary API.
 * Returns a normalized object with phonetic, definitions array.
 * Throws a descriptive error if word not found or network fails.
 */
const fetchWordDefinition = async (word) => {
  const normalizedWord = word.trim().toLowerCase();

  if (!normalizedWord) {
    throw new Error('Word cannot be empty');
  }

  let response;
  try {
    response = await axios.get(`${DICTIONARY_API_BASE}/${encodeURIComponent(normalizedWord)}`, {
      timeout: 8000,
    });
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`Word "${normalizedWord}" was not found in the dictionary. Please check the spelling.`);
      }
      throw new Error(`Dictionary API returned an error: ${error.response.status}`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Dictionary API request timed out. Please try again.');
    }
    throw new Error('Failed to reach the dictionary API. Check your internet connection.');
  }

  const entries = response.data;
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(`No data returned for "${normalizedWord}"`);
  }

  const firstEntry = entries[0];

  // Extract phonetic string
  let phonetic = firstEntry.phonetic || '';
  if (!phonetic && Array.isArray(firstEntry.phonetics)) {
    const phoneticObj = firstEntry.phonetics.find((p) => p.text);
    phonetic = phoneticObj ? phoneticObj.text : '';
  }

  // Extract definitions across all meanings
  const definitions = [];
  if (Array.isArray(firstEntry.meanings)) {
    for (const meaning of firstEntry.meanings) {
      const partOfSpeech = meaning.partOfSpeech || '';
      if (Array.isArray(meaning.definitions)) {
        for (const def of meaning.definitions.slice(0, 2)) { // up to 2 per part-of-speech
          definitions.push({
            partOfSpeech,
            definition: def.definition || '',
            example: def.example || '',
          });
        }
      }
    }
  }

  if (definitions.length === 0) {
    throw new Error(`No definitions found for "${normalizedWord}"`);
  }

  return {
    word: normalizedWord,
    phonetic,
    definitions,
  };
};

module.exports = { fetchWordDefinition };