export const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  return fallback;
};
