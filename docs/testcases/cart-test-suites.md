# Cart - Test Suites
**Date:** 16-Oct-2026 14:30 UTC

Refer to [Overview.md](Overview.md) for test environments and legend.

| ID | Title | Type | Priority | Automation Type | Preconditions | Steps | Expected Result |
| ----- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| TC-CART-001 | Add single product to cart (logged in) | Positive | P1 | API & UI (2 tests) | Logged in; empty cart | 1\. Open Samsung galaxy s6 2\. Click Add to cart 3\. Accept alert 4\. Open Cart | Alert "Product added"; cart lists Samsung galaxy s6, \$360; Total \= 360 |
| TC-CART-002 | Add product to cart as guest | Positive | P1 | API | Logged out; empty cart | Same as TC-CART-001 | Product added and shown in cart for guest session |
| TC-CART-003 | Add multiple different products | Positive | P1 | UI | Empty cart | 1\. Add Samsung galaxy s6 (\$360) 2\. Add Nokia lumia 1520 (\$820) 3\. Add Sony vaio i5 (\$790) 4\. Open Cart | 3 rows shown; Total \= 1970 |
| TC-CART-004 | Add same product multiple times | Positive | P2 | UI | Empty cart | 1\. Click Add to cart for Samsung galaxy s6 3 times (accept alert each time) 2\. Open Cart | 3 separate rows (no quantity field); Total \= 1080 |
| TC-CART-005 | Product details correct in cart | Positive | P1 | UI | At least 1 product in cart | 1\. Open Cart | Pic, Title and Price match the product page |
| TC-CART-006 | Delete a product | Positive | P1 | UI | ≥2 products in cart | 1\. Click Delete on one row | Row removed; Sum of rows is minus 1\. Total recalculated |
| TC-CART-007 | Delete all products | Positive | P2 | UI | ≥1 product in cart | 1\. Delete every row | Table empty; Total blank/0 |
| TC-CART-008 | Delete one of duplicate items | Positive | P2 | API | Same product x3 in cart | 1\. Delete one row | Only one row removed; 2 remain; Total updated |
| TC-CART-009 | Cart persists after refresh | Positive | P1 | UI | Products in cart | 1\. Refresh cart page | Same items and Total |
| TC-CART-010 | Cart persists across logout/login | Positive | P1 | API | Logged in with items in cart | 1\. Log out 2\. Log in again 3\. Open Cart | User's items still present |
| TC-CART-011 | Cart isolation between users | Positive · Security | P1 | API | User A has items; User B exists | 1\. Log out 2\. Log in as User B 3\. Open Cart | User A's items NOT visible to User B |
| TC-CART-012 | Cart status when adding as guest then login | Positive | P2 | UI | Logged out; empty cart | 1\. As guest add item 2\. Log in 3\. Open Cart | Depends on business logic (merge or separate); no data loss or errors. |
| TC-CART-013 | Navigate to cart from navbar | Positive | P2 | UI | Any page open | 1\. Click Cart | cart.html loads with Products table and Total |
| TC-CART-014 | Open Place Order modal | Positive | P1 | UI | Items in cart | 1\. Click Place Order | Modal shows Total (matches cart), Name, Country, City, Credit card, Month, Year, Close, Purchase |
| TC-CART-015 | Successful purchase with all fields | Positive | P1 | UI | Items in cart | 1\. Place Order 2\. Fill all fields with valid test data (use a test card number such as 4111111111111111\) 3\. Click Purchase | "Thank you for your purchase\!" dialog with Id, Amount (= total), Card number, Name, Date; click OK → redirect to Home |
| TC-CART-016 | Successful purchase with only required fields | Positive | P2 | UI | Items in cart | 1\. Place Order 2\. Fill only Name and Credit card 3\. Purchase | Purchase succeeds |
| TC-CART-017 | Cart emptied after purchase | Positive | P1 | UI | Purchase completed (TC-CART-016) | 1\. Open Cart | Cart is empty |
| TC-CART-018 | Confirmation details accuracy | Positive | P1 | UI | Purchase completed | 1\. Review confirmation | Amount \= cart total; Name & Card match input; Date \= current date |
| TC-CART-019 | Close Place Order modal | Positive | P3 | UI | Place Order modal open | 1\. Click Close / × | Modal closes; cart unchanged |
| TC-CART-020 | Purchase with all fields empty | Negative | P1 | UI | Items in cart; Place Order modal open | 1\. Click Purchase with no input | client-side alert "Please fill out Name and Creditcard."; no order |
| TC-CART-021 | Purchase without Name | Negative | P1 | UI | Items in cart; Place Order modal open | 1\. Fill only Credit card 2\. Purchase | Same validation alert |
| TC-CART-022 | Purchase without Credit card | Negative | P1 | UI | Items in cart; Place Order modal open | 1\. Fill only Name 2\. Purchase | Same validation alert |
| TC-CART-023 | Place Order with empty cart | Negative | P1 | UI | Empty cart | 1\. Click Place Order 2\. Fill Name \+ Card 3\. Purchase | Should be blocked. Observed: Place Order button visible and modal opens with empty Total; \$0 purchase succeeds (possible defect) |
| TC-CART-024 | Non-numeric credit card | Negative | P2 | UI | Items in cart; Place Order modal open | 1\. Name \= valid, Credit card \= abcd-efgh 2\. Purchase | client-side should reject and show alert (possible defect) |
| TC-CART-025 | Invalid month / year | Negative | P2 | UI | Items in cart; Place Order modal open | 1\. Month \= 13 or abc; Year \= 1999 / \-1 2\. Purchase | Should be rejected / validated (possible defect) |
| TC-CART-026 | Expired card date | Negative | P3 | UI | Items in cart; Place Order modal open | 1\. Month/Year in the past 2\. Purchase | Should be rejected (possible defect) |
| TC-CART-027 | Whitespace-only Name/Card | Negative | P2 | UI | Items in cart; Place Order modal open | 1\. Name \= " ", Card \= " " 2\. Purchase | Treated as empty → validation alert (possible defect) |
| TC-CART-028 | XSS in Place Order fields | Negative · Security | P1 | UI | Items in cart; Place Order modal open | 1\. Name \= TD-08 2\. Purchase | No script execution; name rendered as plain text in confirmation |
| TC-CART-029 | Add to cart while offline | Negative | P4 | UI | Product page open | 1\. Go offline 2\. Click Add to cart | Error shown; product not falsely reported as added |
| TC-CART-030 | Server rejects invalid ID | Negative | P2 | API | None | 1\. /addtocart with prod\_id \= 99999, abc, empty; then /viewcart | Rejected, or nothing added; /viewcart has no invalid entry |
| TC-CART-031 | Rapid repeated Add to cart clicks | Edge | P2 | API | Empty cart; product page open | 1\. Click Add to cart 5x quickly via api (parallel /addtocart) 2\. Count via /viewcart) | Cart item count equals number of successful "Product added" alerts; no lost/duplicate rows |
| TC-CART-032 | Large cart (e.g., 20+ items) | Edge | P3 | UI | Empty cart | 1\. Add 20+ items 2\. Open Cart | All items listed; Total correct; page performance acceptable |
| TC-CART-033 | Cart in two tabs | Edge | P3 | UI | Products in cart; cart open in Tab A and Tab B | 1\. Delete item in tab A 2\. Refresh tab B | B reflects deletion |
| TC-CART-034 | Long values in Place Order fields | Edge | P3 | UI | Items in cart; Place Order modal open | 1\. Enter 256+ chars in Name/Country/City 2\. Purchase | Handled without UI break; confirmation readable |
| TC-CART-035 | Unicode in Name/City | Edge | P4 | UI | Items in cart; Place Order modal open | 1\. Name \= TD-10 2\. Purchase | Accepted and displayed correctly |
| TC-CART-036 | Double-click Purchase | Edge | P2 | UI | Items in cart; Place Order modal open | 1\. Fill valid data 2\. Double-click Purchase | Single order created; single confirmation |
| TC-CART-037 | Browser Back after purchase | Edge | P3 | UI | Purchase completed | 1\. Press Back | Cart remains empty; no resubmission |
| TC-CART-038 | Clear cookies with guest cart | Edge | P3 | UI | Logged out; items in guest cart | 1\. Clear cookies 2\. Open Cart | Cart empty (new guest session); no errors |
| TC-CART-039 | Cart table loading on slow network | Edge | P3 | UI | Products in cart | 1\. Throttle to Slow 3G via CDP 2\. Open Cart | Items and Total eventually load; Total not shown incorrectly before items load |
| TC-CART-040 | Responsive cart & Place Order modal | Edge · Usability | P2 | UI | Mobile viewport 375px; products in cart | 1\. Open Cart 2\. Click Place Order | Table and modal usable; no horizontal overflow hiding Delete/Purchase User can purchase properly |
|  |  |  |  |  |  |  |  |

