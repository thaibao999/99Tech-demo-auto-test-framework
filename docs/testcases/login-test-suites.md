# Login - Test Suites
**Date:** 16-Oct-2026 14:30 UTC

Refer to [Overview.md](Overview.md) for test environments and legend.


| ID | Title | Type | Priority | Automation Type | Preconditions | Steps | Expected Result |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| TC-LOGIN-001 | Login with valid credentials | Positive | P1 | API & UI (2 tests) (API: /login returns token; UI @smoke) | Logged out; account TD-01 exists | 1\. Open home page 2\. Click Log in 3\. Enter TD-01 / TD-02 4\. Click Log in | Modal closes; navbar shows "Welcome thaibao999@gmail.com"; Log out visible; Log in and Sign up hidden |
| TC-LOGIN-002 | Login via Enter key | Positive | P3 | UI | Logged out | 1\. Open Login modal 2\. Enter valid credentials 3\. Press Enter in Password field | User logged in (or document if Enter doesn't submit; usability defect) |
| TC-LOGIN-003 | Login modal opens correctly | Positive | P2 | UI | Logged out | 1\. Click Log in in navbar | Modal titled "Log in" appears with Username, Password fields, Close, Log in and × buttons; fields empty |
| TC-LOGIN-004 | Password field masks input | Positive · Security | P2 | UI | Login modal open | 1\. Type any password | Characters displayed as dots; assert element has type="password" |
| TC-LOGIN-005 | Close modal via Close button | Positive | P3 | UI | Login modal open | 1\. Click Close | Modal closes; user remains logged out |
| TC-LOGIN-006 | Close modal via × icon | Positive | P3 | UI | Login modal open | 1\. Click × | Modal closes; user remains logged out |
| TC-LOGIN-007 | Close modal via Esc / backdrop click | Positive · Usability | P4 | UI | Login modal open | 1\. Press Esc 2\. Reopen, click outside modal | Modal closes in both cases |
| TC-LOGIN-008 | Session persists on page refresh | Positive | P1 | UI | Logged in (API login, inject cookie, reload) | 1\. Refresh page (F5) | User remains logged in; welcome text still shown |
| TC-LOGIN-009 | Session persists across pages | Positive | P2 | UI | Logged in (API login, then navigate) | 1\. Navigate Home → Product → Cart → Home | Welcome message shown on every page |
| TC-LOGIN-010 | Session persists in new tab | Positive | P3 | UI | Logged in (API login, then navigate) | 1\. Open demoblaze.com in a new tab | User shown as logged in |
| TC-LOGIN-011 | Logout | Positive | P1 | UI | Logged in (API login, then navigate) | 1\. Click Log out | Navbar shows Log in/Sign up; welcome text removed; auth cookie cleared |
| TC-LOGIN-012 | Re-login after logout | Positive | P2 | API | Logged out after TC-LOGIN-011 | 1\. Log in again with valid credentials | Login succeeds |
| TC-LOGIN-013 | Login with newly signed-up user | Positive | P2 | UI | New user created via Sign up (api) | 1\. Log in with the new credentials in UI | Login succeeds; welcome shows new username |
| TC-LOGIN-014 | Both fields empty | Negative | P1 | API & UI (2 tests); API test with empty payload | Logged out; Login modal open | 1\. Click Log in with no input | Client side alert "Please fill out Username and Password."; no "/login" request was sent; user not logged in |
| TC-LOGIN-015 | Username empty | Negative | P1 | UI | Logged out; Login modal open | 1\. Enter only password TD-02 2\. Click Log in | Same validation alert; no "/login" request was sent; not logged in |
| TC-LOGIN-016 | Password empty | Negative | P1 | UI | Logged out; Login modal open | 1\. Enter only username TD-01 2\. Click Log in | Same validation alert; no "/login" request was sent; not logged in |
| TC-LOGIN-017 | Wrong password | Negative | P1 | API & UI (2 tests); UI test for the display path | Logged out; account TD-01 exists | 1\. Enter TD-01 / TD-04 2\. Click Log in | Alert errorMessage "Wrong password."; not logged in |
| TC-LOGIN-018 | Non-existent user | Negative | P1 | API | Logged out; TD-03 not registered | 1\. Enter TD-03 / any password 2\. Click Log in | Alert errorMessage "User does not exist."; not logged in |
| TC-LOGIN-019 | Correct password, wrong-case username | Negative | P2 | API | Logged out; account TD-01 exists | 1\. Enter TD-05 / TD-02 2\. Click Log in | Rejected, or handled consistently with Sign-up rules; document behavior |
| TC-LOGIN-020 | Password case sensitivity | Negative | P2 | API | Logged out; account TD-01 exists | 1\. Enter TD-01 / AB123456 2\. Click Log in | Alert errorMessage "Wrong password."; not logged in |
| TC-LOGIN-021 | Whitespace-only fields | Negative | P2 | API & UI (2 tests) | Logged out; Login modal open | 1\. Enter " " in both fields 2\. Click Log in | Treated as empty → validation alert (possible defect if sent to server) |
| TC-LOGIN-022 | SQL injection in username | Negative · Security | P1 | API | Logged out; Login modal open | 1\. Username \= TD-07, password \= TD-07 2\. Click Log in | Login rejected; no server error 5xx / data leak |
| TC-LOGIN-023 | XSS in username | Negative · Security | P1 | API & UI (2 tests) (API: stored/rejected; UI: welcome text doesn't run script) | Logged out; Login modal open | 1\. Username \= TD-08 2\. Click Log in | No script execution; input treated as text; API is rejected |
| TC-LOGIN-024 | Login while offline | Negative | P3 | UI | Logged out; Login modal open | 1\. Go offline (DevTools) or page.route() abort 2\. Submit valid credentials | User-friendly error; app doesn't hang or show logged-in state |
| TC-LOGIN-025 | Tampered/expired auth token | Negative · Security | P2 | API & UI (2 tests) (API "/check" with invalid token, plus UI refresh check) | Logged in | 1\. Edit/delete tokenp\_ cookie 2\. Refresh | User treated as logged out; no errors |
| TC-LOGIN-026 | Leading/trailing spaces in username | Edge | P2 | API | Logged out; account TD-01 exists | 1\. Enter TD-06 / TD-02 2\. Click Log in | Either trimmed and login succeeds, or rejected; consistent with Sign up |
| TC-LOGIN-027 | Very long username/password (256+ chars) | Edge | P3 | API | Logged out; Login modal open | 1\. Enter TD-09 in both fields 2\. Click Log in | Graceful rejection; no UI break or server 500 |
| TC-LOGIN-028 | Unicode/emoji input | Edge | P4 | API | Logged out; Login modal open | 1\. Enter TD-10 in both fields 2\. Click Log in | Handled gracefully ("User does not exist.") |
| TC-LOGIN-029 | Double-click Log in button | Edge | P3 | UI | Logged out; Login modal open | 1\. Enter valid creds 2\. Double-click Log in rapidly | Count requests via network listener: only single login request; no duplicate alerts or errors |
| TC-LOGIN-030 | Fields clear values after closing modal | Edge | P4 | UI | Logged out; Login modal open | 1\. Type values 2\. Close modal 3\. Reopen | the Username & password fields are cleared |
| TC-LOGIN-031 | Paste credentials | Edge | P4 | Manual | Logged out; credentials in clipboard | 1\. Paste username & password 2\. Click Log in | login succeeds |
| TC-LOGIN-032 | Browser autofill | Edge | P4 | Manual | Credentials saved in browser | 1\. Open Login modal 2\. Accept autofill 3\. Click Log in | Autofill populates fields depends on browser profile; login succeeds |
| TC-LOGIN-033 | Back button after logout | Edge · Security | P2 | UI | Logged in | 1\. Click Log out 2\. Press browser Back | User login state is not remain |
| TC-LOGIN-034 | Keyboard-only navigation | Positive · Accessibility | P4 | UI | Login modal open | 1\. Tab through modal fields and buttons | Focus visible with logical tab order: Username → Password → Close → Log in |
| TC-LOGIN-035 | Responsive layout | Edge · Usability | P3 | UI | Mobile Viewport 375px; logged out | 1\. Open Login modal 2\. Login with valid credentials | Modal fully visible and usable; navbar collapses to hamburger User can perform login properly. |
|  |  |  |  |  |  |  |  |

