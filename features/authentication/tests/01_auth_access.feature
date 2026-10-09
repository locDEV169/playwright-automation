Feature: Auth access - AuthGuard, OAuth callback, JWT, saved session
  Spec: docs/specs/authentication/AUTH_ACCESS.md
  Tester verify: docs/scenario/authentication/AUTH_ACCESS_TESTER_VERIFY.md
  Dataset: features/authentication/datasets/authAccess.dataset.ts
  Out of scope: TC_1 Google login (Manual, covered by `pnpm auth:login`), TC_2 (blank Expected)
  Mode: BDD+DDT

  @authentication @unauthenticated
  Scenario Outline: Anonymous auth access case from dataset
    When the user runs auth access case "<caseId>"
    Then the auth access case "<caseId>" should pass

    Examples: [<caseId>] <note>
      | caseId                    | note                                                       |
      | guardRedirectMail         | Harness: no cookie → /mail redirects to login              |
      | guardRedirectChat         | Harness: no cookie → /chat redirects to login              |
      | guardRedirectMailQuery    | Harness: redirect keeps the full path with query           |
      | callbackNoParams          | Harness: callback without params creates no session        |
      | callbackInvalidParams     | Harness: callback with invalid params shows error outcome  |
      | callbackErrorThenOpenMail | Harness: after callback error /mail still requires login   |
      | expiredJwtOpenMail        | Harness: expired JWT is cleared → unauthenticated          |
      | malformedJwtOpenMail      | Harness: malformed JWT is cleared → unauthenticated        |
      | expiredJwtOpenChat        | Harness: after expired JWT cleanup /chat requires login    |

  @authentication @authenticated
  Scenario Outline: Signed-in auth access case from dataset
    Given the user is signed in
    When the user runs auth access case "<caseId>"
    Then the auth access case "<caseId>" should pass

    Examples: [<caseId>] <note>
      | caseId           | note                                          |
      | signedInOpenMail | Harness: saved session opens /mail            |
      | signedInOpenChat | Harness: saved session opens /chat            |
