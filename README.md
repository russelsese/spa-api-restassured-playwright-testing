# Registration App — RACP Playwright + RestAssured

A full-stack registration system with automated testing at both the UI and API layers.

| Layer | Technology |
|-------|-----------|
| API | Node.js + Express |
| Web UI | Next.js 14 (React 18) |
| UI Tests | Playwright (TypeScript) |
| API Tests | RestAssured + JUnit 5 (Java/Maven) |

---

## Project Structure

```
racp-playwright-restassured/
├── api/                        # Express REST API (port 3001)
│   ├── src/server.js
│   ├── data/registrations.json # JSON flat-file storage
│   └── package.json
│
├── web-ui-spa/                 # Next.js registration UI (port 3000)
│   ├── pages/
│   │   ├── _app.jsx
│   │   └── index.jsx
│   ├── components/
│   │   └── RegistrationForm.jsx
│   ├── styles/
│   │   └── form.css
│   ├── next.config.js          # proxies /api → localhost:3001
│   └── package.json
│
├── playwright/                 # UI test suite
│   ├── tests/
│   │   └── registration.spec.ts
│   ├── playwright.config.ts
│   └── package.json
│
└── restassured/                # API test suite
    ├── src/test/java/com/racp/api/
    │   └── RegistrationApiTest.java
    └── pom.xml
```

---

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Node.js | 18 | `node -v` |
| npm | 9 | `npm -v` |
| Java JDK | 17 | `java -version` |
| Maven | 3.8 | `mvn -version` |

> **Playwright browsers** are downloaded separately after `npm install` — see step 3 below.

---

## Installing Prerequisites

### Node.js

Download and run the installer from [https://nodejs.org](https://nodejs.org) (LTS recommended), or use a package manager:

```powershell
# Chocolatey (Windows)
choco install nodejs-lts -y

# winget (Windows)
winget install OpenJS.NodeJS.LTS
```

### Java JDK 17 + Maven

Both are required for RestAssured. Install them together with one command — open **PowerShell as Administrator**:

```powershell
# Chocolatey (recommended if already installed)
choco install microsoft-openjdk17 maven -y

# winget
winget install Microsoft.OpenJDK.17
winget install Apache.Maven
```

After installation, **close and reopen your terminal** so the PATH updates, then verify:

```powershell
java -version   # expected: openjdk 17.x.x
mvn -version    # expected: Apache Maven 3.x.x
```

---

## Installation

### 1. API

```bash
cd api
npm install
```

### 2. Web UI

```bash
cd web-ui-spa
npm install
```

### 3. Playwright

```bash
cd playwright
npm install
npx playwright install chromium
```

### 4. RestAssured

Maven downloads all dependencies automatically on first run. No separate install step needed beyond having `mvn` available.

```bash
cd restassured
mvn dependency:resolve   # optional — pre-fetch deps
```

---

## Running the App

Both the API and the UI must be running for full end-to-end operation.

### Start the API (port 3001)

```bash
cd api
npm start
```

### Start the Web UI (port 3000)

```bash
cd web-ui-spa
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Reference

Base URL: `http://localhost:3001`

### POST `/api/registrations`

Register a new user. Stores the record in `api/data/registrations.json`.

**Request body (JSON)**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| firstName | string | yes | |
| lastName | string | yes | |
| email | string | yes | Must be a valid email, unique |
| password | string | yes | Minimum 6 characters |
| phone | string | no | |
| dateOfBirth | string | no | ISO date `YYYY-MM-DD` |

**Responses**

| Status | Meaning |
|--------|---------|
| 201 | Created — returns the stored record with `id` and `createdAt` |
| 400 | Validation error or duplicate email — returns `{ "error": "..." }` |

### GET `/api/registrations`

Returns all registrations as a JSON array.

**Response:** `200 OK` — array of registration objects.

---

## Running the Tests

> The API must be running on port 3001 before executing either test suite.
> The UI must also be running on port 3000 before running Playwright tests.

### Playwright (UI tests)

```bash
cd playwright
npx playwright test
```

**Options**

```bash
npx playwright test --headed          # run with browser visible
npx playwright test --ui              # open Playwright UI mode
npx playwright show-report            # open last HTML report
```

**Test scenarios covered**

- Happy path — successful registration with all fields
- Form reset after successful submit
- Required field validation (empty submit)
- Invalid email format
- Password too short (< 6 chars)
- Password mismatch
- Duplicate email — API error shown in UI

### RestAssured (API tests)

```bash
cd restassured
mvn test
```

**Test scenarios covered**

| Test | Endpoint | Expected |
|------|----------|---------|
| `postValidRegistration_returns201WithRecord` | POST | 201, record has `id` and `email` |
| `postDuplicateEmail_returns400` | POST | 400, error mentions "already exists" |
| `postMissingEmail_returns400` | POST | 400 |
| `postMissingRequiredFields_returns400` | POST | 400 |
| `postInvalidEmailFormat_returns400` | POST | 400, error mentions "email" |
| `postShortPassword_returns400` | POST | 400, error mentions "6 characters" |
| `getAllRegistrations_returns200AndArray` | GET | 200, JSON array |
| `getAllRegistrations_containsPostedRecord` | GET | array contains previously POSTed email |

---

## Development Notes

- The Next.js dev server proxies all `/api/*` requests to `http://localhost:3001` via `next.config.js` rewrites, so the UI and API run on separate ports without CORS issues.
- `api/data/registrations.json` is the sole data store. Delete its contents (`[]`) to reset all registrations.
- Playwright tests use unique timestamped emails to avoid conflicts between runs.
- RestAssured tests are ordered: the POST test runs before GET tests that assert on its data.
