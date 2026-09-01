---
name: OpenAPI numeric schemas
description: Compatibility note for contract-first numeric fields in this workspace
---

Use `number` rather than `integer` for numeric fields in the OpenAPI contract when the generated Zod package resolves to Zod 3.

**Why:** The current Orval output uses `zod.int()`, which is a Zod 4 API and causes the workspace library typecheck to fail.

**How to apply:** If the workspace upgrades to Zod 4, re-evaluate this constraint before changing existing API schemas.