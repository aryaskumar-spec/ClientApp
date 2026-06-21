# Utilities

The `utils/` directory is flat (no subdirectories). Each file has one responsibility.

## `testUsers.ts` — Single Source of Truth for Config

All base URLs, worker counts, login endpoints, and credentials live here. Nothing else in the framework duplicates these values.

```typescript
export interface TestUser { username: string; password: string; userId?: string; }

export interface SiteConfig {
    name: string;         // matches folder names: pages/{name}/, tests/{name}/, storage/{name}/
    baseURL: string;
    apiBaseURL: string;   // must end with trailing slash
    loginEndpoint: string;
    users: TestUser[];    // one entry per worker
    workers: number;      // must be ≤ users.length
}
```

Rules:
- `siteConfig.workers` ≤ `siteConfig.users.length` — always
- `apiBaseURL` ends with `/` — `ApiUtils` appends paths directly: `` `${siteConfig.apiBaseURL}order/create-order` ``
- To add capacity: append a user to `users[]` and increment `workers`

## `fixture.ts` — Custom Test Fixture

Exports a custom `test` with `page` (authenticated) and `data` (typed test data). See `fixtures.md`.

## `ApiUtils.ts` — API Request Wrapper

Class for all HTTP calls. See `api-guidelines.md`.

## `storageHelper.ts` — Storage State Reader

Reads `token` and `userId` from `storage/client/user-N.json`. Used only by `ApiUtils` and `global-setup.ts`.

```typescript
getTokenFromStorage(workerIndex: number): string
getUserIdFromStorage(workerIndex: number): string
```

Both apply `workerIndex % siteConfig.workers` internally. Throws with a clear error if the value is missing — do not catch and suppress.

**Do not import `storageHelper` in tests or page objects.** Go through `ApiUtils` instead.

## Data JSON Files

See `test-data-management.md` for full data source documentation. Quick reference:

| File | Shape | Use |
|---|---|---|
| `clientSiteSingleData.json` | Object | `import data from '...'` — one test |
| `clientSiteMultipleData.json` | Array | `import dataSet from '...'` + `for...of` |

Both files use the same keys as the `data` fixture in `fixture.ts`.

## `jsFiles/excelSheetActions.js`

Not part of the test framework. A standalone Node.js script (`require`-based, hardcoded paths) for Excel manipulation. Run directly with `node jsFiles/excelSheetActions.js`. Do not import from it.

## Adding New Utilities

| Type | Naming | Export |
|---|---|---|
| API helper | `{Name}Utils.ts` | `export class` |
| Helper functions | `{name}Helper.ts` | `export function` |
| Config/constants | `{name}.ts` | `export const` |
| Test data (single) | `clientSite{Name}Data.json` | JSON default |
| Test data (multi) | `clientSite{Name}MultipleData.json` | JSON default array |

Keep `utils/` flat. Do not add subdirectories.
