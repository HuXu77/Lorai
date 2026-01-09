---
description: Verify changes before pushing (Lint, Build, Test)
---

Always run these steps before pushing changes to ensure the codebase is stable and buildable.

1. **Verify Build & Types**
   Run the Next.js build to check for type errors and build issues.
   ```bash
   npm run next:build
   ```

2. **Run Tests**
   Ensure all tests pass.
   ```bash
   npm test
   ```

3. **Check Linting (Optional)**
   If you have a specific lint script, run it. Otherwise, the build step usually covers type checking.
