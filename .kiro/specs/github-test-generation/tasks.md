# Implementation Plan: GitHub Issue Test Generation

## Overview

Set up the environment so that providing a GitHub Issue ID to Kiro triggers the full generation
workflow: retrieve issue → HIPAA check → inspect framework → reuse/generate Page Objects →
generate tests → save under `generated/`. No custom orchestration code. Kiro does all of this
natively using GitHub MCP, prompt files, and steering documents.

---

## Tasks

- [x] 1. Fix path references in `ai/workflow.md`
  - Corrected `src/pages/` → `pages/client/` to match the real project layout
  - Added explicit inspection step for `clientSitePageManager.ts`
  - Added hard rules section (never write outside `generated/`)
  - _Requirements: 3.1, 3.2, 3.6_

- [x] 2. Fix path references in `ai/prompts/project-context.prompt.md`
  - Replaced all `src/pages/`, `src/tests/` with correct paths (`pages/client/`, `tests/client/`)
  - Added exact import paths that generated tests must use
  - Added `PageManager` usage pattern with real getter names
  - Added fixture shape (`page`, `data`) and test data import patterns
  - _Requirements: 3.1, 5.1, 5.2, 5.3_

- [x] 3. Fix `ai/prompts/framework.prompt.md`
  - Removed "Return JSON only" instruction — Kiro writes files directly, not via JSON parsing
  - Fixed Page Object structure: `readonly` (not `private readonly`) to match real framework
  - Added locator priority order matching `.kiro/steering/locator-strategy.md`
  - Added explicit file save locations table
  - _Requirements: 4.1, 4.2, 5.3_

- [x] 4. Fix `ai/prompts/testcase.prompt.md`
  - Removed "Return JSON only" instruction
  - Added actual import paths (`../../utils/fixture`, `../../pages/client/clientSitePageManager`)
  - Added a concrete example generated test showing the exact pattern
  - Added summary output format Kiro should present after generation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5. Add `.gitkeep` files to `generated/pages/` and `generated/tests/`
  - Ensures both directories are tracked by git and exist after a fresh clone
  - _Requirements: 4.2, 5.4_

- [ ] 6. Verify GitHub MCP connectivity
  - In Kiro, confirm the `github` MCP server is connected (green status in MCP panel)
  - Confirm `autoApprove` includes `get_issue` so retrieval doesn't prompt for approval
  - Test: ask Kiro to retrieve any known issue from `aryaskumar-spec/ClientApp` and confirm it returns title + description
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 7. Run an end-to-end generation with a real GitHub Issue ID
  - Provide a GitHub Issue ID to Kiro
  - Confirm Kiro reads `ai/workflow.md` and follows all 7 steps in order
  - Confirm HIPAA validation runs and returns SAFE
  - Confirm Kiro inspects `pages/client/` before generating
  - Confirm existing Page Objects are reused — no duplicates created
  - Confirm any missing Page Objects are generated under `generated/pages/`
  - Confirm test file is generated under `generated/tests/`
  - _Requirements: 1.1, 2.1, 2.4, 3.1, 3.5, 4.1, 4.2, 5.1, 5.4_

- [ ] 8. Verify generated Page Objects match framework conventions
  - `readonly page: Page` is the first property
  - Static locators are `readonly` properties set in `constructor`
  - Dynamic locators are synchronous methods returning `Locator`
  - Navigation method is named `goToSite()`
  - Assertion methods are prefixed `verify` and are `async`
  - No `page.waitForTimeout()`, no hardcoded data, no `test()` blocks
  - _Requirements: 5.1, 5.3_

- [ ] 9. Verify generated test file matches framework conventions
  - Imports `test` from `../../utils/fixture` (not from `@playwright/test`)
  - Imports `expect` from `@playwright/test`
  - Imports `PageManager` from `../../pages/client/clientSitePageManager`
  - Uses `new PageManager(page)` and calls getter methods only
  - No inline `page.locator()` inside the test body
  - At least one `expect()` assertion per test
  - No `page.waitForTimeout()`
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 10. Confirm handwritten files are untouched
  - Check that no file under `pages/`, `tests/`, or `utils/` was modified
  - `git status` should show zero changes to those directories
  - _Requirements: 3.6, 4.3_

- [ ] 11. Run the generated test to confirm it executes
  - Run: `npx playwright test generated/tests/ --config playwright.config.ts`
  - Confirm the test is discovered and runs without import errors or TypeScript errors
  - A test failure due to a legitimate UI assertion is acceptable — import/compile errors are not
  - _Requirements: 5.1, 5.3, 5.4_

---

## Notes

- Tasks 1–5 are already completed — the fixes have been applied to the prompt files and workflow.
- Kiro is the orchestration engine. The prompt files and steering documents are its instructions.
- When calling Kiro, say: "Generate a Playwright test from GitHub Issue #<id>" — Kiro will follow `ai/workflow.md`.
- All generated artifacts go to `generated/pages/` and `generated/tests/` only.
- HIPAA validation is a hard gate — if the issue contains PHI, Kiro stops and reports the reason.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2", "3", "4", "5"] },
    { "id": 1, "tasks": ["6"] },
    { "id": 2, "tasks": ["7"] },
    { "id": 3, "tasks": ["8", "9", "10"] },
    { "id": 4, "tasks": ["11"] }
  ]
}
```
