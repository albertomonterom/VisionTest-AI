# VisionTest AI

A web-based early myopia detection tool built with **React + TypeScript**, using:
- Snellen-based vision test
- Lifestyle & risk-factor questionnaire
- MediaPipe Face Detection for calibration
- TailwindCSS v3 + shadcn/ui for UI components
- React Query for async state
- React Router for navigation

This application guides users through:
1. A calibration step using face detection
2. A Snellen-like visual acuity test
3. A lifestyle questionnaire
4. AI-based prediction (optional)
5. Final combined results

---

## Tech Stack

- **Vite + React + TypeScript**
- **TailwindCSS v3**
- **shadcn/ui components**
- **React Router v6**
- **React Query (TanStack Query)**
- **MediaPipe Tasks Vision (FaceDetector)**
- **Lucide Icons**

---

## Installation

Clone the repo and install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

---

## Environment Requirements

- Node.js v18+
- The app uses MediaPipe's Face Detection model which requires WebAssembly support in the browser.

## Features

- **Snellen-based visual acuity test**
- **Lifestyle questionnaire**
- **Face detection calibration**
- **AI-based prediction**
- **Responsive design**