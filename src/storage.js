const prefix = 'aws-exam-prep:v1:';

function read(key, fallback) {
  try {
    const value = localStorage.getItem(prefix + key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(prefix + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const getAttempts = (exam) => {
  const value = read(`attempts:${exam}`, []);
  return Array.isArray(value) ? value : [];
};
export const saveAttempt = (exam, attempt) => write(`attempts:${exam}`, [...getAttempts(exam), attempt]);
export const getProgress = (exam) => read(`progress:${exam}`, null);
export const saveProgress = (exam, progress) => write(`progress:${exam}`, progress);
export function clearProgress(exam) {
  try { localStorage.removeItem(prefix + `progress:${exam}`); } catch { /* Storage can be unavailable. */ }
}
