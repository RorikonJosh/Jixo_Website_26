const R18_CONFIRMED_KEY = 'r18_confirmed';

/** Session-only: cleared when the tab or browser is closed. */
export function isR18AgeConfirmed() {
  try {
    return sessionStorage.getItem(R18_CONFIRMED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setR18AgeConfirmed() {
  try {
    sessionStorage.setItem(R18_CONFIRMED_KEY, 'true');
  } catch {
    // Private browsing — user will see the gate again on next attempt.
  }
}
