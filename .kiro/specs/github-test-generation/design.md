# Design Document

## Overview

The GitHub Issue Test Generation feature enables Kiro to automatically generate Playwright automation directly from a GitHub Issue.

The user provides only a GitHub Issue ID. Kiro retrieves the issue using GitHub MCP, validates the issue against HIPAA compliance rules, inspects the existing Playwright framework, reuses existing Page Objects whenever possible, generates missing Page Objects, creates Playwright test scripts, and stores generated artifacts under the `generated/` directory.

The feature is designed to preserve handwritten automation while allowing AI-generated artifacts to be reviewed independently before adoption.

---

## Architecture

### High-Level Flow

```text
User
 │
 ▼
Provide GitHub Issue ID
 │
 ▼
GitHub MCP
 │
 ▼
Retrieve GitHub Issue
 │
 ▼
Load Steering Documents
 │
 ▼
Load Prompt Files
 │
 ├── framework.prompt.md
 ├── project-context.prompt.md
 ├── hipaa.prompt.md
 └── testcase.prompt.md
 │
 ▼
HIPAA Validation
 │
 ▼
Inspect Existing Framework
 │
 ▼
Reuse Existing Page Objects
 │
 ▼
Generate Missing Page Objects
 │
 ▼
Generate Playwright Tests
 │
 ▼
generated/pages/
generated/tests/
 │
 ▼
Generation Summary
```

### Design Principles

- Kiro acts as the orchestration engine.
- GitHub MCP provides GitHub Issue data.
- Steering documents define framework standards.
- Prompt files provide AI generation instructions.
- Existing framework code is never modified.
- Generated artifacts are isolated under `generated/`.

---

## Components and Interfaces

### Component: GitHub MCP

**Responsibilities**

- Retrieve GitHub Issues
- Retrieve comments
- Retrieve labels
- Retrieve acceptance criteria

**Input**

GitHub Issue ID

**Output**

GitHub Issue Details

---

### Component: Steering Documents

**Responsibilities**

Provide framework standards including:

- Coding standards
- Folder structure
- Naming conventions
- Page Object guidelines

---

### Component: Prompt Files

Location

```text
ai/prompts/
```

| Prompt | Responsibility |
|---------|----------------|
| framework.prompt.md | Framework rules |
| project-context.prompt.md | Project information |
| hipaa.prompt.md | HIPAA validation |
| testcase.prompt.md | Test generation |

---

### Component: Existing Framework

Reads

```text
pages/
tests/
utils/
fixtures/
```

Responsibilities

- Discover reusable Page Objects
- Discover reusable utilities
- Prevent duplicate generation

---

### Component: Generated Artifacts

Writes

```text
generated/pages/
generated/tests/
```

Responsibilities

- Create missing Page Objects
- Create Playwright tests

---

## Data Models

### GitHub Issue

| Field | Description |
|--------|-------------|
| id | GitHub Issue ID |
| title | Issue title |
| description | Issue description |
| comments | GitHub comments |
| labels | GitHub labels |
| acceptanceCriteria | Acceptance criteria |

---

### Generation Result

| Field | Description |
|--------|-------------|
| reusedPages | Existing Page Objects reused |
| generatedPages | Newly generated Page Objects |
| generatedTests | Generated Playwright tests |
| hipaaStatus | SAFE or BLOCKED |
| summary | Generation summary |

---

### Generated Artifact

| Field | Description |
|--------|-------------|
| type | Page Object or Test |
| path | Generated file path |
| status | Generated / Reused |

---

## Correctness Properties

The implementation shall satisfy the following properties.

### Framework Preservation

Handwritten framework files are never modified.

---

### Page Object Reuse

Existing Page Objects are always preferred over generating new ones.

---

### Isolation

All generated files are written only under:

```text
generated/
```

---

### Compliance

Automation generation is permitted only after HIPAA validation succeeds.

---

### Consistency

Generated automation follows:

- Steering documents
- Prompt files
- Existing framework conventions

---

## Error Handling

| Error | Expected Behaviour |
|--------|--------------------|
| GitHub Issue not found | Stop generation and notify the user |
| GitHub MCP unavailable | Stop generation |
| HIPAA validation failed | Abort generation |
| Prompt file missing | Display configuration error |
| Steering document missing | Continue with warning |
| Existing Page Object cannot be parsed | Continue and generate a new Page Object |

---

## Testing Strategy

### Unit Testing

Validate:

- Prompt loading
- Framework inspection
- HIPAA validation

---

### Integration Testing

Verify:

- GitHub MCP connectivity
- Prompt loading
- Steering loading

---

### End-to-End Testing

Execute the complete workflow.

1. Retrieve GitHub Issue.
2. Validate HIPAA.
3. Inspect framework.
4. Generate Page Objects.
5. Generate Playwright tests.
6. Verify generated files exist under `generated/`.

---

### Acceptance Testing

The feature is considered complete when:

- GitHub Issue is successfully retrieved.
- HIPAA validation succeeds.
- Existing Page Objects are reused.
- Missing Page Objects are generated.
- Playwright tests are generated.
- Generated artifacts are saved under `generated/`.
- No handwritten framework files are modified.