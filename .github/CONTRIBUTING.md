# Contributing to BrightSide

Thank you for your interest in contributing to BrightSide! We believe hope is a practice, not a feeling — and the same goes for great software.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check the existing issues. When creating a bug report, include:

- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (browser, OS, node version)

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Clear use case** — who benefits and how?
- **Description** of the proposed feature
- **Mockups or examples** if applicable
- **Willingness to implement** — are you offering to build it?

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Run `npm run check` before committing — it must pass with zero errors
3. Follow the existing code style and conventions
4. Write clear, concise commit messages
5. Reference any related issues in your PR description

## Development Setup

```bash
npm install
npm run db:push
npm run dev      # Starts at http://localhost:3000
npm run check    # Type-check all TypeScript
npm run build    # Production build
```

## Code Style

- **TypeScript**: Strict mode enabled. No `any` types.
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Colors**: Always use the design token system (e.g., `text-coral`, `bg-peach`)
- **Imports**: Use `@/` path aliases for internal modules

## Questions?

Open a [Discussion](https://github.com/mahidulislamnakib/BrightSide/discussions) or reach out via email.
