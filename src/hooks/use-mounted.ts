"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Returns true after the component has hydrated on the client.
 *  Used to avoid hydration mismatches with persisted Zustand state. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
