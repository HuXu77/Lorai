# Lorcana Engine & AI Simulator

A comprehensive Lorcana TCG game engine with AI opponent and web interface.

## Features
- Complete game engine with 3297 passing tests (100% test coverage)
- AI bot opponent with heuristic-based decision making
- Web-based game interface built with Next.js
- Full card database with 2455+ cards
- Automated ability parsing and execution

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

### Deployment

This project is optimized for deployment on **Vercel**:

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Deploy automatically!

**Build command**: `npm run next:build`  
**Output directory**: `.next`

## Testing
- Total tests: 3297/3297 passing
- Engine tests: `npm run test:engine`
- Parser tests: `npm run test:parser`
- Full suite: `npm test`

## Tech Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Testing**: Jest
- **UI**: React + Tailwind CSS
- **AI**: Custom heuristic bot

## Project Structure
```
src/
├── app/           # Next.js app router pages
├── engine/        # Core game engine
├── ai/            # Bot AI logic
├── tests/         # Test suite
└── components/    # React components
```

## Live Demo
🎮 [Play the game](#) _(Coming soon after deployment)_
