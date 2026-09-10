import Sqids from 'sqids';

export const getSqidsInstance = () => {
  return new Sqids({
    alphabet: 'q7LmZ0aYxBv9KpR2tUeHcJ5nDsW8rF1gXoQi3lAkT6bVhP4uMdCjNyEzGwSfOI',
    minLength: 17,
    blocklist: [], // Ensure consistency with backend by disabling default profanity filters
  });
};

const sqids = getSqidsInstance();

export const encodeShareToken = (itineraryId) => {
  const ids = [Number(itineraryId)].filter(Number.isInteger);

  if (ids.length === 0) {
    return { success: false, error: 'No valid ids provided' };
  }

  return {
    success: true,
    data: sqids.encode(ids),
  };
};

export const decodeShareToken = (token) => {
  try {
    if (typeof token !== 'string' || !token) {
      return { success: false, error: 'Token must be a non-empty string' };
    }

    const decoded = sqids.decode(token);

    if (!decoded || decoded.length < 1) {
      return { success: false, error: 'Invalid or malformed token' };
    }

    return {
      success: true,
      data: {
        itineraryId: decoded[0],
      },
    };
  } catch (error) {
    return { success: false, error: 'Decoding failed' };
  }
};

export const encodeItineraryId = (itineraryId) => {
  return encodeShareToken(itineraryId);
};
