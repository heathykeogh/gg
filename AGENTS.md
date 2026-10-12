# Base44 Setup Notes

## Project Overview
"Tension" — a premium two-player intimate card game built as an Expo (React Native) app with web support via `react-native-web`. All data is local/offline (AsyncStorage); no backend is used despite a leftover `backend/` directory (FastAPI + MongoDB template).

## Architecture
- **Frontend** (`frontend/`): Expo SDK 54, Expo Router (file-based), React 19, React Native 0.81. Web output via Metro bundler (`expo start --web`). State in `src/store/GameContext.tsx`, persisted via `src/utils/storage/` (AsyncStorage → IndexedDB on web).
- **Backend** (`backend/`): Unused template (FastAPI + MongoDB). Not started in the Base44 compose.

## Running in Base44
- `docker compose -f docker-compose.base44.yml up -d` starts the Expo web dev server on port 3000.
- Base image: `node:22` (full, for native build tools). Source is bind-mounted at `/app/frontend`.
- Yarn 1.22.22 is the package manager. No lockfile exists; `yarn install` generates one on first boot.
- The `preinstall` script (`scripts/cmd-guard.js --preinstall`) checks package.json against a deprecated-package blocklist — passes with the current deps.

## CORS / Preview Origin
- Expo's dev-server CORS middleware (`@expo/cli` `CorsMiddleware`) rejects requests whose `Origin` header doesn't match the server host or an allowlist.
- `frontend/app.config.js` dynamically sets `extra.router.origin` to `https://3000-$BASE44_PUBLIC_HOST_SUFFIX` when `BASE44_PREVIEW_MODE === "1"`, adding the preview proxy origin to the allowlist. Outside the sandbox, the original config is returned unchanged.

## No External Credentials Needed
The app is fully offline/local. No secrets or external service credentials are required.

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` returns 200 when the app is ready.
- The preview shows the onboarding screen (dark cinematic theme, maroon/gold palette) on first load.
