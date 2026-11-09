import { useSyncExternalStore } from "react";
import { consent, type ConsentState } from "@/lib/consent";

/** The visitor's cookie answer, kept current as it changes. */
export const useConsent = (): ConsentState => useSyncExternalStore(consent.subscribe, consent.getState);
