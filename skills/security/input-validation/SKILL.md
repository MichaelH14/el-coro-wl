---
name: input-validation
description: Use when validating user input, defining Zod or joi schemas, sanitizing data at API boundaries, or handling file upload validation
---

# Input Validation

Validate all input at the boundary. Reject first, process second. Never trust client data.

## Preconditions

- Validation library available (Zod preferred, joi acceptable)
- Input sources identified (request body, query params, headers, file uploads)
- Error response format defined (see api-design skill)

## Steps

### 1. Validate at the Boundary

Every request handler starts with validation:

```typescript
import { z } from 'zod';

const CreateTicketSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  product: z.enum(['lottery_bot', 'product-name', 'kaon']),
});

// In handler:
const result = CreateTicketSchema.safeParse(req.body);
if (!result.success) {
  return res.status(422).json({ error: formatZodError(result.error) });
}
const validated = result.data; // type-safe from here
```

### 2. Reject-First Pattern

Order of operations:
1. Parse raw input (JSON.parse, multipart, etc.)
2. Validate schema (type, format, constraints)
3. Sanitize (trim, normalize, escape)
4. Authorize (does this user have permission?)
5. Process (business logic uses only validated data)

If any step fails: reject immediately with clear error. Do not continue to the next step.

### 3. Common Validations

| Field Type | Rules |
|-----------|-------|
| Email | z.string().email() |
| Phone | z.string().regex(/^\+?[1-9]\d{7,14}$/) |
| URL | z.string().url() |
| ID | z.string().uuid() or z.number().int().positive() |
| Pagination | z.number().int().min(1).max(100).default(20) |
| Free text | z.string().max(length).transform(sanitize) |
| Date | z.string().datetime() or z.coerce.date() |

### 4. Sanitization

After validation, sanitize:
- **Trim** whitespace from strings
- **Normalize** unicode (NFC form)
- **Escape** HTML entities if storing user text that will be rendered
- **Strip** null bytes and control characters

```typescript
function sanitize(input: string): string {
  return input
    .trim()
    .normalize('NFC')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}
```

### 5. File Upload Validation

For any file upload:
- **Type**: check MIME type AND file signature (magic bytes), not just extension
- **Size**: enforce max size server-side (do not rely on client limit)
- **Name**: sanitize filename, strip path traversal (`../`)
- **Content**: scan for embedded scripts in images (SVG XSS)
- **Storage**: never store in web-accessible directory with original name

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
```

### 6. Query Parameter Validation

GET requests need validation too:
```typescript
const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', '-created_at', 'name']).default('-created_at'),
  status: z.enum(['open', 'closed', 'all']).optional(),
});
```

## Verification / Exit Criteria

- Every endpoint has a Zod/joi schema for its input
- Validation happens before any business logic
- File uploads checked by MIME type AND magic bytes
- No raw user input reaches database queries
- Error responses include field-level details
- Query parameters validated (not just body)
