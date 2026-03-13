# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node for integrating Mercado Pago APIs. The node enables n8n workflows to interact with Mercado Pago payment operations and reporting features. It's maintained by the Tech Stuff IXF team at MercadoPago.

**Key Resources:**
- **Payments**: Create payment links (Checkout Preferences)
- **Reporting**: Manage Release and Settlement reports (list, configure, download)

## Essential Commands

### Development Workflow
```bash
npm run build          # Full build: clean dist/, compile TS, copy icons/SVGs
npm run dev            # Watch mode for development (tsc --watch)
npm run format         # Format code with Prettier
npm run lint           # Lint with ESLint
npm run lintfix        # Auto-fix linting issues
```

### Testing
```bash
npm test               # Run tests in watch mode with vitest
npm run test:unit      # Run tests once
npm run test:coverage  # Generate coverage report in /coverage
```

**Running a single test:**
```bash
npx vitest run tests/operations/createPaymentLink.test.ts
```

### Pre-publish
```bash
npm run prepublishOnly # Runs build + lint:all (required before publishing)
```

## Architecture

### Node Entry Point
The main node is defined in `src/nodes/MercadoPago/MercadoPago.node.ts`. This file:
- Declares the node's UI properties (Resource and Operation selectors)
- Manages credential loading (`mercadoPagoApi`)
- Provides a centralized request wrapper with automatic Bearer auth, retry logic for 429 errors, and custom headers
- Dispatches operations to handlers via the `operations` registry

### Operation Handler Pattern
Each operation lives in its own file under `src/nodes/MercadoPago/operations/`. The pattern is:
1. Import `OperationHandler` type from `./index.ts`
2. Define local types for the operation's parameters
3. Implement the handler function that receives `HandlerCtx` and returns the API response
4. Export as default

**HandlerCtx** provides:
- `ctx.get<T>(name, default?)`: Read a node parameter by name
- `ctx.request(init)`: Make an HTTP request (auth headers added automatically)
- `ctx.credentials`: Access to the MercadoPago credentials
- `ctx.nodeError(msg)`: Throw a user-friendly error with item context
- `ctx.helpers`: n8n helper functions
- `ctx.i`: Current item index

Operations are registered in `src/nodes/MercadoPago/operations/index.ts` which exports an `operations` object mapping operation names to handlers.

### Credentials
Defined in `src/credentials/MercadoPagoApi.credentials.ts`. Stores a single `accessToken` field used for Bearer authentication.

### Constants
API endpoints and headers are centralized in `src/constants.ts`:
- `API_BASE_URL`: Base URL for all Mercado Pago API calls
- `API_ENDPOINTS`: Object with all endpoint URLs (some are functions for dynamic paths)
- `HTTP_HEADERS.X_PLATFORM_ID`: Platform identifier sent with every request

### Build Process
The build script does three things:
1. Cleans `dist/` using rimraf
2. Compiles TypeScript (CommonJS modules for n8n compatibility)
3. Runs gulp task `build:icons` to copy `.svg` and icon resources from `src/` to `dist/`

**Why gulp?** Icons and SVG files aren't copied by tsc, so gulp handles these static assets.

## Testing Guidelines

Tests use **Vitest** and live in `tests/operations/`. Each operation has a corresponding test file (e.g., `createPaymentLink.test.ts`).

**Test pattern:**
- Import the operation handler
- Use `makeMockCtx()` helper (from `tests/helpers/mockCtx.ts`) to create a mock `HandlerCtx`
- Define test parameters via `params` object
- Assert on return values or thrown errors

**Example structure:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/createPaymentLink';
import { makeMockCtx } from '../helpers/mockCtx';

describe('operationName', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = makeMockCtx({ params: { /* ... */ } }) as TestContext;
  });

  it('should validate required fields', async () => {
    await expect(handler(ctx)).rejects.toThrow('...');
  });
});
```

Tests are run with `vitest` (no globals mode) and use `tests/setup.ts` for initialization.

## Git Workflow

Follow the GitFlow-like branching model documented in CONTRIBUTING.md:

1. **feature/** branches → **develop**: For new features, bug fixes
2. **develop** → **master**: For releases (requires code owner approval)

**Current branch:** `feature/licenses`
**Main branch for PRs:** `master`

**Code Owners:** @samhermeli, @Harievilozanini (all PRs require approval)

## Adding a New Operation

1. Create a new file in `src/nodes/MercadoPago/operations/` (e.g., `myOperation.ts`)
2. Import `OperationHandler` and define types for the operation's parameters
3. Implement the handler following the established pattern (validate inputs, construct request, return response)
4. Register the operation in `src/nodes/MercadoPago/operations/index.ts`
5. Add UI properties to `MercadoPago.node.ts` (under the appropriate Resource)
6. Create a test file in `tests/operations/myOperation.test.ts`
7. Add endpoint constant to `src/constants.ts` if needed

## Validation Patterns

Operations should validate user input early and throw descriptive errors using `ctx.nodeError(msg)`:
- Required fields: Check for presence and correct format
- String lengths: Enforce API limits (e.g., `external_reference` ≤ 64 chars)
- URL schemes: Ensure HTTPS for notification URLs, HTTPS or deeplinks for redirect URLs
- Date formats: Validate ISO 8601 with timezone
- Boolean fields: Send explicitly with default `false` when required by the API

## Important Notes

- **Node.js version**: >= 20.15 required
- **Module system**: CommonJS (for n8n compatibility)
- **No runtime dependencies**: Only `n8n-workflow` as peer dependency
- **TypeScript**: Strict mode enabled
- **Package publishing**: Only `dist/` folder is published (see `files` in package.json)
- **n8n API version**: Uses n8n nodes API version 1

## Request Handling

The node's `makeRequest` function automatically:
- Adds `Authorization: Bearer <token>` header
- Adds `X-Platform-Id` header
- Sets `Content-Type: application/json` for JSON requests
- Retries up to 2 times on 429 (rate limit) responses with exponential backoff
- Respects `Retry-After` header if present
- Supports non-JSON responses (e.g., CSV downloads) via `json: false` in RequestInit
