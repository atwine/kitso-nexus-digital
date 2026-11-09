// The site's one on-switch for anything that needs a visitor's OK before it
// runs, such as a future Meta Pixel. Such code starts itself through
// whenAccepted() and never on its own.
//
// Today nothing needs it: the fit check counter keeps no names and sets no
// cookies (the owner's choice, 4 Nov 2026). So the banner stays hidden until
// the first whenAccepted() call, and from then on it asks first-time visitors.
// The change that adds that first call also updates the privacy notice's
// "Cookies and counters" part and the banner text to say what it is.

export type ConsentChoice = "accepted" | "declined";

export interface ConsentState {
  /** Something on the site waits for the visitor's OK. */
  needed: boolean;
  /** This browser's answer, or null if it hasn't answered. */
  choice: ConsentChoice | null;
}

/** The banner is up: something needs an OK and the visitor hasn't answered. */
export const isAsking = (state: ConsentState) => state.needed && state.choice === null;

type ChoiceStorage = Pick<Storage, "getItem" | "setItem">;

const STORAGE_KEY = "kn_consent";

export const createConsent = (storage: ChoiceStorage | null) => {
  const readStoredChoice = (): ConsentChoice | null => {
    try {
      const value = storage?.getItem(STORAGE_KEY);
      return value === "accepted" || value === "declined" ? value : null;
    } catch {
      return null;
    }
  };

  let state: ConsentState = { needed: false, choice: readStoredChoice() };
  const waiting: Array<() => void> = [];
  const listeners = new Set<() => void>();

  const update = (next: Partial<ConsentState>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };

  return {
    getState: () => state,

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    /** Runs `start` now if the visitor has accepted, otherwise once they do. */
    whenAccepted(start: () => void) {
      if (state.choice === "accepted") start();
      else waiting.push(start);
      if (!state.needed) update({ needed: true });
    },

    choose(choice: ConsentChoice) {
      try {
        storage?.setItem(STORAGE_KEY, choice);
      } catch {
        // Storage is blocked (some private windows): the answer holds for this visit only.
      }
      update({ choice });
      if (choice === "accepted") waiting.splice(0).forEach((start) => start());
    },

    /**
     * "Cookie settings": show the banner again. The saved answer stays until the
     * visitor picks again. Anything already started keeps running until the page
     * reloads, so a tracker added later needs its own way to stop on "No thanks".
     */
    reopen() {
      update({ choice: null });
    },
  };
};

export type Consent = ReturnType<typeof createConsent>;

const browserStorage = (): ChoiceStorage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const consent = createConsent(browserStorage());
