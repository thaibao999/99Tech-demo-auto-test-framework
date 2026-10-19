# Test Case Suite – DemoBlaze Product Store

**Application Under Test:** [https\://www\.demoblaze.com/](https://www.demoblaze.com/) **Features in Scope:** Login, Cart (incl. Add to Cart, Delete, Total, Place Order) **Author:** QA **Date:** 16-Oct-2026 **Version:** 1.4 (review fixes: removed duplicate Cart cases, renumbered Cart IDs, aligned layers with expected results)

---

## 1\. Overview

### 1.1 Scope

| Feature | In Scope |
| :---- | :---- |
| Login modal (open, submit, close, validation, session) | ✅ |
| Logout (as it relates to session/cart) | ✅ |
| Add to cart from product detail page | ✅ |
| Cart page (list, price, total, delete) | ✅ |
| Place Order modal & Purchase confirmation | ✅ |
| Sign up, Contact, About us, Category filters | ❌ (only used as preconditions) |

### 1.2 Test Environment

| Item | Value |
| :---- | :---- |
| URL | [https\://www\.demoblaze.com/](https://www.demoblaze.com/) |
| API base | [https\://api.demoblaze.com/](https://api.demoblaze.com/) |
| Browsers | Chrome (latest), Firefox (latest), Safari (latest), Edge (latest) |
| Devices | Desktop 1920x1080, Tablet 768x1024, Mobile 375x812 |
| Network | Normal, throttled "Slow 3G", Offline |

### 1.3 Test Data

| ID | Data | Value |
| :---- | :---- | :---- |
| TD-01 | Valid username | `thaibao999@gmail.com` |
| TD-02 | Valid password | `ab123456` |
| TD-03 | Non-existent username | `no_such_user_<timestamp>` |
| TD-04 | Wrong password | `wrongPass!1` |
| TD-05 | Username in different case | `THAIBAO999@GMAIL.COM` |
| TD-06 | Username with leading/trailing spaces |  `thaibao999@gmail.com`  |
| TD-07 | SQL injection string | `' OR '1'='1` |
| TD-08 | XSS string | `<script>alert(1)</script>` |
| TD-09 | Long string (256+ chars) | `a` x 256 |
| TD-10 | Unicode / emoji | `tëst_用户_😀` |
| TD-11 | Products | Samsung galaxy s6 (\$360), Nokia lumia 1520 (\$820), Sony vaio i5 (\$790), Apple monitor 24 (\$400) |

### 1.4 UI Elements Observed

- **Navbar:** Home, Contact, About us, Cart, Log in, Sign up (after login: Welcome `<user>`, Log out)  
- **Login modal:** Title "Log in", Username (text), Password (password), buttons **Close**, **Log in**, and **×**  
- **Product page (`prod.html?idp_=<id>`):** name, price "\*includes tax", description, **Add to cart**  
- **Cart page (`cart.html`):** "Products" table (Pic, Title, Price, x → Delete link), "Total", **Place Order**  
- **Place order modal:** Total, Name, Country, City, Credit card, Month, Year; buttons **Close**, **Purchase**, **×**

### 1.5 Legend

**Type** (main label, plus an optional secondary label)

| Type | Meaning | Example |
| :---- | :---- | :---- |
| **Positive** | Valid input and expected user behavior; the feature works as designed | Valid login shows "Welcome …" |
| **Negative** | Invalid, missing or unauthorized input; the system must refuse it cleanly | Wrong password shows "Wrong password." |
| **Edge** | Valid but extreme or unusual conditions: limits, timing, concurrency, environment | 256-char username, double-click Purchase, two tabs |
| Secondary label: **Security / Usability / Accessibility** | Extra focus area of the test | "Negative · Security" \= SQL injection |

**Priority:** P1 \= Critical, P2 \= High, P3 \= Medium, P4 \= Low

**Automation layer**

| Layer | Scripts per test case | What it does | Tooling suggestion |
| :---- | :---- | :---- | :---- |
| **API** | 1 | Calls the endpoint directly and checks the server response. Used where the logic lives on the server (auth, cart storage, data isolation, input handling) | Playwright `request` / REST Assured / Postman \+ Newman |
| **UI** | 1 | Drives the browser from start to finish. Used where the behavior exists only in the browser: client-side validation, JS alerts, modals, navigation, cookies, layout | Playwright / Selenium |
| **UI (API setup)** | 1 | A UI test whose setup (login, filling the cart) is done through the API for speed and stability; only the result is checked in the browser | Playwright (API context \+ page) |
| **API & UI (2 tests)** | 2 (independent) | Critical flow: one API test for the server logic **plus** one full UI smoke test of the user journey | Both |
| **Manual** | – | Low return on investment, or depends on the browser profile or OS | Exploratory checklist |

### 1.6 Key Findings Behind the Automation Layers

- **Cart Total is computed in the browser.** `/viewcart` returns item IDs and `/view` returns prices; the page adds them up. Total checks must be UI or UI (API setup).  
- **Place Order has no "create order" API.** Validation (Name/Credit card) and the confirmation dialog are client-side; purchase only clears the cart (`/deletecart`). All Place Order tests are UI.  
- **The empty-field login check runs in the browser** before any request is sent. It's UI, plus an optional API test to confirm the server rejects empty input too.  
- **The auth token is stored in a cookie (`tokenp_`).** An API login can inject this cookie into the browser, which is what makes UI (API setup) tests possible.  
- Confirmed in the browser: `POST /view`, `POST /viewcart`. To confirm in DevTools before automating: `/login`, `/check`, `/signup`, `/addtocart`, `/deleteitem`, `/deletecart`, `/entries`, `/bycat`.

---

## 2\. Login – Test Cases

| ID | Title | Type | Priority | Automation | Preconditions | Steps | Expected Result |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| TC-LOGIN-001 | Login with valid credentials | Positive | P1 | **API & UI (2 tests)** (API: `/login` returns token; UI `@smoke`) | Logged out; account TD-01 exists | 1\. Open home page 2\. Click **Log in** 3\. Enter TD-01 / TD-02 4\. Click **Log in** | Modal closes; navbar shows "Welcome [thaibao999@gmail.com](mailto:thaibao999@gmail.com)"; **Log out** visible; **Log in** and **Sign up** hidden |
| TC-LOGIN-002 | Login via Enter key | Positive | P3 | **UI** | Logged out | 1\. Open Login modal 2\. Enter valid credentials 3\. Press **Enter** in Password field | User logged in (or document if Enter doesn't submit; usability defect) |
| TC-LOGIN-003 | Login modal opens correctly | Positive | P2 | **UI** | Logged out | 1\. Click **Log in** in navbar | Modal titled "Log in" appears with Username, Password fields, Close, Log in and × buttons; fields empty |
| TC-LOGIN-004 | Password field masks input | Positive · Security | P2 | **UI** (assert `type="password"`) | Login modal open | 1\. Type any password | Characters displayed as dots |
| TC-LOGIN-005 | Close modal via **Close** button | Positive | P3 | **UI** | Login modal open | 1\. Click **Close** | Modal closes; user remains logged out |
| TC-LOGIN-006 | Close modal via **×** icon | Positive | P3 | **UI** | Login modal open | 1\. Click **×** | Modal closes; user remains logged out |
| TC-LOGIN-007 | Close modal via Esc / backdrop click | Positive · Usability | P4 | **UI** | Login modal open | 1\. Press **Esc** 2\. Reopen, click outside modal | Modal closes in both cases |
| TC-LOGIN-008 | Session persists on page refresh | Positive | P1 | **UI (API setup)** (API login, inject cookie, reload) | Logged in | 1\. Refresh page (F5) | User remains logged in; welcome text still shown |
| TC-LOGIN-009 | Session persists across pages | Positive | P2 | **UI (API setup)** (API login, then navigate) | Logged in | 1\. Navigate Home → Product → Cart → Home | Welcome message shown on every page |
| TC-LOGIN-010 | Session persists in new tab | Positive | P3 | **UI** | Logged in | 1\. Open demoblaze.com in a new tab | User shown as logged in |
| TC-LOGIN-011 | Logout | Positive | P1 | **UI** (check navbar and cookie removed) | Logged in | 1\. Click **Log out** | Navbar shows **Log in**/**Sign up**; welcome text removed; auth cookie cleared |
| TC-LOGIN-012 | Re-login after logout | Positive | P2 | **API** | Logged out after TC-LOGIN-011 | 1\. Log in again with valid credentials | Login succeeds |
| TC-LOGIN-013 | Login with newly signed-up user | Positive | P2 | **API** (`/signup`, then `/login`) | New user created via Sign up | 1\. Log in with the new credentials | Login succeeds; welcome shows new username |
| TC-LOGIN-014 | Both fields empty | Negative | P1 | **UI** (client-side alert; optional API test with empty payload) | Logged out; Login modal open | 1\. Click **Log in** with no input | Alert "Please fill out Username and Password."; user not logged in |
| TC-LOGIN-015 | Username empty | Negative | P1 | **UI** | Logged out; Login modal open | 1\. Enter only password TD-02 2\. Click **Log in** | Same validation alert; not logged in |
| TC-LOGIN-016 | Password empty | Negative | P1 | **UI** | Logged out; Login modal open | 1\. Enter only username TD-01 2\. Click **Log in** | Same validation alert; not logged in |
| TC-LOGIN-017 | Wrong password | Negative | P1 | **API** (`errorMessage`; alert text covered by one UI test) | Logged out; account TD-01 exists | 1\. Enter TD-01 / TD-04 2\. Click **Log in** | Alert "Wrong password."; not logged in |
| TC-LOGIN-018 | Non-existent user | Negative | P1 | **API** | Logged out; TD-03 not registered | 1\. Enter TD-03 / any password 2\. Click **Log in** | Alert "User does not exist."; not logged in |
| TC-LOGIN-019 | Correct password, wrong-case username | Negative | P2 | **API** (data-driven) | Logged out; account TD-01 exists | 1\. Enter TD-05 / TD-02 2\. Click **Log in** | Rejected, or handled consistently with Sign-up rules; document behavior |
| TC-LOGIN-020 | Password case sensitivity | Negative | P2 | **API** (data-driven) | Logged out; account TD-01 exists | 1\. Enter TD-01 / `AB123456` 2\. Click **Log in** | Alert "Wrong password." |
| TC-LOGIN-021 | Whitespace-only fields | Negative | P2 | **API & UI (2 tests)** (UI: browser check; API: server check) | Logged out; Login modal open | 1\. Enter `"   "` in both fields 2\. Click **Log in** | Treated as empty → validation alert (possible defect if sent to server) |
| TC-LOGIN-022 | SQL injection in username | Negative · Security | P1 | **API** (no 5xx or leaked data) | Logged out; Login modal open | 1\. Username \= TD-07, password \= TD-07 2\. Click **Log in** | Login rejected; no server error / data leak |
| TC-LOGIN-023 | XSS in username | Negative · Security | P1 | **API & UI (2 tests)** (API: stored/rejected; UI: welcome text doesn't run script) | Logged out; Login modal open | 1\. Username \= TD-08 2\. Click **Log in** | No script execution; input treated as text; rejected |
| TC-LOGIN-024 | Login while offline | Negative | P3 | **UI** (`page.route()` abort / offline context) | Logged out; Login modal open | 1\. Go offline (DevTools) 2\. Submit valid credentials | User-friendly error; app doesn't hang or show logged-in state |
| TC-LOGIN-025 | Tampered/expired auth token | Negative · Security | P2 | **API & UI (2 tests)** (API: `/check` with invalid tokens; UI (API setup): inject tampered `tokenp_`, reload, check navbar) | Logged in | 1\. Edit/delete `tokenp_` cookie 2\. Refresh | User treated as logged out; no errors |
| TC-LOGIN-026 | Leading/trailing spaces in username | Edge | P2 | **API** (data-driven) | Logged out; account TD-01 exists | 1\. Enter TD-06 / TD-02 2\. Click **Log in** | Either trimmed and login succeeds, or rejected; consistent with Sign up |
| TC-LOGIN-027 | Very long username/password (256+ chars) | Edge | P3 | **API** (boundary payloads: 255, 256, 1000+ chars; check input `maxlength` in DevTools first) | Logged out | 1\. Send `/login` with TD-09 in both fields | Graceful rejection (e.g. "User does not exist."); no 5xx; normal response time |
| TC-LOGIN-028 | Unicode/emoji input | Edge | P4 | **API** (data-driven) | Logged out; Login modal open | 1\. Enter TD-10 in both fields 2\. Click **Log in** | Handled gracefully ("User does not exist.") |
| TC-LOGIN-029 | Double-click **Log in** button | Edge | P3 | **UI** (count requests via network listener) | Logged out; Login modal open | 1\. Enter valid creds 2\. Double-click **Log in** rapidly | Single login request; no duplicate alerts or errors |
| TC-LOGIN-030 | Fields retain/clear values after closing modal | Edge | P4 | **UI** | Logged out; Login modal open | 1\. Type values 2\. Close modal 3\. Reopen | Document behavior; ideally the password is cleared |
| TC-LOGIN-031 | Paste credentials | Edge | P4 | **Manual** (little value beyond `fill()`) | Logged out; credentials in clipboard | 1\. Paste username & password 2\. Click **Log in** | Accepted; login succeeds |
| TC-LOGIN-032 | Browser autofill | Edge | P4 | **Manual** (depends on browser profile) | Credentials saved in browser | 1\. Open Login modal 2\. Accept autofill 3\. Click **Log in** | Autofill populates fields; login succeeds |
| TC-LOGIN-033 | Back button after logout | Edge · Security | P2 | **UI** | Logged in | 1\. Click **Log out** 2\. Press browser **Back** | Logged-in state not restored |
| TC-LOGIN-034 | Keyboard-only navigation | Positive · Accessibility | P3 | **UI** (tab order; focus visibility checked manually) | Login modal open | 1\. Tab through modal fields and buttons | Logical tab order: Username → Password → Close → Log in; focus visible |
| TC-LOGIN-035 | Responsive layout | Edge · Usability | P3 | **UI** (mobile viewport / visual snapshot) | Viewport 375px; logged out | 1\. Open Login modal | Modal fully visible and usable; navbar collapses to hamburger |

---

## 3\. Cart – Test Cases

| ID | Title | Type | Priority | Automation | Preconditions | Steps | Expected Result |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| TC-CART-001 | Add single product to cart (logged in) | Positive | P1 | **API & UI (2 tests)** (API: `/addtocart`, then `/viewcart`; UI `@smoke`) | Logged in; empty cart | 1\. Open Samsung galaxy s6 2\. Click **Add to cart** 3\. Accept alert 4\. Open **Cart** | Alert "Product added"; cart lists Samsung galaxy s6, \$360; Total \= 360 |
| TC-CART-002 | Add product to cart as guest | Positive | P1 | **API** (guest cookie, `flag:false`) | Logged out; empty cart | Same as TC-CART-001 | Product added and shown in cart for guest session |
| TC-CART-003 | Add multiple different products (one per category) | Positive | P1 | **UI (API setup)** (add via API, check Total in UI) | Empty cart | 1\. Add Samsung galaxy s6 (\$360, Phone) 2\. Add Sony vaio i5 (\$790, Laptop) 3\. Add Apple monitor 24 (\$400, Monitor) 4\. Open Cart | 3 rows shown; Total \= 1550 |
| TC-CART-004 | Add same product multiple times | Positive | P2 | **UI (API setup)** | Empty cart | 1\. Click **Add to cart** for Samsung galaxy s6 3 times (accept alert each time) 2\. Open Cart | 3 separate rows (no quantity field); Total \= 1080 |
| TC-CART-005 | Product details correct in cart | Positive | P1 | **UI (API setup)** (add via API, check Pic/Title/Price in UI) | Product in cart | 1\. Open Cart | Pic, Title and Price match the product page |
| TC-CART-006 | Delete a product | Positive | P1 | **UI (API setup)** (add via API, Delete in UI, check UI Total against `/view` prices and `/viewcart`) | ≥2 products in cart | 1\. Click **Delete** on one row | Row removed; Total equals the sum of the remaining rows' prices from `/view` |
| TC-CART-007 | Delete all products | Positive | P2 | **UI (API setup)** | ≥1 product in cart | 1\. Delete every row | Table empty; Total blank/0 |
| TC-CART-008 | Delete one of duplicate items | Positive | P2 | **API** (`/deleteitem` by id, then `/viewcart`) | Same product x3 in cart | 1\. Delete one row | Only one row removed; 2 remain |
| TC-CART-009 | Cart persists after refresh | Positive | P1 | **UI (API setup)** (add via API, reload, check UI) | Products in cart | 1\. Refresh cart page | Same items and Total |
| TC-CART-010 | Cart persists across logout/login | Positive | P1 | **API** (log in again for a new token, `/viewcart`) | Logged in with items | 1\. Log out 2\. Log in again 3\. Open Cart | User's items still present |
| TC-CART-011 | Cart isolation between users | Positive · Security | P1 | **API** (User B's `/viewcart` has no User A items) | User A has items; User B exists | 1\. Log out 2\. Log in as User B 3\. Open Cart | User A's items NOT visible to User B |
| TC-CART-012 | Guest vs logged-in cart | Positive | P2 | **UI (API setup)** (guest cookie in browser, then log in; compare with API) | Logged out; empty cart | 1\. As guest add item 2\. Log in 3\. Open Cart | Document behavior (merge vs separate); no data loss or errors |
| TC-CART-013 | Navigate to cart from navbar | Positive | P2 | **UI** | Any page open | 1\. Click **Cart** | cart.html loads with Products table and Total |
| TC-CART-014 | Open Place Order modal | Positive | P1 | **UI (API setup)** (add via API, check modal Total in UI) | Items in cart | 1\. Click **Place Order** | Modal shows Total (matches cart), Name, Country, City, Credit card, Month, Year, Close, Purchase |
| TC-CART-015 | Successful purchase with all fields | Positive | P1 | **UI** `@smoke` (main E2E flow) | Items in cart | 1\. Place Order 2\. Fill all fields with valid test data (use a test card number such as `4111111111111111`) 3\. Click **Purchase** | "Thank you for your purchase\!" dialog with Id, Amount (= total), Card number, Name, Date; click **OK** → redirect to Home |
| TC-CART-016 | Successful purchase with only required fields | Positive | P2 | **UI** | Items in cart | 1\. Place Order 2\. Fill only Name and Credit card 3\. **Purchase** | Purchase succeeds |
| TC-CART-017 | Cart emptied after purchase | Positive | P1 | **UI (API setup)** (add items via API, purchase in UI, check `/viewcart` empty) | Items in cart (added via API) | 1\. Click **Place Order** 2\. Fill Name and Credit card 3\. Click **Purchase**, then **OK** 4\. Open Cart | `/viewcart` returns no items; cart page shows an empty table |
| TC-CART-018 | Confirmation details accuracy | Positive | P1 | **UI (API setup)** (add items via API, purchase in UI) | Items in cart (added via API) | 1\. Click **Place Order** 2\. Fill Name and Credit card 3\. Click **Purchase** 4\. Review confirmation | Amount \= cart total; Name & Card match input; Date \= current date |
| TC-CART-019 | Close Place Order modal | Positive | P3 | **UI** | Place Order modal open | 1\. Click **Close** / **×** | Modal closes; cart unchanged |
| TC-CART-020 | Purchase with all fields empty | Negative | P1 | **UI** (client-side alert) | Items in cart; Place Order modal open | 1\. Click **Purchase** with no input | Alert "Please fill out Name and Creditcard."; no order |
| TC-CART-021 | Purchase without Name | Negative | P1 | **UI** | Items in cart; Place Order modal open | 1\. Fill only Credit card 2\. **Purchase** | Same validation alert |
| TC-CART-022 | Purchase without Credit card | Negative | P1 | **UI** | Items in cart; Place Order modal open | 1\. Fill only Name 2\. **Purchase** | Same validation alert |
| TC-CART-023 | Place Order with empty cart | Negative | P1 | **UI** | Empty cart | 1\. Click **Place Order** 2\. Fill Name \+ Card 3\. **Purchase** | Should be blocked. **Observed:** Place Order button visible and modal opens with empty Total; verify whether a \$0 purchase succeeds (possible defect) |
| TC-CART-024 | Non-numeric credit card | Negative | P2 | **UI** (client-side only) | Items in cart; Place Order modal open | 1\. Name \= valid, Credit card \= `abcd-efgh` 2\. **Purchase** | Should be rejected (possible defect if accepted) |
| TC-CART-025 | Invalid month / year | Negative | P2 | **UI** | Items in cart; Place Order modal open | 1\. Month \= `13` or `abc`; Year \= `1999` / `-1` 2\. **Purchase** | Should be rejected / validated (possible defect if accepted) |
| TC-CART-026 | Expired card date | Negative | P3 | **UI** | Items in cart; Place Order modal open | 1\. Month/Year in the past 2\. **Purchase** | Should be rejected |
| TC-CART-027 | Whitespace-only Name/Card | Negative | P2 | **UI** | Items in cart; Place Order modal open | 1\. Name \= `"   "`, Card \= `"   "` 2\. **Purchase** | Treated as empty → validation alert |
| TC-CART-028 | XSS in Place Order fields | Negative · Security | P1 | **UI** (rendered in confirmation dialog) | Items in cart; Place Order modal open | 1\. Name \= TD-08 2\. **Purchase** | No script execution; name rendered as plain text in confirmation |
| TC-CART-029 | Add to cart while offline | Negative | P3 | **UI** (`page.route()` abort) | Product page open | 1\. Go offline 2\. Click **Add to cart** | Error shown; product not falsely reported as added |
| TC-CART-030 | Add to cart with invalid product id | Negative | P3 | **API** (`/addtocart` with invalid `prod_id`, then `/viewcart`) | Empty cart | 1\. Call `/addtocart` with `prod_id` \= `99999`, `abc`, empty 2\. Call `/viewcart` | Invalid id rejected or not stored; `/viewcart` has no invalid entry. If accepted: log a defect and add a UI (API setup) check that the Cart page shows no blank row and Total is never `NaN` |
| TC-CART-031 | Rapid repeated Add to cart clicks | Edge | P2 | **API** (parallel `/addtocart`, count via `/viewcart`) | Empty cart; product page open | 1\. Click **Add to cart** 5x quickly | Cart item count equals number of successful "Product added" alerts; no lost/duplicate rows |
| TC-CART-032 | Large cart (e.g., 20+ items) | Edge | P3 | **UI (API setup)** (add 20 via API, check UI) | Empty cart | 1\. Add 20+ items 2\. Open Cart | All items listed; Total correct; page performance acceptable |
| TC-CART-033 | Rapid delete clicks | Edge | P3 | **UI** | ≥3 products in cart | 1\. Click **Delete** on multiple rows quickly | Correct rows removed; Total consistent after refresh |
| TC-CART-034 | Cart in two tabs | Edge | P3 | **UI (API setup)** (delete via API or tab A, reload tab B) | Products in cart; cart open in Tab A and Tab B | 1\. Delete item in A 2\. Refresh B | B reflects deletion |
| TC-CART-035 | Long values in Place Order fields | Edge | P3 | **UI** | Items in cart; Place Order modal open | 1\. Enter 256+ chars in Name/Country/City 2\. **Purchase** | Handled without UI break; confirmation readable |
| TC-CART-036 | Unicode in Name/City | Edge | P4 | **UI** | Items in cart; Place Order modal open | 1\. Name \= TD-10 2\. **Purchase** | Accepted and displayed correctly |
| TC-CART-037 | Double-click **Purchase** | Edge | P2 | **UI** (single confirmation / single `/deletecart`) | Items in cart; Place Order modal open | 1\. Fill valid data 2\. Double-click **Purchase** | Single order created; single confirmation |
| TC-CART-038 | Browser Back after purchase | Edge | P3 | **UI** | Purchase completed | 1\. Press **Back** | Cart remains empty; no resubmission |
| TC-CART-039 | Clear cookies with guest cart | Edge | P3 | **UI** | Logged out; items in guest cart | 1\. Clear cookies 2\. Open Cart | Cart empty (new guest session); no errors |
| TC-CART-040 | Cart table loading on slow network | Edge | P3 | **UI** (throttling via CDP) | Products in cart | 1\. Throttle to Slow 3G 2\. Open Cart | Items and Total eventually load; Total not shown incorrectly before items load |
| TC-CART-041 | Responsive cart & Place Order modal | Edge · Usability | P3 | **UI** (mobile viewport / visual snapshot) | Viewport 375px; products in cart | 1\. Open Cart 2\. Click **Place Order** | Table and modal usable; no horizontal overflow hiding Delete/Purchase |

---

## 4\. Traceability Matrix

| Requirement | Test Cases |
| :---- | :---- |
| R1 – User can log in with valid credentials | TC-LOGIN-001, 002, 012, 013 |
| R2 – Login validation & error messaging | TC-LOGIN-014 – 021, 026 – 028 |
| R3 – Session management / Logout | TC-LOGIN-008 – 011, 025, 033 |
| R4 – Login security | TC-LOGIN-004, 022, 023, 025 |
| R5 – Add products to cart | TC-CART-001 – 004, 029 – 031 |
| R6 – View/maintain cart contents & total | TC-CART-005 – 009, 013, 032 – 034, 040 |
| R7 – Cart ownership/persistence per user | TC-CART-010 – 012, 039 |
| R8 – Place order & purchase | TC-CART-014 – 028, 035 – 038 |
| R9 – UI / Accessibility / Responsive | TC-LOGIN-003, 007, 034, 035; TC-CART-041 |

---

## 5\. Summary

### 5.1 By Type

| Feature | Positive | Negative | Edge | Total |
| :---- | :---- | :---- | :---- | :---- |
| Login | 14 | 12 | 9 | 35 |
| Cart & Place Order | 19 | 11 | 11 | 41 |
| **Total** | **33** | **23** | **20** | **76** |

### 5.2 By Automation Layer

| Feature | API | API & UI (2 tests) | UI (API setup) | UI | Manual | Total cases | Automated scripts |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Login | 10 | 4 | 2 | 17 | 2 | 35 | 37 |
| Cart & Place Order | 6 | 1 | 12 | 22 | 0 | 41 | 42 |
| **Total** | **16** | **5** | **14** | **39** | **2** | **76** | **79** |

> Automated scripts \= (all cases − Manual) \+ 1 extra script for each "API & UI (2 tests)" case.

### 5.3 Execution Schedule

DemoBlaze is a third-party application: we can't build or deploy it, so every API and UI test runs against the live site. "On commit" therefore means commits to **our test code**, not to the application.

| Trigger | What runs | Purpose |
| :---- | :---- | :---- |
| Pull request to the test repo | All API tests \+ UI `@smoke` tests (TC-LOGIN-001, TC-CART-001, TC-CART-015) | Checks that new or changed tests work |
| Scheduled (nightly) | Full suite: API, API & UI, UI (API setup), UI | Catches changes made by the site owners |
| On demand | Full suite | Before a demo or report |
| Release checklist | Manual cases (TC-LOGIN-031, 032\) | Covers what isn't automated |

**Rules for running against a shared live site**

- Use a dedicated test account and empty the cart (via API) before and after each test so tests don't depend on each other.  
- Generate unique usernames for sign-up tests (e.g., `qa_<timestamp>`).  
- Before the suite starts, check the site is reachable; if it isn't, mark the run as **Blocked** (environment), not **Failed**.  
- Allow one retry for network-related failures only. Never retry failures where the checked result was wrong.

>   
> If you test an application you own and can deploy, start the service in the CI job (e.g., Docker Compose) or use a temporary environment per pull request, so the API tests can run on every application commit.

---

## 6\. Observations / Potential Defects to Verify

1. **Place Order available with an empty cart** (TC-CART-023): the button is visible on an empty cart and the modal opens with a blank Total.  
2. **Weak Place Order validation** (TC-CART-024 – 027): only Name and Credit card appear to be required; card format, month and year may not be validated.  
3. **Whitespace-only input** (TC-LOGIN-021, TC-CART-027): may be sent to the server instead of being caught on the client.  
4. **Native JS alerts** are used for all feedback (login errors, "Product added", validation), which is weak for accessibility and automation.  
5. **No quantity control in cart**: duplicates show as separate rows (TC-CART-004).

