# Test Case Suite – DemoBlaze Product Store

## 1. Test Environment

| Item     | Value                                                             |
| :------- | :---------------------------------------------------------------- |
| URL      | [https\://www\.demoblaze.com/](https://www.demoblaze.com/)        |
| API base | [https\://api.demoblaze.com/](https://api.demoblaze.com/)         |
| Browsers | Chrome (latest), Firefox (latest), Safari (latest), Edge (latest) |
| Devices  | Desktop 1920x1080, Tablet 768x1024, Mobile 375x812                |
| Network  | Normal, throttled "Slow 3G", Offline                              |

## 2. Legend

**Priority:** P1 \= Critical, P2 \= High, P3 \= Medium, P4 \= Low

** Type**

| Type                                                      | Meaning                                                                           | Example                                            |
| :-------------------------------------------------------- | :-------------------------------------------------------------------------------- | :------------------------------------------------- |
| **Positive**                                              | Valid input and expected user behavior; the feature works as designed             | Valid login shows "Welcome …"                      |
| **Negative**                                              | Invalid, missing or unauthorized input; the system must refuse it cleanly         | Wrong password shows "Wrong password."             |
| **Edge**                                                  | Valid but extreme or unusual conditions: limits, timing, concurrency, environment | 256-char username, double-click Purchase, two tabs |
| Secondary label: **Security / Usability / Accessibility** | Extra focus area of the test                                                      | "Negative · Security" \= SQL injection             |

**Automation Type**

|    Automation Type     | When to use                                                                                                                                                                                                                                                         | Tooling suggestion           |
| :--------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
|        **API**         | Business logic lives on the server (auth, cart storage, data isolation, input handling)                                                                                                                                                                             | Playwright request           |
|         **UI**         | Logic or behavior exists only in the browser: client-side validation, JS alerts, modals, navigation, browser cookies, layout If need setup/ cleanup data, doing through the API (login, seed cart, remove cart...), then check only what the UI calculates or shows | Playwright UI \+ API context |
| **API & UI (2 tests)** | For critical flows: thorough API coverage plus one end-to-end UI smoke test                                                                                                                                                                                         | Plawright request \+ UI      |
|       **Manual**       | Low return on investment, or depends on the browser profile or OS                                                                                                                                                                                                   | Exploratory checklist        |
