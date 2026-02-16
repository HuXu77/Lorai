---
description: Verify changes before pushing (Lint, Build, Test)
---

Always run these steps before pushing changes to ensure the codebase is stable and buildable.

1. **Verify Production Build (Mandatory)**
   Run the full production build to catch type errors and ESLint issues.
   ```bash
   npm run build
   ```
   *Note: This catches `react/no-unescaped-entities` and other build-time errors that `dev` mode misses.*

2. **Run Tests**
   Ensure all tests pass.
   ```bash
   npm test
   ```

3. **Check Linting (Optional)**
   Running `npm run lint` explicitly can catch issues faster than the full build, but always do a full build before pushing.
