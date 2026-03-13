# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-13

### Added
- Hybrid SFTP credential system with flexible authentication (password, private key, or both)
- Password masking in SFTP credential UI for improved security

### Changed
- SFTP port default set to 0 (defers to credential value instead of hardcoded default)

### Security
- Updated devDependencies to fix known vulnerabilities (minimatch, rollup, ajv, eslint-plugin-n8n-nodes-base)

## [0.1.0] - 2025-10-02

### Added
- Initial release of n8n-nodes-mercadopago
- Payment operations:
  - Create Payment Link (Preferences)
- Reporting operations:
  - Release Reports: List, Configure, Edit Config, Get Config, Download
  - Settlement Reports: List, Configure, Edit Config, Get Config, Download
- MercadoPago API credentials support
- Comprehensive test suite with Vitest
- TypeScript support
- ESLint and Prettier configuration
- Documentation (README.md, CONTRIBUTING.md)
- MIT License

[0.2.0]: https://github.com/mercadopago/n8n-nodes-mercadopago/releases/tag/v0.2.0
[0.1.0]: https://github.com/mercadopago/n8n-nodes-mercadopago/releases/tag/v0.1.0
