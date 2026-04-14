---
name: api-design
description: Use when designing REST APIs, choosing HTTP methods, defining resource naming, or implementing pagination, filtering, or versioning
---

# API Design

RESTful API conventions. Consistent, predictable, well-documented.

## Preconditions

- Resource entities identified from data model
- Authentication method chosen (JWT default)
- Base URL and versioning strategy decided

## Steps

### 1. Resource Naming

- Plural nouns: `/users`, `/draws`, `/tickets`
- Nested for relationships: `/users/:id/tickets`
- No verbs in URLs (HTTP method carries the action)
- Kebab-case for multi-word: `/lottery-draws`, `/support-tickets`
- Max 2 levels of nesting (`/users/:id/tickets` ok, `/users/:id/tickets/:id/comments` -- flatten to `/tickets/:id/comments`)

### 2. HTTP Methods

| Method | Purpose | Idempotent | Body |
|--------|---------|------------|------|
| GET | Read resource(s) | Yes | No |
| POST | Create resource | No | Yes |
| PUT | Full replace | Yes | Yes |
| PATCH | Partial update | Yes | Yes |
| DELETE | Remove resource | Yes | No |

### 3. Status Codes

| Code | When |
|------|------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Bad request (validation failed) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (valid token, no permission) |
| 404 | Not found |
| 409 | Conflict (duplicate, race condition) |
| 422 | Unprocessable entity (valid JSON, invalid semantics) |
| 429 | Rate limited |
| 500 | Server error (never intentional) |

### 4. Response Format

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

Errors:
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Human readable message",
    "details": [{ "field": "email", "issue": "required" }]
  }
}
```

### 5. Pagination

Cursor-based for large datasets:
```
GET /draws?cursor=abc123&limit=20
```

Offset-based for admin/dashboard:
```
GET /draws?page=2&per_page=20
```

Always return pagination metadata in response.

### 6. Filtering and Sorting

```
GET /tickets?status=open&severity=critical&sort=-created_at
```

- Filter by query params matching field names
- Sort with `-` prefix for descending
- Multiple sort fields comma-separated: `sort=-severity,created_at`

### 7. Versioning

URL prefix: `/api/v1/...`

- Bump major version only for breaking changes
- Additive changes (new fields, new endpoints) do NOT require version bump
- Support previous version for minimum 6 months after deprecation

## Verification / Exit Criteria

- All endpoints follow REST conventions (no verbs in URLs)
- Consistent response format across all endpoints
- Error responses include machine-readable code + human message
- Pagination present on all list endpoints
- Status codes match the documented table
