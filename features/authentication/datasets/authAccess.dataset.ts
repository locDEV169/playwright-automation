/**
 * Dataset: AuthGuard / OAuth callback / JWT handling + signed-in access.
 * Spec: docs/specs/authentication/AUTH_ACCESS.md
 * Tester verify: docs/scenario/authentication/AUTH_ACCESS_TESTER_VERIFY.md
 * All rows are harness cases (no CSV TC yet) → tc: [].
 */

export type AuthAccessCaseId =
  | "guardRedirectMail"
  | "guardRedirectChat"
  | "guardRedirectMailQuery"
  | "callbackNoParams"
  | "callbackInvalidParams"
  | "callbackErrorThenOpenMail"
  | "expiredJwtOpenMail"
  | "malformedJwtOpenMail"
  | "expiredJwtOpenChat"
  | "signedInOpenMail"
  | "signedInOpenChat";

export type AuthAccessFlow =
  | "openPath"
  | "callbackNoParams"
  | "callbackInvalidParams"
  | "callbackErrorThenOpen"
  | "expiredJwtThenOpen"
  | "malformedJwtThenOpen";

export type AuthAccessCase = {
  id: AuthAccessCaseId;
  tc: readonly string[];
  note: string;
  flow: AuthAccessFlow;
  /** App path opened by the flow (callback flows open /auth/callback themselves). */
  path?: string;
  expect: {
    staysOn?: string;
    onLoginPage?: boolean;
    loginRedirectEquals?: string;
    loginRedirectContains?: string;
    accessTokenAbsent?: boolean;
    notOnRoute?: string;
    callbackErrorOutcome?: boolean;
  };
};

export const DATASET = {
  guardRedirectMail: {
    id: "guardRedirectMail",
    tc: [],
    note: "Harness: no cookie → /mail redirects to /login?redirect=/mail",
    flow: "openPath",
    path: "/mail",
    expect: { onLoginPage: true, loginRedirectEquals: "/mail", accessTokenAbsent: true, notOnRoute: "/mail" },
  },
  guardRedirectChat: {
    id: "guardRedirectChat",
    tc: [],
    note: "Harness: no cookie → /chat redirects to /login?redirect=/chat",
    flow: "openPath",
    path: "/chat",
    expect: { onLoginPage: true, loginRedirectEquals: "/chat", accessTokenAbsent: true, notOnRoute: "/chat" },
  },
  guardRedirectMailQuery: {
    id: "guardRedirectMailQuery",
    tc: [],
    note: "Harness: no cookie → redirect keeps the full path with query",
    flow: "openPath",
    path: "/mail?folder=inbox",
    expect: {
      onLoginPage: true,
      loginRedirectEquals: "/mail?folder=inbox",
      accessTokenAbsent: true,
      notOnRoute: "/mail",
    },
  },
  callbackNoParams: {
    id: "callbackNoParams",
    tc: [],
    note: "Harness: /auth/callback without params creates no session",
    flow: "callbackNoParams",
    expect: { accessTokenAbsent: true, notOnRoute: "/mail" },
  },
  callbackInvalidParams: {
    id: "callbackInvalidParams",
    tc: [],
    note: "Harness: /auth/callback with invalid params shows an error outcome",
    flow: "callbackInvalidParams",
    expect: { callbackErrorOutcome: true, accessTokenAbsent: true },
  },
  callbackErrorThenOpenMail: {
    id: "callbackErrorThenOpenMail",
    tc: [],
    note: "Harness: after a callback error, /mail still requires login",
    flow: "callbackErrorThenOpen",
    path: "/mail",
    expect: { loginRedirectContains: "/mail" },
  },
  expiredJwtOpenMail: {
    id: "expiredJwtOpenMail",
    tc: [],
    note: "Harness: expired accessToken JWT is cleared → unauthenticated",
    flow: "expiredJwtThenOpen",
    path: "/mail",
    expect: { accessTokenAbsent: true, onLoginPage: true },
  },
  malformedJwtOpenMail: {
    id: "malformedJwtOpenMail",
    tc: [],
    note: "Harness: malformed accessToken JWT is cleared → unauthenticated",
    flow: "malformedJwtThenOpen",
    path: "/mail",
    expect: { accessTokenAbsent: true, onLoginPage: true },
  },
  expiredJwtOpenChat: {
    id: "expiredJwtOpenChat",
    tc: [],
    note: "Harness: after expired JWT cleanup, /chat requires login again",
    flow: "expiredJwtThenOpen",
    path: "/chat",
    expect: { accessTokenAbsent: true, loginRedirectContains: "/chat" },
  },
  signedInOpenMail: {
    id: "signedInOpenMail",
    tc: [],
    note: "Harness: saved session opens /mail without Google OAuth",
    flow: "openPath",
    path: "/mail",
    expect: { staysOn: "/mail" },
  },
  signedInOpenChat: {
    id: "signedInOpenChat",
    tc: [],
    note: "Harness: saved session opens /chat without Google OAuth",
    flow: "openPath",
    path: "/chat",
    expect: { staysOn: "/chat" },
  },
} as const satisfies Record<AuthAccessCaseId, AuthAccessCase>;

export function getAuthAccessCase(caseId: string): AuthAccessCase {
  const row = (DATASET as Record<string, AuthAccessCase>)[caseId];
  if (!row) {
    throw new Error(`Unknown auth access case "${caseId}". Known: ${Object.keys(DATASET).join(", ")}`);
  }
  return row;
}
