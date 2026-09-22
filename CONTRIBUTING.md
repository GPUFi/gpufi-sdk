# Contributing to GPUFi SDK

Thank you for your interest in contributing to the **GPUFi Protocol SDK**!

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GPUFi/gpufi-sdk.git
   cd gpufi-sdk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build library:**
   ```bash
   npm run build
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Typecheck:**
   ```bash
   npm run typecheck
   ```

## Contribution Guidelines

- **Zero Secret Rule**: Pull requests must never commit secret keys, API keys, private keys, or credentials.
- **Code Style**: Use modern TypeScript, explicit typing, and complete documentation comments (TSDoc).
- **Tests**: Any new feature or bug fix must include corresponding tests in `tests/`.
- **Commit Messages**: Follow Conventional Commits specification:
  - `feat: add claimBatch validation helper`
  - `fix: correct epoch duration calculation`
  - `docs: update quickstart instructions`

## Pull Request Process

1. Fork the repo and create a feature branch (`git checkout -b feat/my-improvement`).
2. Make your changes with clear commit messages.
3. Verify that `npm run build` and `npm test` pass with 0 errors.
4. Open a Pull Request against the `main` branch with a thorough summary of changes.
