# URL Shortener & Logging Middleware

This repository contains two main components:

- **BACKEND**: A simple URL shortener service built with Express.js and TypeScript.
- **Logging Middleware**: A reusable logging utility for sending logs to a remote evaluation service.

---

## Project Structure

```

  BACKEND/
    src/
      index.ts
    package.json
    tsconfig.json
  Logging Middleware/
    src/
      index.ts
    package.json
    tsconfig.json
```

---

## 1. BACKEND

### Description

A URL shortener service that allows users to create short links, redirect to original URLs, and view statistics for each short link. The service also logs important events to a remote logging service.

### Features

- Create short URLs with optional custom codes and expiry.
- Redirect to the original URL using the short code.
- View statistics (clicks, expiry, etc.) for each short URL.
- Logs all major events (creation, errors, access) to a remote logging service.

### Tech Stack

- Node.js
- Express.js
- TypeScript

### Setup & Run

1. Install dependencies:
   ```sh
   cd BACKEND
   npm install
   ```

2. Start the server:
   ```sh
   npm run dev
   ```

3. The server will run at `http://localhost:3000`.

### API Endpoints

- `POST /shorturls`
  - Body: `{ "url": "https://example.com", "validity": 30, "shortcode": "custom" }`
  - Response: `{ "shortLink": "...", "expiry": "..." }`

- `GET /:code`
  - Redirects to the original URL if valid and not expired.

- `GET /shorturls/:code`
  - Returns statistics for the given short code.

---

## 2. Logging Middleware

### Description

A TypeScript utility to send structured logs to a remote evaluation/logging service. Can be used in both backend and frontend stacks.

### Usage

Import and use the `Log` function in your project:

```typescript
import { Log } from "logging-middleware/src/index";

// Example usage
await Log(
  "backend",           // stack
  "info",              // level
  "service",           // package
  "Shortened URL created", // message
  "YOUR_AUTH_TOKEN"    // token
);
```

### Parameters

- `stack`: `"backend"` or `"frontend"`
- `level`: `"debug" | "info" | "warn" | "error" | "fatal"`
- `package`: One of several logical areas (e.g., `"service"`, `"handler"`, `"route"`, etc.)
- `message`: Log message string
- `token`: Authorization token for the logging service

### Setup

1. Install dependencies:
   ```sh
   cd "Logging Middleware"
   npm install
   ```

2. Build or use directly in your TypeScript project.

---

## Development

- Both projects use TypeScript and can be run using `ts-node` or built to JavaScript.
- Make sure to install dependencies in each subdirectory before running.

---
