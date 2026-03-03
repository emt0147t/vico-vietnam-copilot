/**
 * Safe Clerk hooks — return sensible defaults when ClerkProvider is not mounted.
 * This allows the app to run without Clerk authentication configured.
 */
import { useAuth as _useAuth, useUser as _useUser, useClerk as _useClerk } from '@clerk/clerk-react';

const CLERK_AVAILABLE = !!(process.env as any).VITE_CLERK_PUBLISHABLE_KEY;

/** Safe useAuth — returns "signed in" defaults when Clerk is absent */
export function useSafeAuth() {
  if (!CLERK_AVAILABLE) {
    return { isSignedIn: true, isLoaded: true, userId: 'anonymous' } as const;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return _useAuth();
}

/** Safe useUser — returns a stub user when Clerk is absent */
export function useSafeUser() {
  if (!CLERK_AVAILABLE) {
    return {
      user: {
        id: 'anonymous',
        firstName: 'User',
        lastName: '',
        fullName: 'User',
        primaryEmailAddress: { emailAddress: '' },
        imageUrl: '',
      },
      isLoaded: true,
    } as const;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return _useUser();
}

/** Safe useClerk — returns a stub clerk instance when Clerk is absent */
export function useSafeClerk() {
  if (!CLERK_AVAILABLE) {
    return {
      signOut: async () => { /* no-op */ },
      openSignIn: () => { /* no-op */ },
      openSignUp: () => { /* no-op */ },
    } as any;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return _useClerk();
}
