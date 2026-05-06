<div align="center">

<img src="nodes/MercadoPago/icon-mercadopago.svg" width="80" alt="MercadoPago" />

# n8n-nodes-mercadopago

**The official Mercado Pago community node for n8n**

Connect your workflows to Mercado Pago — create payment links, configure automated reports, and download your financial data, all without leaving n8n.

[![npm version](https://img.shields.io/npm/v/@mercadopago/n8n-nodes-mercadopago?color=blue&label=npm)](https://www.npmjs.com/package/@mercadopago/n8n-nodes-mercadopago)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.15-brightgreen)](https://nodejs.org)
[![n8n community node](https://img.shields.io/badge/n8n-community%20node-orange)](https://docs.n8n.io/integrations/community-nodes/)

</div>

---

## ✨ What can you do with this node?

| Resource | What you get |
|----------|-------------|
| 💳 **Payments** | Create Checkout Preference links with items, back URLs, expiration dates and more |
| 📊 **Reporting** | Configure, list and download Release & Settlement reports |

---

## 🗺️ Operations at a glance

### 💳 Payments

| Operation | Method | Description |
|-----------|--------|-------------|
| **Create Payment Link** | `POST` | Generate a Checkout Preference link to accept payments |

### 📊 Reporting — Release Reports

| Operation | Method | Description |
|-----------|--------|-------------|
| **List Release Reports** | `GET` | List generated report files (supports pagination & returnAll) |
| **Configure Release Report** | `POST / PUT` | Create **or** update preferences — columns, frequency, SFTP delivery |
| **Get Release Report Config** | `GET` | Read the current configuration for your account |
| **Download Release Report** | `GET` | Download a specific report file as CSV |

### 📊 Reporting — Settlement Reports

| Operation | Method | Description |
|-----------|--------|-------------|
| **List Settlement Reports** | `GET` | List generated settlement report files |
| **Configure Settlement Report** | `POST / PUT` | Create **or** update preferences — columns, frequency, SFTP delivery |
| **Get Settlement Report Config** | `GET` | Read the current configuration for your account |
| **Download Settlement Report** | `GET` | Download a specific settlement report file as CSV |

> **💡 Smart configure:** The Configure operations are _upsert_ — they automatically create the config if it doesn't exist yet, or update it if it does. No need to know what state you're in.

---

## 🚀 Quick start

### 1. Install the node

In your n8n instance go to **Settings → Community Nodes → Install** and enter:

```
@mercadopago/n8n-nodes-mercadopago
```

### 2. Set up your credential

1. In n8n go to **Credentials → New** → search for **MercadoPago API**
2. Paste your **Access Token** (found in the [Mercado Pago Developer Portal](https://www.mercadopago.com.br/developers))
3. Click **Test credential** — you'll get a green ✅ if it's valid

> **Optional — SFTP delivery:** If you want reports delivered automatically to an SFTP server, create a **MercadoPago SFTP** credential with the connection details and attach it to the node.

### 3. Build your first workflow

```
Trigger → MercadoPago (Create Payment Link) → Send email with payment URL
```

```
Schedule → MercadoPago (List Release Reports) → Filter → Save to Google Sheets
```

---

## 📋 Operation details

<details>
<summary><strong>💳 Create Payment Link</strong></summary>

Creates a [Checkout Preference](https://www.mercadopago.com.br/developers/en/reference/preferences/_checkout_preferences/post) — a hosted payment page with your items.

**Required:**
- At least one **Item** (title, quantity, currency, unit price)

**Optional fields:**
- `external_reference` — your internal order ID (max 64 chars)
- `notification_url` — HTTPS webhook for payment status updates
- `back_urls` — redirect URLs for success / pending / failure
- `auto_return` — auto-redirect after approved payment
- `expiration_date_from` / `expiration_date_to` — limit when the link is valid
- `statement_descriptor` — text on the buyer's bank statement (max 13 chars)
- `binary_mode` — only approved/rejected (no pending)

</details>

<details>
<summary><strong>📊 Configure Release Report</strong></summary>

Sets up automatic Release Report generation for your account. Works as an **upsert** — safe to run multiple times.

**Required:**
- **Columns** — at least one column key (e.g. `DATE`, `SOURCE_ID`, `NET_CREDIT_AMOUNT`)
- **File Name Prefix** — prefix for generated file names
- **Frequency** — hour (0–23), interval value, and type (`daily` / `weekly` / `monthly`)

**Optional:**
- SFTP credential for automatic file delivery
- `separator`, `display_timezone`, `report_translation`
- Email notification list
- Boolean flags: `include_withdrawal_at_end`, `check_available_balance`, `compensate_detail`, `execute_after_withdrawal`, `scheduled`

</details>

<details>
<summary><strong>📊 Configure Settlement Report</strong></summary>

Same as Configure Release Report but for Settlement Reports. Supports a different set of columns and fewer boolean flags.

</details>

<details>
<summary><strong>⬇️ Download Report (Release or Settlement)</strong></summary>

Downloads a generated report file by name.

- Returns a JSON object with a `content` field containing the raw CSV string
- Pipe this into a **Write Binary File** node or a **Code** node to process it

</details>

---

## 🔐 Credentials

### MercadoPago API _(required)_

| Field | Description |
|-------|-------------|
| **Access Token** | Your Bearer token from the Mercado Pago Developer Portal |

Get your token at: [mercadopago.com.br/developers → Your integrations → Credentials](https://www.mercadopago.com.br/developers)

### MercadoPago SFTP _(optional)_

Only needed if you configure SFTP delivery for reports.

| Field | Description |
|-------|-------------|
| **Server** | SFTP hostname or IP |
| **Username** | SFTP login |
| **Password** | SFTP password (stored encrypted) |
| **Remote Dir** | Destination directory on the SFTP server |
| **Port** | Default: 22 |

---

## 🏗️ Architecture

The node follows a modular handler pattern where each operation lives in its own file.

```
credentials/
  MercadoPagoApi.credentials.ts    ← API access token credential
  MercadoPagoSftp.credentials.ts   ← Optional SFTP credential

nodes/MercadoPago/
  MercadoPago.node.ts              ← Node definition, UI properties, request wrapper
  MercadoPago.node.json            ← Metadata (categories, docs links)
  icon-mercadopago.svg
  icon-mercadopago.dark.svg
  operations/
    index.ts                       ← Handler registry + shared types (HandlerCtx)
    utils.ts                       ← Shared parsing helpers
    createPaymentLink.ts
    listReleaseReports.ts
    configureReleaseReport.ts      ← Upsert: POST → fallback PUT on 409
    getReleaseReportConfig.ts
    downloadReleaseReport.ts
    listSettlementReports.ts
    configureSettlementReport.ts   ← Upsert: POST → fallback PUT on 409
    getSettlementReportConfig.ts
    downloadSettlementReport.ts

tests/operations/                  ← Vitest unit tests (one per operation)
```

**How operations work:**

```
execute() in MercadoPago.node.ts
  └── builds HandlerCtx (credential, request wrapper, helpers)
  └── dispatches to operations[operationName](ctx)
      └── handler validates input → builds body → calls ctx.request()
          └── makeRequest() adds Auth header, handles httpRequest
```

---

## 🛠️ Development

### Prerequisites
- Node.js >= 20.15
- npm

### Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript → dist/
npm run test:unit    # Run unit tests once
npm run test         # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint         # ESLint
npm run format       # Prettier
```

### Adding a new operation

1. Create `nodes/MercadoPago/operations/myOperation.ts`
2. Implement the handler using `HandlerCtx`
3. Register it in `operations/index.ts`
4. Add UI properties to `MercadoPago.node.ts`
5. Write tests in `tests/operations/myOperation.test.ts`

---

## 🤝 Contributing

Contributions are welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md) to learn about the development process, branching model, and how to submit a pull request.

---

## 📄 License

[MIT](LICENSE) — maintained by the **Tech Stuff IXF** team at Mercado Pago.
