import {useSyncExternalStore} from 'react';

// Subscribe function for useSyncExternalStore
function subscribe() {
    return () => {};
}

/**
 * Hook to check if the component has been hydrated on the client side.
 * Uses useSyncExternalStore to avoid hydration mismatches.
 *
 * @returns true if on client, false if on server
 */
export function useHydrated() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
}
