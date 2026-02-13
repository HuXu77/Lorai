# Lorcana Engine & AI Simulator

A comprehensive Lorcana TCG game engine with AI opponent and web interface.

## Features
- Complete game engine with extensive test coverage (>3000 tests)
- AI bot opponent with heuristic-based decision making
- Web-based game interface built with Next.js
- Full card database with 2455+ cards
- Automated ability parsing and execution
- CLI for game simulations and debugging

## Getting Started

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

### Testing

This project uses **Vitest** for unit/integration testing and **Playwright** for E2E testing.

```bash
# Run full test suite
npm test

# Run engine tests (fast)
npm run test:engine

# Run parser tests
npm run test:parser

# Run ability executor tests
npm run test:executor

# Run E2E tests
npm run test:e2e
```

### Deployment

This project is optimized for deployment on **Vercel**:

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Deploy automatically!

**Build command**: `npm run next:build`  
**Output directory**: `.next`

## Tech Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Testing**: Vitest, Playwright
- **UI**: React + Tailwind CSS
- **AI**: Custom heuristic bot

## Project Structure
```
src/
├── app/           # Next.js app router pages
├── engine/        # Core game engine logic
├── ai/            # Bot AI logic
├── components/    # React components
├── controllers/   # Game controllers
├── cli/           # CLI tools and scripts
├── scripts/       # Utility scripts
├── hooks/         # React hooks
├── types/         # TypeScript type definitions
├── utils/         # Helper utilities
└── tests/         # Test suite (unit, integration, e2e)
```

## Live Demo
🎮 [Play the game](https://lorai-self.vercel.app/)
