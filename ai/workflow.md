# AI Workflow — GitHub Issue Test Generation

## Trigger

The user provides a GitHub Issue ID. Kiro executes the following steps.

---

## Steps

1. Read the GitHub Issue using GitHub MCP.
   - Repository: `aryaskumar-spec/ClientApp` (from `config/github.yml`)
   - Retrieve: title, description, comments, labels, acceptance criteria.

2. Run HIPAA validation using `ai/prompts/hipaa.prompt.md`.
   - If BLOCKED: stop immediately and report the reason. Do not generate any files.
   - If SAFE: continue.

3. Inspect the existing framework.
   - Read `pages/client/` to discover all existing Page Objects.
   - Read `pages/client/clientSitePageManager.ts` to understand which pages are registered.
   - Read `tests/client/` to understand existing test patterns.
   - Read `utils/fixture.ts` to understand the custom `test` fixture and `TestData` shape.
   - Read `utils/testUsers.ts` to understand `siteConfig`.

4. Determine which Page Objects are needed based on the issue.
   - Reuse existing Page Objects from `pages/client/` wherever possible.
   - Only generate a new Page Object if no suitable one exists.
   - New Page Objects go under `generated/pages/`.

5. Generate missing Page Objects following `ai/prompts/framework.prompt.md`.
   - Follow the conventions in `.kiro/steering/page-object-guidelines.md`.
   - Follow locator strategy from `.kiro/steering/locator-strategy.md`.
   - Follow coding standards from `.kiro/steering/coding-standards.md`.

6. Generate Playwright test file(s) following `ai/prompts/testcase.prompt.md`.
   - One `.spec.ts` file per test scenario derived from the acceptance criteria.
   - Save under `generated/tests/`.

7. Save generated files under `generated/` as described above.

8. Present a summary (see Step 7 above).

9. The `validate-generated-tests` hook fires automatically after Step 7:
   - Runs `npm run gen:validate` to validate generated tests (up to 3 self-correction attempts)
   - If all tests pass: creates branch `generated-tests/issue-<N>`, commits generated files, opens a PR against `main`
   - If tests cannot be fixed after 3 attempts: reports to the user and stops — no PR is created

---

## Hard Rules

- Never modify any file under `pages/`, `tests/`, or `utils/`.
- Never write generated files anywhere other than `generated/pages/` or `generated/tests/`.
- Never skip HIPAA validation.
