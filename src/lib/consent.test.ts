import { describe, expect, it, vi } from "vitest";
import { createConsent, isAsking } from "./consent";

const memoryStorage = () => {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
};

const blockedStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

describe("consent on-switch", () => {
  it("asks nobody while nothing on the site needs consent", () => {
    const consent = createConsent(memoryStorage());
    expect(isAsking(consent.getState())).toBe(false);
  });

  it("asks once something waits, and starts it only after Accept", () => {
    const consent = createConsent(memoryStorage());
    const start = vi.fn();
    consent.whenAccepted(start);
    expect(isAsking(consent.getState())).toBe(true);
    expect(start).not.toHaveBeenCalled();

    consent.choose("accepted");
    expect(start).toHaveBeenCalledTimes(1);
    expect(isAsking(consent.getState())).toBe(false);

    consent.choose("accepted");
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("never starts anything after No thanks", () => {
    const consent = createConsent(memoryStorage());
    const start = vi.fn();
    consent.whenAccepted(start);
    consent.choose("declined");
    expect(start).not.toHaveBeenCalled();
    expect(isAsking(consent.getState())).toBe(false);
  });

  it("remembers the answer in that browser for the next visit", () => {
    const storage = memoryStorage();
    createConsent(storage).choose("accepted");

    const nextVisit = createConsent(storage);
    const start = vi.fn();
    nextVisit.whenAccepted(start);
    expect(start).toHaveBeenCalledTimes(1);
    expect(isAsking(nextVisit.getState())).toBe(false);
  });

  it("ignores a stored value it didn't write", () => {
    const storage = memoryStorage();
    storage.setItem("kn_consent", "yes please");
    const consent = createConsent(storage);
    consent.whenAccepted(() => {});
    expect(isAsking(consent.getState())).toBe(true);
  });

  it("still works for the visit when the browser blocks storage", () => {
    const consent = createConsent(blockedStorage);
    const start = vi.fn();
    consent.whenAccepted(start);
    consent.choose("accepted");
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("asks again from Cookie settings, and tells listeners each time", () => {
    const consent = createConsent(memoryStorage());
    const listener = vi.fn();
    consent.subscribe(listener);
    consent.whenAccepted(() => {});
    consent.choose("declined");
    consent.reopen();
    expect(isAsking(consent.getState())).toBe(true);
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
