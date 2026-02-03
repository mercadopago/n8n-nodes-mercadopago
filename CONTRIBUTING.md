# Contributing to n8n-node-mercadopago

Thank you for your interest in contributing to the MercadoPago node for n8n! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

This project adheres to a standard of respect and inclusivity. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (n8n version, node version, OS)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:

- A clear, descriptive title
- Detailed description of the proposed feature
- Any relevant examples or mockups
- Explanation of why this feature would be useful

### Pull Requests

All pull requests must be reviewed and approved by the code owners before being merged.

#### Branching model

We follow a simple GitFlow-like workflow:

1. Create feature branches from `develop` (e.g. `feature/my-change`, `fix/bug-123`)
2. Open PRs from your feature branch into `develop`
3. To release stable changes, open a PR from `develop` into `master`

Direct merges/pushes to `develop` or `master` should be avoided.

Follow these steps to submit a pull request:

1. Fork the repository
2. Create a new branch from `develop`
3. Make your changes
4. Write or update tests for the changes
5. Ensure all tests pass with `npm run test`
6. Commit your changes following conventional commit guidelines
7. Push to your fork
8. Submit a pull request to the `develop` branch

### Development Workflow

1. Clone your fork: `git clone https://github.com/YOUR_USERNAME/n8n-nodes-mercadopago.git`
2. Install dependencies: `npm install`
3. Make your changes
4. Build the project: `npm run build`
5. Run tests: `npm run test`

## Coding Standards

- Follow the existing code style
- Write clear, descriptive commit messages
- Include tests for new functionality
- Update documentation as needed
- Keep PRs focused on a single change

## Testing

- All new features and bug fixes should include tests
- Run the existing test suite with `npm run test` before submitting a PR
- Aim for high test coverage

## Documentation

- Update the README.md if your changes affect the user-facing functionality
- Comment your code where necessary
- Include JSDoc comments for new functions and classes

## Review Process

1. All PRs will be reviewed by the code owners
2. Feedback must be addressed before a PR can be merged
3. Once approved, the PR will be merged by the maintainer

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

Thank you for contributing to make this n8n node better!
