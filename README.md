# fury_n8n-node-mercadopago
An n8n community node to integrate Mercado Pago APIs. It focuses on two main resource groups: Payment Operations and Reporting (Release/Settlement reports). The node provides a clean UI and typed handlers for each operation, following n8n best practices.

## Contributing

The main purpose of this repository is to provide a robust integration between n8n and Mercado Pago APIs. Development happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read our [contributing guide](CONTRIBUTING.md) to learn how you can take part in improving this node.

## Author
Name: Samuel Heredia
Team: Tech Stuff IXF - MercadoPago
Gravatar: <https://gravatar.com/ghostlytraveler48caa8d6d6>

## Table of Contents
- Overview
- Features
- Supported Operations
- Installation
- Credentials
- Usage
- Architecture
- Development
- Contributing
- License
- Author

## Overview
This node lets you execute common Mercado Pago flows directly from n8n:

- Create payment links (preferences)
- Manage Release Reports configuration and retrieval
- Manage Settlement Reports listing and downloading

The node is split by Resource to make the UI clear and scalable:

- Resource: `Payments`
- Resource: `Reporting`

## Features
- Clear separation by Resource (Payments vs Reporting) using a `Resource` selector.
- Consistent `Operation` selector per Resource.
- Validations and helpful error messages for required parameters.
- Boolean fields sent explicitly with default `false` where required by the API.
- CSV download support returning raw text, ready to save or transform.

## Supported Operations

### Payments
- Create Payment Link (`createPaymentLink`)
  - Builds a Preference with items and optional additional fields (back URLs, auto return, etc.).

### Reporting — Release Report
- List Release Reports (`listReleaseReports`)
  - GET `v1/account/release_report/list` with pagination support (returnAll/limit/offset/apiLimit).
- Configure Release Report (`configureReleaseReport`)
  - POST `v1/account/release_report/config` with frequency, columns, SFTP, and flags.
- Edit Release Report Config (`editReleaseReportConfig`)
  - PUT `v1/account/release_report/config` with same schema as creation.
- Get Release Report Config (`getReleaseReportConfig`)
  - GET `v1/account/release_report/config` returning current JSON configuration.
- Download Release Report (`downloadReleaseReport`)
  - GET `v1/account/release_report/{file_name}`; returns `text/csv` content.

### Reporting — Settlement Report
- List Settlement Reports (`listSettlementReports`)
  - GET `v1/account/settlement_report/list` with the same pagination pattern as Release.
- Configure Settlement Report (`configureSettlementReport`)
  - POST `v1/account/settlement_report/config` with frequency, columns, SFTP, and flags.
- Edit Settlement Report Config (`editSettlementReport`)
  - PUT `v1/account/settlement_report/config` with same schema as creation.
- Get Settlement Report Config (`getSettlementReportConfig`)
  - GET `v1/account/settlement_report/config` returning current JSON configuration.
- Download Settlement Report (`downloadSettlementReport`)
  - GET `v1/account/settlement_report/{file_name}`; returns `text/csv` content.

## Installation
1. Build the project:
   - `npm install`
   - `npm run build`
2. Install the compiled node into your n8n setup (community node install flow) or symlink the `dist/` output as needed.

## Credentials
This node uses a single credential: `mercadoPagoApi` with a Personal Access Token (Access Token / Bearer). Configure it in n8n Credentials and select it in the node.

## Usage
1. Drag the `MercadoPago` node into your n8n workflow.
2. Select `Resource`:
   - `Payments` for payment links.
   - `Reporting` for release/settlement tasks.
3. Choose an `Operation` under the selected `Resource`.
4. Fill the required/optional fields shown by the node UI.
5. Execute the node.

Notes:
- For listing operations, you can toggle `Return All` or set `Limit`, `Offset`, and `API Limit` (page size).
- For configuration (create/edit), columns support a predefined list of keys or a custom key (via “Custom…” + free text).
- CSV download operations return a JSON object with a `content` string (raw CSV). You can pipe this into another node to write to file or transform it.

## Architecture
The node is designed for clarity, testability, and extensibility.

Project layout:
- `src/`
  - `credentials/`
    - `MercadoPagoApi.credentials.ts` — defines the `mercadoPagoApi` credential.
  - `nodes/MercadoPago/`
    - `MercadoPago.node.ts` — main n8n node definition.
    - `operations/` — one file per operation handler.
      - `createPaymentLink.ts`
      - `listReleaseReports.ts`
      - `configureReleaseReport.ts`
      - `editReleaseReportConfig.ts`
      - `getReleaseReportConfig.ts`
      - `downloadReleaseReport.ts`
      - `listSettlementReports.ts`
      - `configureSettlementReport.ts`
      - `editSettlementReport.ts`
      - `getSettlementReportConfig.ts`
      - `downloadSettlementReport.ts`
      - `index.ts` — operation registry and shared handler types.

Key design points:
- `MercadoPago.node.ts` declares `Resource` and `Operation` properties so the UI shows only relevant fields.
- The node `execute()` builds a `HandlerCtx` passed to the selected operation.
- `operations/index.ts` exposes a map `{ [operationName]: handler }` for easy dispatch.
- Each handler encapsulates:
  - Input extraction and validation.
  - Request construction (method, URL, qs, body, headers).
  - Return shape (JSON array/item for n8n).
- The request wrapper in `execute()` sets the Authorization header automatically and respects `init.json` for non-JSON responses (e.g., CSV download).

## Development
- Scripts:
  - `npm run build` — compile TypeScript to `dist/`.
  - `npm run lint` — run ESLint.
  - `npm run format` — run Prettier (if configured).
  - `npm run test` — run all tests.
  - `npm run test:unit` — run unit tests once.
  - `npm run test:watch` — run tests in watch mode.
  - `npm run test:coverage` — generate test coverage report.
- Coding guidelines:
  - Keep imports at the top of files.
  - One operation per file under `operations/`.
  - Validate required parameters early and return helpful errors (use `nodeError`).
  - When required by the API, always send boolean fields explicitly with default `false`.
  - Write unit tests for all operations in `tests/operations/`.

## Contributing

Please read our [contributing guide](CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to this node.

## License

This project is [MIT licensed](LICENSE).
